'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

const CATEGORIES = ['Breakfast', 'Lunch', 'Dinner', 'Dessert', 'Snacks', 'Drinks']

type Recipe = {
  id: string
  title: string
  category: string
  created_at: string
  profiles: { display_name: string } | null
}

type View = 'category' | 'all' | 'recent'

function timeAgo(dateStr: string): string {
  const then = new Date(dateStr).getTime()
  const now = Date.now()
  const diffMs = now - then
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 7) return days + ' days ago'
  if (days < 30) {
    const weeks = Math.floor(days / 7)
    return weeks === 1 ? '1 week ago' : weeks + ' weeks ago'
  }
  if (days < 365) {
    const months = Math.floor(days / 30)
    return months === 1 ? '1 month ago' : months + ' months ago'
  }
  const years = Math.floor(days / 365)
  return years === 1 ? '1 year ago' : years + ' years ago'
}

export default function RecipeBrowser({ recipes }: { recipes: Recipe[] }) {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [view, setView] = useState<View>('category')

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return recipes
    return recipes.filter(r => r.title.toLowerCase().includes(q))
  }, [recipes, search])

  const alphabetical = useMemo(() => {
    return [...filtered].sort((a, b) => a.title.localeCompare(b.title))
  }, [filtered])

  function handleRandom() {
    const pool = filtered.length > 0 ? filtered : recipes
    if (pool.length === 0) return
    const random = pool[Math.floor(Math.random() * pool.length)]
    router.push('/recipe/' + random.id)
  }

  return (
    <div>
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          placeholder="Search recipes..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 px-4 py-2 border rounded-lg"
        />
        <button
          type="button"
          onClick={handleRandom}
          disabled={recipes.length === 0}
          className="px-3 py-2 border rounded-lg text-lg hover:bg-gray-50 disabled:opacity-50"
          title="Pick a random recipe"
        >
          🎲
        </button>
      </div>

      <div className="flex gap-1 mb-6 border-b">
        <button
          onClick={() => setView('category')}
          className={"px-3 py-2 text-sm " + (view === 'category' ? 'border-b-2 border-black font-semibold' : 'text-gray-500')}
        >
          By Category
        </button>
        <button
          onClick={() => setView('all')}
          className={"px-3 py-2 text-sm " + (view === 'all' ? 'border-b-2 border-black font-semibold' : 'text-gray-500')}
        >
          All A-Z ({filtered.length})
        </button>
        <button
          onClick={() => setView('recent')}
          className={"px-3 py-2 text-sm " + (view === 'recent' ? 'border-b-2 border-black font-semibold' : 'text-gray-500')}
        >
          Recent
        </button>
      </div>

      {view === 'recent' ? (
        filtered.length === 0 ? (
          <p className="text-gray-400 text-sm">No recipes found.</p>
        ) : (
          <ul className="space-y-2">
            {filtered.map(recipe => (
              <li key={recipe.id}>
                <div className="flex items-baseline justify-between gap-2">
                  <Link href={'/recipe/' + recipe.id} className="text-blue-600 underline">
                    {recipe.title}
                  </Link>
                  <span className="text-xs text-gray-400 whitespace-nowrap">
                    {timeAgo(recipe.created_at)}
                  </span>
                </div>
                <div className="text-xs text-gray-500">
                  {recipe.category} - by {recipe.profiles?.display_name || 'unknown'}
                </div>
              </li>
            ))}
          </ul>
        )
      ) : view === 'all' ? (
        alphabetical.length === 0 ? (
          <p className="text-gray-400 text-sm">No recipes found.</p>
        ) : (
          <ul className="space-y-1">
            {alphabetical.map(recipe => (
              <li key={recipe.id}>
                <Link href={'/recipe/' + recipe.id} className="text-blue-600 underline">
                  {recipe.title}
                </Link>
                <span className="text-xs text-gray-500 ml-2">
                  {recipe.category} - by {recipe.profiles?.display_name || 'unknown'}
                </span>
              </li>
            ))}
          </ul>
        )
      ) : (
        <>
          {CATEGORIES.map(category => {
            const catRecipes = filtered.filter(r => r.category === category)
            if (search && catRecipes.length === 0) return null
            return (
              <section key={category} className="mb-6">
                <h2 className="text-xl font-semibold mb-2">{category}</h2>
                {catRecipes.length === 0 ? (
                  <p className="text-gray-400 text-sm">No recipes yet.</p>
                ) : (
                  <ul className="space-y-1">
                    {catRecipes.map(recipe => (
                      <li key={recipe.id}>
                        <Link href={'/recipe/' + recipe.id} className="text-blue-600 underline">
                          {recipe.title}
                        </Link>
                        <span className="text-xs text-gray-500 ml-2">
                          by {recipe.profiles?.display_name || 'unknown'}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            )
          })}
        </>
      )}
    </div>
  )
}
