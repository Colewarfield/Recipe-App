'use client'

import { useState } from 'react'
import BackButton from '@/components/BackButton'
import { scanRecipe, scanRecipeFromUrl, type ScannedRecipe } from './actions'
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
  const [url, setUrl] = useState('')
  const [busy, setBusy] = useState<'idle' | 'photos' | 'url'>('idle')
  const [error, setError] = useState('')
  const [scanned, setScanned] = useState(false)

  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('Dinner')
  const [ingredients, setIngredients] = useState('')
  const [steps, setSteps] = useState('')
  const [notes, setNotes] = useState('')

  function applyResult(result: ScannedRecipe) {
    setTitle(result.title)
    setCategory(result.category)
    setIngredients(result.ingredients.join('\n'))
    setSteps(result.steps.join('\n'))
    setNotes(result.notes)
    setScanned(true)
  }

  async function handleImageScan() {
    if (images.length === 0) return
    setBusy('photos')
    setError('')
    try {
      const compressed = await Promise.all(images.map(f => compressImage(f)))
      const formData = new FormData()
      compressed.forEach((img, i) => formData.append('image' + i, img))
      const result = await scanRecipe(formData)
      applyResult(result)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to scan')
    } finally {
      setBusy('idle')
    }
  }

  async function handleUrlScan() {
    if (!url.trim()) return
    setBusy('url')
    setError('')
    try {
      const result = await scanRecipeFromUrl(url.trim())
      applyResult(result)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to import')
    } finally {
      setBusy('idle')
    }
  }

  function resetScan() {
    setScanned(false)
    setImages([])
    setUrl('')
    setTitle('')
    setCategory('Dinner')
    setIngredients('')
    setSteps('')
    setNotes('')
    setError('')
  }

  return (
    <div className="min-h-screen p-4 pb-16">
      <div className="max-w-xl mx-auto">
        <BackButton href="/" />
        <h1 className="text-2xl font-bold mb-4">Scan Recipe</h1>

        {!scanned ? (
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border-2 border-blue-200 dark:border-slate-700">
              <h2 className="text-lg font-semibold mb-2">From photos</h2>
              <p className="text-sm text-stone-600 dark:text-stone-400 mb-3">
                Upload one or more images (screenshots, cookbook photos, etc.). Multiple images from the same recipe get combined.
              </p>

              <input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => setImages(Array.from(e.target.files || []))}
                className="block w-full text-sm border-2 border-blue-100 dark:border-slate-700 rounded-lg p-2 mb-3"
              />

              {images.length > 0 && (
                <>
                  <div className="text-sm text-stone-600 dark:text-stone-400 mb-2">
                    {images.length} image{images.length === 1 ? '' : 's'} selected
                  </div>
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    {images.map((img, i) => (
                      <div key={i} className="aspect-square border rounded-lg overflow-hidden bg-gray-50 dark:bg-slate-700">
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
                onClick={handleImageScan}
                disabled={busy !== 'idle' || images.length === 0}
                className="w-full px-4 py-3 bg-blue-600 text-white rounded-2xl font-medium disabled:opacity-50"
              >
                {busy === 'photos' ? 'Extracting (10-20s)...' : 'Extract from Photos'}
              </button>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-blue-200 dark:bg-slate-700" />
              <span className="text-xs text-stone-500 dark:text-stone-400 font-semibold">OR</span>
              <div className="flex-1 h-px bg-blue-200 dark:bg-slate-700" />
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border-2 border-blue-200 dark:border-slate-700">
              <h2 className="text-lg font-semibold mb-2">From URL</h2>
              <p className="text-sm text-stone-600 dark:text-stone-400 mb-3">
                Paste any recipe URL (blog post, cooking site, etc.) and we&apos;ll scrape the page.
              </p>

              <input
                type="url"
                placeholder="https://example.com/recipe"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full px-4 py-2.5 border-2 border-blue-100 dark:border-slate-700 rounded-xl text-sm mb-3"
              />

              <button
                type="button"
                onClick={handleUrlScan}
                disabled={busy !== 'idle' || !url.trim()}
                className="w-full px-4 py-3 bg-blue-600 text-white rounded-2xl font-medium disabled:opacity-50"
              >
                {busy === 'url' ? 'Fetching &amp; extracting...' : 'Import from URL'}
              </button>
            </div>

            {error && (
              <div className="text-red-600 dark:text-red-400 text-sm p-3 bg-red-50 dark:bg-red-950/30 border-2 border-red-200 dark:border-red-900 rounded-2xl">
                {error}
              </div>
            )}
          </div>
        ) : (
          <>
            <div className="bg-green-50 dark:bg-green-950/30 border-2 border-green-200 dark:border-green-900 rounded-2xl p-3 mb-4 text-sm text-green-800 dark:text-green-300">
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
                  Ingredients <span className="text-gray-500 font-normal">(one per line - use ## Name for section headers)</span>
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

              <button type="submit" className="w-full px-4 py-3 bg-blue-600 text-white rounded-2xl font-medium">
                Save Recipe
              </button>

              <button
                type="button"
                onClick={resetScan}
                className="w-full py-2 text-stone-600 dark:text-stone-300 underline text-sm"
              >
                Scan something else
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
