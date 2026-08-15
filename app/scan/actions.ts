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
- If the recipe has MULTIPLE distinct ingredient groups (e.g., "For the meatballs", "For the sauce", "For the topping"), preserve them as sections. Format: put a line "## Group Name" as its own array item before that group's ingredients. Example: ["## Meatballs", "1 lb ground beef", "1 egg", "## Tzatziki", "1 cup yogurt", "1 cucumber grated"]
- If the recipe has only ONE ingredient list, do NOT add any "##" headers - keep it flat
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



export async function scanRecipeFromUrl(url: string): Promise<ScannedRecipe> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not signed in')

  let parsedUrl: URL
  try {
    parsedUrl = new URL(url)
  } catch {
    throw new Error('Not a valid URL')
  }
  if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
    throw new Error('URL must start with http:// or https://')
  }

  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) throw new Error('Server not configured: GEMINI_API_KEY missing')

  // Fetch page with 20s timeout
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 20000)

  let html: string
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Cache-Control': 'no-cache',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Sec-Fetch-User': '?1',
        'Upgrade-Insecure-Requests': '1',
      },
    })
    if (res.status === 403 || res.status === 401) {
      throw new Error('That site blocked us (' + res.status + '). It has bot protection. Try a different recipe URL, or copy the recipe text and use Add Recipe instead.')
    }
    if (res.status === 404) {
      throw new Error('Page not found (404). Double-check the URL.')
    }
    if (!res.ok) {
      throw new Error('Page returned ' + res.status + '. Try a different URL.')
    }
    html = await res.text()
  } catch (e) {
    if (e instanceof Error && e.name === 'AbortError') {
      throw new Error('The page took too long to load. Try a different URL.')
    }
    if (e instanceof Error && (e.message.includes('blocked us') || e.message.includes('not found') || e.message.includes('returned'))) {
      throw e
    }
    const msg = e instanceof Error ? e.message : String(e)
    throw new Error('Could not reach that URL: ' + msg)
  } finally {
    clearTimeout(timeout)
  }

  // Strip HTML down to readable text
  let text = html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, ' ')
    .replace(/<noscript[^>]*>[\s\S]*?<\/noscript>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;|&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim()

  if (text.length > 30000) text = text.substring(0, 30000)
  if (text.length < 100) throw new Error('Page has too little content to extract a recipe from')

  const ai = new GoogleGenAI({ apiKey })
  const prompt = `You are a recipe extraction assistant. The text below is scraped from a recipe webpage (with ads, comments, and navigation stripped out imperfectly).

Extract only the recipe and return valid JSON matching this schema:
{
  "title": string,
  "category": one of "Breakfast", "Lunch", "Dinner", "Dessert", "Snacks", "Drinks",
  "ingredients": array of strings,
  "steps": array of strings,
  "notes": string
}

Rules:
- Extract only the recipe itself. Ignore ads, sidebar content, comments, related-articles suggestions, and other noise.
- Guess the category from context.
- Each ingredient is one array item WITH its amount (e.g., "2 cups flour").
- If the recipe has MULTIPLE distinct ingredient groups (e.g., "For the meatballs", "For the sauce"), preserve them as sections. Format: put a line "## Group Name" as its own array item before that group's ingredients.
- Each step is one array item, in order, concise but complete.
- Notes: any cook tips, servings, prep time, storage tips from the recipe itself. Empty string if none.
- If the page does NOT contain an actual recipe, return { "title": "", "ingredients": [], "steps": [] } and we'll handle it.

Webpage text:
` + text

  const clientAny = ai as unknown as {
    interactions: {
      create: (args: unknown) => Promise<{ output_text?: string; outputText?: string }>
    }
  }

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

  const interaction = await clientAny.interactions.create({
    model: 'gemini-3.6-flash',
    input: [{ type: 'text', text: prompt }],
    response_format: [{ type: 'text', mime_type: 'application/json', schema }],
  })

  const responseText = interaction.output_text ?? interaction.outputText ?? ''

  try {
    const parsed = JSON.parse(responseText)
    if (!parsed.title || !Array.isArray(parsed.ingredients) || parsed.ingredients.length === 0) {
      throw new Error('No recipe found on that page. Try a different URL.')
    }
    return {
      title: String(parsed.title),
      category: VALID_CATEGORIES.includes(parsed.category) ? parsed.category : 'Dinner',
      ingredients: parsed.ingredients.map(String),
      steps: Array.isArray(parsed.steps) ? parsed.steps.map(String) : [],
      notes: String(parsed.notes || ''),
    }
  } catch (e) {
    if (e instanceof Error && e.message.includes('No recipe')) throw e
    console.error('Gemini raw response:', responseText)
    throw new Error('Could not parse recipe from that page. Try a different URL.')
  }
}

