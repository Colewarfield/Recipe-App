import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { updateProfile, signOut } from '../actions'
import Link from 'next/link'
import ThemeSchemeSelector from '@/components/ThemeSchemeSelector'

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('display_name')
    .eq('id', user.id)
    .single()

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-xl mx-auto">
        <div className="mb-4">
          <Link href="/" className="text-sm text-gray-600 underline">Back</Link>
        </div>
        <h1 className="text-2xl font-bold mb-6">Your Profile</h1>

        <form action={updateProfile} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Display Name</label>
            <input
              type="text"
              name="display_name"
              required
              defaultValue={profile?.display_name || ''}
              className="w-full px-3 py-2 border rounded"
              placeholder="Your name"
            />
            <p className="text-xs text-gray-500 mt-1">
              This is how you appear on your recipes.
            </p>
          </div>

          <button type="submit" className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg">
            Save Changes
          </button>
        </form>

        <div className="mt-10">
          <ThemeSchemeSelector />
        </div>

        <form action={signOut} className="mt-10">
          <button type="submit" className="w-full py-3 border-2 border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 rounded-2xl font-medium active:bg-red-50 dark:active:bg-red-950/30">
            Sign out
          </button>
        </form>

        <div className="mt-8 pt-6 border-t">
          <p className="text-sm text-gray-500">
            Email: {user.email}
          </p>
        </div>
      </div>
    </div>
  )
}




