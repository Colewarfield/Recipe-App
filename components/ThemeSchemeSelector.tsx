'use client'

import { useEffect, useState } from 'react'

type Scheme = 'blue' | 'terracotta' | 'spotify' | 'boring'

const SCHEMES: { id: Scheme; name: string; description: string; swatch: string[] }[] = [
  { id: 'blue', name: 'Ocean', description: 'Cool blue on cream', swatch: ['#eff6ff', '#2563eb', '#ffffff'] },
  { id: 'terracotta', name: 'Warm Cream', description: 'Terracotta on cream', swatch: ['#fef7f0', '#c2410c', '#fed7aa'] },
  { id: 'spotify', name: 'Deep', description: 'Green on charcoal', swatch: ['#121212', '#1db954', '#282828'] },
  { id: 'boring', name: 'Boring', description: 'Plain black and white', swatch: ['#fafafa', '#171717', '#e5e5e5'] },
]

export default function ThemeSchemeSelector() {
  const [scheme, setScheme] = useState<Scheme>('blue')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const stored = (localStorage.getItem('theme-scheme') as Scheme | null) || 'blue'
    setScheme(stored)
  }, [])

  function selectScheme(s: Scheme) {
    setScheme(s)
    document.documentElement.setAttribute('data-theme', s)
    try { localStorage.setItem('theme-scheme', s) } catch {}
  }

  if (!mounted) return <div className="h-40" />

  return (
    <div>
      <h2 className="text-lg font-semibold mb-3">Theme</h2>
      <div className="space-y-2">
        {SCHEMES.map(s => (
          <button
            key={s.id}
            onClick={() => selectScheme(s.id)}
            type="button"
            className={
              'w-full flex items-center gap-4 p-4 bg-white dark:bg-slate-800 rounded-2xl border-2 transition-colors ' +
              (scheme === s.id ? 'border-blue-600' : 'border-blue-100 dark:border-slate-700')
            }
          >
            <div className="flex gap-1 flex-shrink-0">
              {s.swatch.map((color, i) => (
                <div key={i} className="w-6 h-6 rounded-full border border-black/10" style={{ background: color }} />
              ))}
            </div>
            <div className="flex-1 text-left min-w-0">
              <div className="font-semibold">{s.name}</div>
              <div className="text-xs text-stone-500 dark:text-stone-400">{s.description}</div>
            </div>
            {scheme === s.id && (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600 flex-shrink-0">
                <path d="m5 13 4 4L19 7" />
              </svg>
            )}
          </button>
        ))}
      </div>
      <p className="text-xs text-stone-500 dark:text-stone-400 mt-3">
        The sun/moon icon at the top of the home page toggles light/dark within your current theme.
      </p>
    </div>
  )
}
