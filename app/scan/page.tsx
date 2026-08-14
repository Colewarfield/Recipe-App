'use client'

import { useState } from 'react'
import Link from 'next/link'
import { scanRecipe, type ScannedRecipe } from './actions'
import { createRecipe } from '../actions'

const CATEGORIES = ['Breakfast', 'Lunch', 'Dinner', 'Dessert', 'Snacks', 'Drinks']

async function compressImage(file: File, maxWidth = 1400, quality = 0.82): Promise<File> {
  try {
    const bitmap = await createImageBitmap(file)
    const scale = Math.min(1, maxWidth / bitmap.width)
    const w = Math.round(bitmap.width * scale)
    const h = Math.round(bitmap.height * scale)
    const canvas = document.createElement('canvas')
    canvas.width = w
    canvas.height = h
    const ctx = canvas.getContext('2d')
    if (!ctx) return file
    ctx.drawImage(bitmap, 0, 0, w, h)
    const blob: Blob | null = await new Promise(res =>
      canvas.toBlob(b => res(b), 'image/jpeg', quality)
    )
    if (!blob) return file
    return new File([blob], file.name.replace(/\.[^.]+$/, '') + '.jpg', { type: 'image/jpeg' })
  } catch {
    return file
  }
}

export default function ScanPage() {
  const [images, setImages] = useState<File[]>([])
  const [scanning, setScanning] = useState(false)
  const [error, setError] = useState('')
  const [scanned, setScanned] = useState(false)

  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('Dinner')
  const [ingredients, setIngredients] = useState('')
  const [steps, setSteps] = useState('')
  const [notes, setNotes] = useState('')

  async function handleScan() {
    if (images.length === 0) return
    setScanning(true)
    setError('')
    try {
      const compressed = await Promise.all(images.map(f => compressImage(f)))
      const formData = new FormData()
      compressed.forEach((img, i) => formData.append('image' + i, img))
      const result: ScannedRecipe = await scanRecipe(formData)
      setTitle(result.title)
      setCategory(result.category)
      setIngredients(result.ingredients.join('\n'))
      setSteps(result.steps.join('\n'))
      setNotes(result.notes)
      setScanned(true)
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Failed to scan'
      setError(msg)
    } finally {
      setScanning(false)
    }
  }

  function resetScan() {
    setScanned(false)
    setImages([])
    setTitle('')
    setCategory('Dinner')
    setIngredients('')
    setSteps('')
    setNotes('')
    setError('')
  }

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-xl mx-auto">
        <div className="mb-4">
          <Link href="/" className="text-sm text-gray-600 underline">Back</Link>
        </div>
        <h1 className="text-2xl font-bold mb-4">Scan Recipe</h1>

        {!scanned ? (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Upload one or more images of the same recipe (screenshots, cookbook photos, etc.).
              Multiple images get combined.
            </p>

            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => setImages(Array.from(e.target.files || []))}
              className="block w-full text-sm border rounded-lg p-2"
            />

            {images.length > 0 && (
              <>
                <div className="text-sm text-gray-600">
                  {images.length} image{images.length === 1 ? '' : 's'} selected
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {images.map((img, i) => (
                    <div key={i} className="aspect-square border rounded overflow-hidden bg-gray-50">
                      <img
                        src={URL.createObjectURL(img)}
                        alt={'Preview ' + (i + 1)}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </>
            )}

            <button
              type="button"
              onClick={handleScan}
              disabled={scanning || images.length === 0}
              className="w-full px-4 py-3 bg-orange-500 text-white rounded-lg disabled:opacity-50"
            >
              {scanning ? 'Extracting (10-20s)...' : 'Extract Recipe with AI'}
            </button>

            {error && (
              <div className="text-red-600 text-sm p-3 bg-red-50 border border-red-200 rounded">
                {error}
              </div>
            )}
          </div>
        ) : (
          <>
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4 text-sm text-green-800">
              Recipe extracted. Review and edit below, then save.
            </div>

            <form action={createRecipe} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Title</label>
                <input
                  type="text"
                  name="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="w-full px-3 py-2 border rounded"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Category</label>
                <select
                  name="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  required
                  className="w-full px-3 py-2 border rounded"
                >
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Ingredients <span className="text-gray-500 font-normal">(one per line)</span>
                </label>
                <textarea
                  name="ingredients"
                  value={ingredients}
                  onChange={(e) => setIngredients(e.target.value)}
                  rows={8}
                  required
                  className="w-full px-3 py-2 border rounded font-mono text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Steps <span className="text-gray-500 font-normal">(one per line)</span>
                </label>
                <textarea
                  name="steps"
                  value={steps}
                  onChange={(e) => setSteps(e.target.value)}
                  rows={10}
                  required
                  className="w-full px-3 py-2 border rounded text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Notes <span className="text-gray-500 font-normal">(optional)</span>
                </label>
                <textarea
                  name="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border rounded text-sm"
                />
              </div>

              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" name="is_public" defaultChecked />
                Make this public
              </label>

              <button type="submit" className="w-full px-4 py-3 bg-black text-white rounded-lg">
                Save Recipe
              </button>

              <button
                type="button"
                onClick={resetScan}
                className="w-full py-2 text-gray-600 underline text-sm"
              >
                Scan different images
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
