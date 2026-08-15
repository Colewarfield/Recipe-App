import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'], display: 'swap' })

export const metadata: Metadata = {
  title: 'Recipe App',
  description: 'Personal recipe collection',
  appleWebApp: {
    capable: true,
    title: 'Recipes',
    statusBarStyle: 'default',
  },
}

export const viewport: Viewport = {
  themeColor: '#2563eb',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

const themeInitScript = "(function(){try{var m=localStorage.getItem('theme')||'light';if(m==='dark')document.documentElement.classList.add('dark');var sc=localStorage.getItem('theme-scheme')||'blue';document.documentElement.setAttribute('data-theme',sc);}catch(e){}})();"

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.className}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="antialiased text-stone-900 dark:text-stone-100 min-h-screen transition-colors">{children}</body>
    </html>
  )
}
