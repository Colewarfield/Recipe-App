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
      } catch {}
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
      return { index: i, text: isHeader ? trimmed.replace(/^#+\s*/, '') : trimmed, isHeader }
    })
    .filter(x => x.text)

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-2xl mx-auto">
        <div className="sticky top-0 z-10 -mx-4 -mt-4 mb-6 px-4 py-3 bg-blue-50/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-blue-100 dark:border-slate-700 flex justify-between items-center">
          <Link
            href={'/recipe/' + recipe.id}
            className="inline-flex items-center gap-1 text-base font-medium text-stone-700 dark:text-stone-200 py-1 pr-2 -ml-1 active:opacity-60"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="m15 18-6-6 6-6" />
            </svg>
            Exit cooking
          </Link>
          {wakeActive && (<span className="text-xs text-stone-500 dark:text-stone-400">Screen awake</span>)}
        </div>

        <h1 className="text-4xl font-bold mb-6">{recipe.title}</h1>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Ingredients</h2>
          <ul className="space-y-3">
            {items.map(item => (
              item.isHeader ? (
                <li key={item.index} className="pt-4 first:pt-0">
                  <div className="font-semibold text-lg text-blue-700 dark:text-blue-400">{item.text}</div>
                </li>
              ) : (
                <li key={item.index} className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id={'ing-' + item.index}
                    checked={!!checked[item.index]}
                    onChange={() => toggle(item.index)}
                    className="mt-1.5 w-5 h-5 accent-blue-600 flex-shrink-0"
                  />
                  <label
                    htmlFor={'ing-' + item.index}
                    className={'text-lg leading-snug cursor-pointer ' + (checked[item.index] ? 'line-through text-stone-400 dark:text-stone-500' : '')}
                  >
                    {item.text}
                  </label>
                </li>
              )
            ))}
          </ul>
        </section>

        <section className="pt-6 border-t border-blue-200 dark:border-slate-700">
          <h2 className="text-2xl font-semibold mb-4">Steps</h2>
          <ol className="space-y-6">
            {recipe.steps.map((step, i) => (
              <li key={i} className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">{i + 1}</div>
                <div className="text-lg leading-relaxed pt-1">{String(step)}</div>
              </li>
            ))}
          </ol>
        </section>

        {recipe.notes && (
          <section className="mt-8 pt-6 border-t border-blue-200 dark:border-slate-700">
            <h2 className="text-2xl font-semibold mb-3">Notes</h2>
            <p className="whitespace-pre-wrap text-lg text-stone-700 dark:text-stone-300">{recipe.notes}</p>
          </section>
        )}

        <div className="mt-12 text-center pb-8">
          <Link href={'/recipe/' + recipe.id} className="text-stone-600 dark:text-stone-300 underline">Exit cooking mode</Link>
        </div>
      </div>
    </div>
  )
}

