import { createClient } from '@/lib/supabase/server'
import { signOut } from './actions'
import Link from 'next/link'
import RecipeBrowser from '@/components/RecipeBrowser'

export default async function HomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Recipe App</h1>
          <p className="mb-6 text-gray-600">Sign in to start adding recipes</p>
          <Link href="/login" className="inline-block px-6 py-3 bg-black text-white rounded-lg">
            Sign In
          </Link>
        </div>
      </div>
    )
  }

  const { data: recipes } = await supabase
    .from('recipes')
    .select('id, title, category, profiles(display_name)')
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-2xl mx-auto">
        <header className="flex justify-between items-center mb-2">
          <h1 className="text-3xl font-bold">Recipe App</h1>
          <div className="flex gap-3 text-sm items-center">
            <Link href="/profile" className="text-gray-600 underline">Profile</Link>
            <form action={signOut}>
              <button className="text-gray-600 underline">Sign out</button>
            </form>
          </div>
        </header>
        <p className="text-gray-500 text-sm mb-6">Signed in as {user.email}</p>

        <Link href="/new" className="block mb-6 px-4 py-3 bg-black text-white rounded-lg text-center">
          + Add Recipe
        </Link>

        <RecipeBrowser recipes={(recipes as any) ?? []} />
      </div>
    </div>
  )
}

