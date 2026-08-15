'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleGoogleSignIn() {
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-sm text-center">
        <div className="text-6xl mb-4">🍳</div>
        <h1 className="text-3xl font-bold mb-2">Recipe App</h1>
        <p className="text-stone-600 mb-8">Your personal recipe collection</p>

        <button
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full px-4 py-3.5 bg-white border-2 border-blue-300 rounded-2xl font-medium flex items-center justify-center gap-3 active:bg-blue-50 disabled:opacity-50 transition-colors"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path fill="#4285F4" d="M19.6 10.23c0-.68-.06-1.36-.19-2.03H10v3.85h5.4c-.23 1.26-.94 2.33-2 3.05v2.53h3.24c1.9-1.75 2.96-4.34 2.96-7.4z" />
            <path fill="#34A853" d="M10 20c2.7 0 4.96-.9 6.62-2.44l-3.24-2.53c-.9.6-2.04.95-3.38.95-2.6 0-4.8-1.75-5.6-4.1H1.06v2.6C2.74 17.83 6.13 20 10 20z" />
            <path fill="#FBBC05" d="M4.4 11.88c-.2-.6-.32-1.24-.32-1.88s.12-1.28.32-1.88V5.5H1.06C.38 6.85 0 8.38 0 10s.38 3.15 1.06 4.5l3.34-2.62z" />
            <path fill="#EA4335" d="M10 3.98c1.47 0 2.79.5 3.83 1.5l2.87-2.87C14.96.98 12.7 0 10 0 6.13 0 2.74 2.17 1.06 5.5l3.34 2.62C5.2 5.73 7.4 3.98 10 3.98z" />
          </svg>
          {loading ? 'Redirecting...' : 'Continue with Google'}
        </button>

        {error && <p className="mt-4 text-red-600 text-sm">{error}</p>}
      </div>
    </div>
  )
}


