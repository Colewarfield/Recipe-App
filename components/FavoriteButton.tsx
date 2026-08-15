'use client'

import { useState } from 'react'
import { addFavorite, removeFavorite } from '@/app/actions'

type Props = {
  recipeId: string
  initialFavorited: boolean
}

export default function FavoriteButton({ recipeId, initialFavorited }: Props) {
  const [isFavorited, setIsFavorited] = useState(initialFavorited)
  const [toast, setToast] = useState<string | null>(null)

  async function toggle() {
    const wasStarred = isFavorited
    setIsFavorited(!wasStarred)
    setToast(wasStarred ? "Don't like anymore" : 'Favorited')
    setTimeout(() => setToast(null), 2000)

    try {
      if (wasStarred) {
        await removeFavorite(recipeId)
      } else {
        await addFavorite(recipeId)
      }
    } catch {
      setIsFavorited(wasStarred)
      setToast('Failed. Try again.')
      setTimeout(() => setToast(null), 2500)
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={toggle}
        className="p-2 -mr-2 active:opacity-60"
        aria-label={isFavorited ? 'Unfavorite' : 'Favorite'}
      >
        {isFavorited ? (
          <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor" className="text-yellow-500">
            <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
          </svg>
        ) : (
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-stone-500 dark:text-stone-400">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
        )}
      </button>

      <div
        className={
          'fixed top-16 right-4 z-50 px-4 py-2 bg-stone-800 dark:bg-stone-100 text-white dark:text-stone-900 text-sm font-medium rounded-full shadow-lg transition-opacity duration-200 ' +
          (toast ? 'opacity-100' : 'opacity-0 pointer-events-none')
        }
      >
        {toast || ' '}
      </div>
    </>
  )
}
