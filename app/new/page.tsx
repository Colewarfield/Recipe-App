import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { createRecipe } from '../actions'
import Link from 'next/link'
import BackButton from '@/components/BackButton'

const CATEGORIES = ['Breakfast', 'Lunch', 'Dinner', 'Dessert', 'Snacks', 'Drinks']

export default async function NewRecipePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-xl mx-auto">
        <BackButton href="/" />
        <h1 className="text-2xl font-bold mb-4">New Recipe</h1>

        <form action={createRecipe} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Title</label>
            <input type="text" name="title" required className="w-full px-3 py-2 border rounded" placeholder="Buffalo Chicken Sandwich" />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Category</label>
            <select name="category" required className="w-full px-3 py-2 border rounded">
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Ingredients <span className="text-gray-500 font-normal">(one per line - use ## Name for section headers)</span></label>
            <textarea name="ingredients" required rows={6} className="w-full px-3 py-2 border rounded font-mono text-sm" placeholder={"2 chicken breasts\n1/2 cup hot sauce\n4 brioche buns"} />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Steps <span className="text-gray-500 font-normal">(one per line)</span></label>
            <textarea name="steps" required rows={6} className="w-full px-3 py-2 border rounded text-sm" placeholder={"Preheat oven to 400F\nSeason chicken\nBake 20 min"} />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Notes <span className="text-gray-500 font-normal">(optional)</span></label>
            <textarea name="notes" rows={3} className="w-full px-3 py-2 border rounded text-sm" placeholder="Used cottage cheese instead of yogurt..." />
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="is_public" defaultChecked />
            Make this public (visible to everyone)
          </label>

          <button type="submit" className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg">Save Recipe</button>
        </form>
      </div>
    </div>
  )
}




