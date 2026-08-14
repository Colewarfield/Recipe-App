'use server'

import { GoogleGenerativeAI } from '@google/generative-ai'
import { createClient } from '@/lib/supabase/server'

export type ScannedRecipe = {
  title: string
  category: string
  ingredients: string[]
  steps: string[]
  notes: string
}

const VALID_CATEGORIES = ['Breakfast', 'Lunch', 'Dinner', 'Dessert', 'Snacks', 'Drinks']

export async function scanRecipe(formData: FormData): Promise<ScannedRecipe> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not signed in')

  const images: { data: string; mimeType: string }[] = []
  for (const [key, value] of formData.entries()) {
    if (key.startsWith('image') && value instanceof File) {
      const buffer = Buffer.from(await value.arrayBuffer())
      images.push({
        data: buffer.toString('base64'),
        mimeType: value.type || 'image/jpeg',
      })
    }
  }

  if (images.length === 0) throw new Error('No images provided')

  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) throw new Error('Server not configured: GEMINI_API_KEY missing')

  const genAI = new GoogleGenerativeAI(apiKey)
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.0-flash',
    generationConfig: { responseMimeType: 'application/json' },
  })

  const prompt = `You are a recipe extraction assistant. The image(s) below contain a single recipe (possibly split across multiple screenshots or photos).

Extract the recipe and return ONLY valid JSON matching this exact schema:
{
  "title": string,
  "category": one of "Breakfast", "Lunch", "Dinner", "Dessert", "Snacks", "Drinks",
  "ingredients": string[],
  "steps": string[],
  "notes": string
}

Rules:
- Combine information across ALL images (they show different parts of the same recipe)
- Guess the category from context (pancakes -> Breakfast, cookies -> Dessert, salad -> Lunch, etc.)
- Each ingredient is one array item, including amounts (e.g., "2 cups all-purpose flour")
- Each step is one array item, in order, concise but complete
- Notes: any cook tips, servings, prep time, storage; empty string if none
- No markdown, no code fences, only the JSON object`

  const parts = [
    { text: prompt },
    ...images.map(img => ({ inlineData: { data: img.data, mimeType: img.mimeType } })),
  ]

  const result = await model.generateContent(parts)
  const text = result.response.text()

  try {
    const parsed = JSON.parse(text)
    return {
      title: String(parsed.title || ''),
      category: VALID_CATEGORIES.includes(parsed.category) ? parsed.category : 'Dinner',
      ingredients: Array.isArray(parsed.ingredients) ? parsed.ingredients.map(String) : [],
      steps: Array.isArray(parsed.steps) ? parsed.steps.map(String) : [],
      notes: String(parsed.notes || ''),
    }
  } catch (e) {
    console.error('Gemini raw response:', text)
    throw new Error('Could not parse recipe from images. Try clearer or different photos.')
  }
}
