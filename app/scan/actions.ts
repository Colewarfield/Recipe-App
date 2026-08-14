'use server'

import { GoogleGenAI } from '@google/genai'
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

  const client = new GoogleGenAI({ apiKey })

  const prompt = `You are a recipe extraction assistant. The image(s) contain a single recipe, possibly split across multiple screenshots or photos.

Extract the recipe and return JSON matching exactly this schema:
{
  "title": string,
  "category": one of "Breakfast", "Lunch", "Dinner", "Dessert", "Snacks", "Drinks",
  "ingredients": array of strings,
  "steps": array of strings,
  "notes": string
}

Rules:
- Combine information across ALL images (they show parts of the same recipe)
- Guess the category from context (pancakes -> Breakfast, cookies -> Dessert)
- Each ingredient is one array item with its amount (e.g., "2 cups flour")
- Each step is one array item, in order
- Notes: any cook tips, servings, prep time, storage; empty string if none`

  const input: unknown[] = images.map(img => ({
    type: 'image',
    mime_type: img.mimeType,
    data: img.data,
  }))
  input.push({ type: 'text', text: prompt })

  const schema = {
    type: 'object',
    properties: {
      title: { type: 'string' },
      category: { type: 'string' },
      ingredients: { type: 'array', items: { type: 'string' } },
      steps: { type: 'array', items: { type: 'string' } },
      notes: { type: 'string' },
    },
    required: ['title', 'category', 'ingredients', 'steps'],
  }

  const clientAny = client as unknown as {
    interactions: {
      create: (args: unknown) => Promise<{ output_text?: string; outputText?: string }>
    }
  }

  const interaction = await clientAny.interactions.create({
    model: 'gemini-3.6-flash',
    input,
    response_format: [{
      type: 'text',
      mime_type: 'application/json',
      schema,
    }],
  })

  const text = interaction.output_text ?? interaction.outputText ?? ''

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
