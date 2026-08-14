'use client'

import { useState } from 'react'

type Props = {
  ingredients: string[]
  recipeTitle: string
}

export default function ExportGroceryButton({ ingredients, recipeTitle }: Props) {
  const [status, setStatus] = useState<'idle' | 'copied'>('idle')

  async function handleExport() {
    const text = 'Grocery list - ' + recipeTitle + '\n\n' +
      ingredients.filter(x => x && x.trim()).join('\n')

    // Try native Share API first (iPhone share sheet -> Notes, Messages, etc.)
    if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
      try {
        await navigator.share({
          title: 'Grocery list: ' + recipeTitle,
          text,
        })
        return
      } catch (e) {
        const err = e as { name?: string }
        if (err?.name === 'AbortError') return // user cancelled, done
        // Otherwise fall through to clipboard
      }
    }

    // Fallback: clipboard
    try {
      await navigator.clipboard.writeText(text)
      setStatus('copied')
      setTimeout(() => setStatus('idle'), 2000)
    } catch (e) {
      alert('Could not export. Copy the ingredients manually.')
    }
  }

  return (
    <button
      type="button"
      onClick={handleExport}
      className="text-sm text-blue-600 underline whitespace-nowrap"
      title="Copy or share the ingredients as a grocery list"
    >
      {status === 'copied' ? 'Copied!' : 'Export list'}
    </button>
  )
}
