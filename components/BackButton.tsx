import Link from 'next/link'

export default function BackButton({ href, label = 'Back' }: { href: string; label?: string }) {
  return (
    <div className="sticky top-0 z-10 -mx-4 -mt-4 mb-4 px-4 py-3 bg-blue-50/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-blue-100 dark:border-slate-700">
      <Link
        href={href}
        className="inline-flex items-center gap-1 text-base font-medium text-stone-700 dark:text-stone-200 py-1 pr-2 -ml-1 active:opacity-60"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="m15 18-6-6 6-6" />
        </svg>
        {label}
      </Link>
    </div>
  )
}
