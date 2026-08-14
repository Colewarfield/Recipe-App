'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { deleteRecipe } from '@/app/actions'

export default function DeleteRecipeButton({ recipeId }: { recipeId: string }) {
  const router = useRouter()
  const [deleting, setDeleting] = useState(false)

  async function handleDelete() {
    if (!confirm('Delete this recipe? This cannot be undone.')) return
    setDeleting(true)
    try {
      await deleteRecipe(recipeId)
      router.push('/')
      router.refresh()
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Failed to delete'
      alert(msg)
      setDeleting(false)
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={deleting}
      className="text-red-600 text-sm underline disabled:opacity-50"
    >
      {deleting ? 'Deleting...' : 'Delete this recipe'}
    </button>
  )
}
