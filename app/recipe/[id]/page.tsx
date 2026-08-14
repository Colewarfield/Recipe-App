import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'

export default async function RecipePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: recipe } = await supabase
    .from('recipes')
    .select('*, profiles(display_name)')
    .eq('id', id)
    .single()

  if (!recipe) notFound()

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
          <h2 className="text-xl font-semibold mb-2">Ingredients</h2>
          <ul className="list-disc pl-5 space-y-1">
            {recipe.ingredients.map((ing: string, i: number) => (<li key={i}>{ing}</li>))}
          </ul>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Steps</h2>
          <ol className="list-decimal pl-5 space-y-2">
            {recipe.steps.map((step: string, i: number) => (<li key={i}>{step}</li>))}
          </ol>
        </section>

        {recipe.notes && (
          <section className="mb-6">
            <h2 className="text-xl font-semibold mb-2">Notes</h2>
            <p className="whitespace-pre-wrap text-gray-700">{recipe.notes}</p>
          </section>
        )}
      </div>
    </div>
  )
}
