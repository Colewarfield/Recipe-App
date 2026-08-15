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
  const days = Math.floor((now - then) / (1000 * 60 * 60 * 24))
  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 7) return days + 'd ago'
  if (days < 30) {
    const w = Math.floor(days / 7)
    return w + 'w ago'
  }
  if (days < 365) {
    const m = Math.floor(days / 30)
    return m + 'mo ago'
  }
  const y = Math.floor(days / 365)
  return y + 'y ago'
}

function RecipeCard({ recipe, showTimestamp = false }: { recipe: Recipe; showTimestamp?: boolean }) {
  return (
    <Link
      href={'/recipe/' + recipe.id}
      className="block bg-white rounded-2xl px-4 py-3.5 border border-orange-100 active:bg-orange-50/70 transition-colors"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-stone-900 text-base leading-snug">{recipe.title}</div>
          <div className="text-xs text-stone-500 mt-1">
            {recipe.category} · {recipe.profiles?.display_name || 'unknown'}
            {showTimestamp && ' · ' + timeAgo(recipe.created_at)}
          </div>
        </div>
        <svg width="18" height="18" viewBox="0 0 20 20" fill="none" className="text-stone-400 flex-shrink-0">
          <path d="M7 5l6 5-6 5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </Link>
  )
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
        <div className="relative flex-1">
          <svg width="18" height="18" viewBox="0 0 20 20" fill="none" className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none">
            <circle cx="9" cy="9" r="6" stroke="currentColor" strokeWidth="1.75" />
            <path d="m13.5 13.5 3 3" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
          </svg>
          <input
            type="text"
            placeholder="Search recipes"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-orange-100 rounded-full text-sm focus:outline-none focus:border-orange-400"
          />
        </div>
        <button
          type="button"
          onClick={handleRandom}
          disabled={recipes.length === 0}
          className="w-11 h-11 flex items-center justify-center bg-white border border-orange-100 rounded-full text-lg active:bg-orange-100 disabled:opacity-40"
          title="Random recipe"
        >
          🎲
        </button>
      </div>

      <div className="flex gap-1 mb-6 bg-white/60 rounded-full p-1 border border-orange-100">
        {(['category', 'all', 'recent'] as View[]).map(v => (
          <button
            key={v}
            onClick={() => setView(v)}
            className={
              'flex-1 py-2 rounded-full text-sm font-medium transition-colors ' +
              (view === v ? 'bg-orange-600 text-white' : 'text-stone-600 active:bg-orange-50')
            }
          >
            {v === 'category' ? 'Category' : v === 'all' ? 'A–Z' : 'Recent'}
          </button>
        ))}
      </div>

      {view === 'recent' ? (
        filtered.length === 0 ? (
          <p className="text-stone-400 text-sm text-center py-12">No recipes found</p>
        ) : (
          <div className="space-y-2">
            {filtered.map(recipe => (
              <RecipeCard key={recipe.id} recipe={recipe} showTimestamp />
            ))}
          </div>
        )
      ) : view === 'all' ? (
        alphabetical.length === 0 ? (
          <p className="text-stone-400 text-sm text-center py-12">No recipes found</p>
        ) : (
          <div className="space-y-2">
            {alphabetical.map(recipe => (
              <RecipeCard key={recipe.id} recipe={recipe} />
            ))}
          </div>
        )
      ) : (
        <>
          {CATEGORIES.map(category => {
            const catRecipes = filtered.filter(r => r.category === category)
            if (search && catRecipes.length === 0) return null
            return (
              <section key={category} className="mb-6">
                <h2 className="text-xs uppercase tracking-wider font-semibold text-stone-500 mb-2 px-1">
                  {category}
                </h2>
                {catRecipes.length === 0 ? (
                  <p className="text-stone-400 text-sm px-1 py-2">No recipes yet</p>
                ) : (
                  <div className="space-y-2">
                    {catRecipes.map(recipe => (
                      <RecipeCard key={recipe.id} recipe={recipe} />
                    ))}
                  </div>
                )}
              </section>
            )
          })}
        </>
      )}
    </div>
  )
}
