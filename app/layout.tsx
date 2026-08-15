import type { Metadata, Viewport } from 'next'
import './globals.css'

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
  themeColor: '#c2410c',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="antialiased bg-orange-50 text-stone-900 min-h-screen">{children}</body>
    </html>
  )
}
