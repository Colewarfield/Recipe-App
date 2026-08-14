import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import DeleteRecipeButton from '@/components/DeleteRecipeButton'
import ExportGroceryButton from '@/components/ExportGroceryButton'

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
  const ingredientSections = parseSections(recipe.ingredients || [])

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-xl mx-auto">
        <div className="mb-4">
          <Link href="/" className="text-sm text-gray-600 underline">Back</Link>
        </div>

        <h1 className="text-3xl font-bold mb-2">{recipe.title}</h1>
        <div className="text-sm text-gray-500 mb-6">
          {recipe.category} - by {(recipe.profiles as any)?.display_name || 'unknown'}
        </div>

        <section className="mb-6">
          <div className="flex justify-between items-baseline mb-2 gap-2">
            <h2 className="text-xl font-semibold">Ingredients</h2>
            <ExportGroceryButton ingredients={recipe.ingredients || []} recipeTitle={recipe.title} />
          </div>
          {ingredientSections.map((sec, i) => (
            <div key={i} className={i > 0 ? 'mt-4' : ''}>
              {sec.title && <h3 className="font-semibold text-gray-800 mb-1">{sec.title}</h3>}
              <ul className="list-disc pl-5 space-y-1">
                {sec.items.map((ing, j) => (<li key={j}>{ing}</li>))}
              </ul>
            </div>
          ))}
        </section>

        <section className="mb-6 pt-6 border-t border-gray-200">
          <h2 className="text-xl font-semibold mb-2">Steps</h2>
          <ol className="list-decimal pl-5 space-y-2">
            {recipe.steps.map((step: string, i: number) => (<li key={i}>{step}</li>))}
          </ol>
        </section>

        {recipe.notes && (
          <section className="mb-6 pt-6 border-t border-gray-200">
            <h2 className="text-xl font-semibold mb-2">Notes</h2>
            <p className="whitespace-pre-wrap text-gray-700">{recipe.notes}</p>
          </section>
        )}

        {isOwner && (
          <div className="mt-8 pt-6 border-t border-gray-200 flex items-center gap-4">
            <Link href={'/recipe/' + recipe.id + '/edit'} className="text-blue-600 text-sm underline">
              Edit this recipe
            </Link>
            <DeleteRecipeButton recipeId={recipe.id} />
          </div>
        )}
      </div>
    </div>
  )
}
