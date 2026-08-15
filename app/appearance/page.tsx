import Link from 'next/link'
import BackButton from '@/components/BackButton'
import ThemeSchemeSelector from '@/components/ThemeSchemeSelector'

export default function AppearancePage() {
  return (
    <div className="min-h-screen p-4 pb-16">
      <div className="max-w-xl mx-auto">
        <BackButton href="/" />
        <h1 className="text-3xl font-bold tracking-tight mb-6">Appearance</h1>
        <ThemeSchemeSelector />
      </div>
    </div>
  )
}
