'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}

export async function createRecipe(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const title = formData.get('title') as string
  const category = formData.get('category') as string
  const ingredientsRaw = formData.get('ingredients') as string
  const stepsRaw = formData.get('steps') as string
  const notes = (formData.get('notes') as string) ?? ''
  const isPublic = formData.get('is_public') === 'on'

  const ingredients = ingredientsRaw.split('\n').map(s => s.trim()).filter(Boolean)
  const steps = stepsRaw.split('\n').map(s => s.trim()).filter(Boolean)

  const { data, error } = await supabase
    .from('recipes')
    .insert({
      owner_id: user.id,
      title,
      category,
      ingredients,
      steps,
      notes,
      is_public: isPublic,
    })
    .select()
    .single()

  if (error) throw new Error(error.message)

  revalidatePath('/')
  redirect(`/recipe/${data.id}`)
}

export async function updateProfile(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const display_name = (formData.get('display_name') as string).trim()
  if (!display_name) throw new Error('Name cannot be empty')

  const { error } = await supabase
    .from('profiles')
    .update({ display_name })
    .eq('id', user.id)

  if (error) throw new Error(error.message)

  revalidatePath('/')
  redirect('/profile')
}


export async function deleteRecipe(id: string): Promise<void> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not signed in')

  const { error } = await supabase
    .from('recipes')
    .delete()
    .eq('id', id)
    .eq('owner_id', user.id)

  if (error) throw new Error(error.message)

  revalidatePath('/')
}
