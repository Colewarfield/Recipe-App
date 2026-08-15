import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { updateRecipe } from '@/app/actions'

const CATEGORIES = ['Breakfast', 'Lunch', 'Dinner', 'Dessert', 'Snacks', 'Drinks']

export default async function EditRecipePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const [recipeResult, userResult] = await Promise.all([
    supabase.from('recipes').select('*').eq('id', id).single(),
    supabase.auth.getUser(),
  ])

  const recipe = recipeResult.data
  const user = userResult.data.user

  if (!recipe) notFound()
  if (!user || user.id !== recipe.owner_id) redirect('/recipe/' + id)

  const updateWithId = updateRecipe.bind(null, id)

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-xl mx-auto">
        <div className="mb-4">
          <Link href={'/recipe/' + id} className="text-sm text-gray-600 underline">Cancel</Link>
        </div>
        <h1 className="text-2xl font-bold mb-4">Edit Recipe</h1>

        <form action={updateWithId} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Title</label>
            <input
              type="text"
              name="title"
              required
              defaultValue={recipe.title}
              className="w-full px-3 py-2 border rounded"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Category</label>
            <select name="category" required defaultValue={recipe.category} className="w-full px-3 py-2 border rounded">
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Ingredients <span className="text-gray-500 font-normal">(one per line - use ## Name for section headers)</span>
            </label>
            <textarea
              name="ingredients"
              required
              rows={8}
              defaultValue={(recipe.ingredients as string[]).join('\n')}
              className="w-full px-3 py-2 border rounded font-mono text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Steps <span className="text-gray-500 font-normal">(one per line)</span>
            </label>
            <textarea
              name="steps"
              required
              rows={10}
              defaultValue={(recipe.steps as string[]).join('\n')}
              className="w-full px-3 py-2 border rounded text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Notes <span className="text-gray-500 font-normal">(optional)</span>
            </label>
            <textarea
              name="notes"
              rows={3}
              defaultValue={recipe.notes || ''}
              className="w-full px-3 py-2 border rounded text-sm"
            />
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="is_public" defaultChecked={recipe.is_public} />
            Make this public (visible to everyone)
          </label>

          <div className="flex gap-3">
            <Link href={'/recipe/' + id} className="flex-1 px-4 py-3 border rounded-lg text-center">
              Cancel
            </Link>
            <button type="submit" className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg">
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}



