import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import DeleteRecipeButton from '@/components/DeleteRecipeButton'
import ExportGroceryButton from '@/components/ExportGroceryButton'
import FavoriteButton from '@/components/FavoriteButton'

type Section = { title: string; items: string[] }

function parseSections(items: string[]): Section[] {
  const sections: Section[] = []
  let current: Section = { title: '', items: [] }
  for (const raw of items) {
    const line = String(raw).trim()
    if (!line) continue
    if (line.startsWith('##')) {
      if (current.items.length > 0 || current.title) sections.push(current)
      current = { title: line.replace(/^#+\s*/, '').trim(), items: [] }
    } else {
      current.items.push(line)
    }
  }
  if (current.items.length > 0 || current.title) sections.push(current)
  return sections
}

export default async function RecipePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const [recipeResult, userResult] = await Promise.all([
    supabase.from('recipes').select('*, profiles(display_name)').eq('id', id).single(),
    supabase.auth.getUser(),
  ])

  const recipe = recipeResult.data
  const user = userResult.data.user

  if (!recipe) notFound()

  const isOwner = user?.id === recipe.owner_id
  let isFavorited = false
  if (user) {
    const { data: fav } = await supabase
      .from('favorites')
      .select('recipe_id')
      .eq('user_id', user.id)
      .eq('recipe_id', id)
      .maybeSingle()
    isFavorited = !!fav
  }

  const ingredientSections = parseSections(recipe.ingredients || [])

  return (
    <div className="min-h-screen p-4 pb-16">
      <div className="max-w-xl mx-auto">
        <div className="sticky top-0 z-10 -mx-4 -mt-4 mb-4 px-4 py-3 bg-blue-50/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-blue-100 dark:border-slate-700 flex justify-between items-center">
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-base font-medium text-stone-700 dark:text-stone-200 py-1 pr-2 -ml-1 active:opacity-60"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="m15 18-6-6 6-6" />
            </svg>
            Back
          </Link>
          {user && <FavoriteButton recipeId={recipe.id} initialFavorited={isFavorited} />}
        </div>

        <h1 className="text-3xl font-bold tracking-tight mb-3">{recipe.title}</h1>
        <div className="flex items-center gap-2 mb-6 flex-wrap">
          <span className="inline-block px-3 py-1 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 rounded-full text-xs font-semibold">
            {recipe.category}
          </span>
          <span className="text-sm text-stone-500 dark:text-stone-400">
            by {(recipe.profiles as any)?.display_name || 'unknown'}
          </span>
        </div>

        <Link
          href={'/recipe/' + recipe.id + '/cook'}
          className="block mb-6 py-3.5 bg-blue-600 text-white text-center rounded-2xl font-medium active:bg-blue-700 transition-colors"
        >
          Start cooking
        </Link>

        <section className="mb-4 bg-white dark:bg-slate-800 rounded-2xl p-5 border-2 border-blue-200 dark:border-slate-700">
          <div className="flex justify-between items-baseline mb-3 gap-2">
            <h2 className="text-lg font-semibold">Ingredients</h2>
            <ExportGroceryButton ingredients={recipe.ingredients || []} recipeTitle={recipe.title} />
          </div>
          {ingredientSections.map((sec, i) => (
            <div key={i} className={i > 0 ? 'mt-4' : ''}>
              {sec.title && <h3 className="font-semibold text-stone-800 dark:text-stone-200 mb-1">{sec.title}</h3>}
              <ul className="list-disc pl-5 space-y-1 text-stone-800 dark:text-stone-200 leading-relaxed">
                {sec.items.map((ing, j) => (<li key={j}>{ing}</li>))}
              </ul>
            </div>
          ))}
        </section>

        <section className="mb-4 bg-white dark:bg-slate-800 rounded-2xl p-5 border-2 border-blue-200 dark:border-slate-700">
          <h2 className="text-lg font-semibold mb-3">Steps</h2>
          <ol className="list-decimal pl-5 space-y-2 text-stone-800 dark:text-stone-200 leading-relaxed marker:text-blue-500 marker:font-semibold">
            {recipe.steps.map((step: string, i: number) => (<li key={i}>{step}</li>))}
          </ol>
        </section>

        {recipe.notes && (
          <section className="mb-4 bg-white dark:bg-slate-800 rounded-2xl p-5 border-2 border-blue-200 dark:border-slate-700">
            <h2 className="text-lg font-semibold mb-3">Notes</h2>
            <p className="whitespace-pre-wrap text-stone-800 dark:text-stone-200 leading-relaxed">{recipe.notes}</p>
          </section>
        )}

        {isOwner && (
          <div className="mt-6 flex items-center justify-between gap-4 px-2">
            <Link href={'/recipe/' + recipe.id + '/edit'} className="text-blue-700 dark:text-blue-400 text-sm font-medium">
              Edit recipe
            </Link>
            <DeleteRecipeButton recipeId={recipe.id} />
          </div>
        )}
      </div>
    </div>
  )
}
