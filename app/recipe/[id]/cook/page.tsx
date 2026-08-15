import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import CookingMode from '@/components/CookingMode'

export default async function CookPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: recipe } = await supabase
    .from('recipes')
    .select('id, title, category, ingredients, steps, notes')
    .eq('id', id)
    .single()

  if (!recipe) notFound()

  return <CookingMode recipe={recipe as any} />
}
