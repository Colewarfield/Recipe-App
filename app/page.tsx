import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import RecipeBrowser from '@/components/RecipeBrowser'
import ThemeToggle from '@/components/ThemeToggle'

export default async function HomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center max-w-sm">
          <div className="text-6xl mb-4">🍳</div>
          <h1 className="text-3xl font-bold mb-2">Recipe App</h1>
          <p className="mb-8 text-stone-600 dark:text-stone-400">Sign in to start adding recipes</p>
          <Link href="/login" className="inline-block px-8 py-3.5 bg-blue-600 text-white rounded-full font-medium">
            Sign In
          </Link>
        </div>
      </div>
    )
  }

  const [profileRes, recipesRes, favsRes] = await Promise.all([
    supabase.from('profiles').select('display_name').eq('id', user.id).single(),
    supabase.from('recipes').select('id, title, category, created_at, owner_id, profiles(display_name)').order('created_at', { ascending: false }),
    supabase.from('favorites').select('recipe_id').eq('user_id', user.id),
  ])

  const myProfile = profileRes.data
  const recipes = recipesRes.data
  const favoriteIds = (favsRes.data || []).map(f => f.recipe_id)

  return (
    <div className="min-h-screen p-4 pb-16">
      <div className="max-w-2xl mx-auto">
        <header className="mb-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Recipes</h1>
              <p className="text-stone-500 dark:text-stone-400 text-sm mt-0.5">Hi, {myProfile?.display_name || user.email}</p>
            </div>
            <div className="flex gap-4 items-center text-sm text-stone-600 dark:text-stone-300 pt-1">
              <ThemeToggle />
              <Link href="/help">Help</Link>
              <Link href="/profile">Profile</Link>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-2 gap-3 mb-6">
          <Link
            href="/new"
            className="flex items-center justify-center py-3.5 bg-blue-600 text-white rounded-2xl font-medium active:bg-blue-700 transition-colors"
          >
            + Add Recipe
          </Link>
          <Link
            href="/scan"
            className="flex items-center justify-center py-3.5 bg-white dark:bg-slate-800 text-blue-700 dark:text-blue-400 border-2 border-blue-200 dark:border-slate-700 rounded-2xl font-medium active:bg-blue-50 dark:active:bg-slate-700 transition-colors"
          >
            Scan Recipe
          </Link>
        </div>

        <RecipeBrowser
          recipes={(recipes as any) ?? []}
          currentUserId={user.id}
          currentUserName={myProfile?.display_name || 'Me'}
          favoriteIds={favoriteIds}
        />
      </div>
    </div>
  )
}
