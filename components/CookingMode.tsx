'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

type Recipe = {
  id: string
  title: string
  category: string
  ingredients: string[]
  steps: string[]
  notes: string
}

type IngredientItem = { index: number; text: string; isHeader: boolean }

export default function CookingMode({ recipe }: { recipe: Recipe }) {
  const [checked, setChecked] = useState<Record<number, boolean>>({})
  const [wakeActive, setWakeActive] = useState(false)

  useEffect(() => {
    let lock: { release: () => Promise<void> } | null = null

    async function acquire() {
      try {
        const nav = navigator as unknown as { wakeLock?: { request: (t: string) => Promise<{ release: () => Promise<void> }> } }
        if (nav.wakeLock) {
          lock = await nav.wakeLock.request('screen')
          setWakeActive(true)
        }
      } catch {
        // Wake Lock not supported or denied - fail silently
      }
    }

    acquire()

    function onVis() {
      if (document.visibilityState === 'visible' && !lock) acquire()
    }
    document.addEventListener('visibilitychange', onVis)

    return () => {
      if (lock) lock.release().catch(() => {})
      document.removeEventListener('visibilitychange', onVis)
    }
  }, [])

  function toggle(i: number) {
    setChecked(prev => ({ ...prev, [i]: !prev[i] }))
  }

  const items: IngredientItem[] = recipe.ingredients
    .map((line, i) => {
      const trimmed = String(line).trim()
      const isHeader = trimmed.startsWith('##')
      return {
        index: i,
        text: isHeader ? trimmed.replace(/^#+\s*/, '') : trimmed,
        isHeader,
      }
    })
    .filter(x => x.text)

  return (
    <div className="min-h-screen bg-orange-50 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6 flex justify-between items-center">
          <Link href={'/recipe/' + recipe.id} className="text-sm text-stone-600 underline">
            Exit cooking mode
          </Link>
          {wakeActive && (
            <span className="text-xs text-stone-500">Screen stays awake</span>
          )}
        </div>

        <h1 className="text-4xl font-bold mb-6">{recipe.title}</h1>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Ingredients</h2>
          <ul className="space-y-3">
            {items.map(item => (
              item.isHeader ? (
                <li key={item.index} className="pt-4 first:pt-0">
                  <div className="font-semibold text-lg text-orange-700">{item.text}</div>
                </li>
              ) : (
                <li key={item.index} className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id={'ing-' + item.index}
                    checked={!!checked[item.index]}
                    onChange={() => toggle(item.index)}
                    className="mt-1.5 w-5 h-5 accent-orange-600 flex-shrink-0"
                  />
                  <label
                    htmlFor={'ing-' + item.index}
                    className={'text-lg leading-snug cursor-pointer ' + (checked[item.index] ? 'line-through text-stone-400' : '')}
                  >
                    {item.text}
                  </label>
                </li>
              )
            ))}
          </ul>
        </section>

        <section className="pt-6 border-t border-orange-200">
          <h2 className="text-2xl font-semibold mb-4">Steps</h2>
          <ol className="space-y-6">
            {recipe.steps.map((step, i) => (
              <li key={i} className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-orange-600 text-white flex items-center justify-center font-bold">
                  {i + 1}
                </div>
                <div className="text-lg leading-relaxed pt-1">
                  {String(step)}
                </div>
              </li>
            ))}
          </ol>
        </section>

        {recipe.notes && (
          <section className="mt-8 pt-6 border-t border-orange-200">
            <h2 className="text-2xl font-semibold mb-3">Notes</h2>
            <p className="whitespace-pre-wrap text-lg text-stone-700">{recipe.notes}</p>
          </section>
        )}

        <div className="mt-12 text-center pb-8">
          <Link href={'/recipe/' + recipe.id} className="text-stone-600 underline">
            Exit cooking mode
          </Link>
        </div>
      </div>
    </div>
  )
}
