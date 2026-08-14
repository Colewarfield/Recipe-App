'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'

const CATEGORIES = ['Breakfast', 'Lunch', 'Dinner', 'Dessert', 'Snacks', 'Drinks']

type Recipe = {
  id: string
  title: string
  category: string
  profiles: { display_name: string } | null
}

export default function RecipeBrowser({ recipes }: { recipes: Recipe[] }) {
  const [search, setSearch] = useState('')
  const [view, setView] = useState<'category' | 'all'>('category')

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return recipes
    return recipes.filter(r => r.title.toLowerCase().includes(q))
  }, [recipes, search])

  return (
    <div>
      <input
        type="text"
        placeholder="Search recipes..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full px-4 py-2 border rounded-lg mb-4"
      />

      <div className="flex gap-1 mb-6 border-b">
        <button
          onClick={() => setView('category')}
          className={"px-4 py-2 text-sm " + (view === 'category' ? 'border-b-2 border-black font-semibold' : 'text-gray-500')}
        >
          By Category
        </button>
        <button
          onClick={() => setView('all')}
          className={"px-4 py-2 text-sm " + (view === 'all' ? 'border-b-2 border-black font-semibold' : 'text-gray-500')}
        >
          All Recipes ({filtered.length})
        </button>
      </div>

      {view === 'all' ? (
        filtered.length === 0 ? (
          <p className="text-gray-400 text-sm">No recipes found.</p>
        ) : (
          <ul className="space-y-1">
            {filtered.map(recipe => (
              <li key={recipe.id}>
                <Link href={`/recipe/${recipe.id}`} className="text-blue-600 underline">
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
                        <Link href={`/recipe/${recipe.id}`} className="text-blue-600 underline">
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
