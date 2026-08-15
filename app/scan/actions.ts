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

const SCHEMA = {
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

const RULES = `Rules:
- Extract only the recipe itself; ignore ads, navigation, comments, related links.
- Guess the category from context (pancakes -> Breakfast, cookies -> Dessert).
- Each ingredient is one array item WITH its amount (e.g., "2 cups flour").
- If MULTIPLE distinct ingredient groups exist (e.g., "For the sauce"), preserve as sections: "## Group Name" as its own array item before that group.
- Each step is one array item, in order, concise but complete.
- Notes: any cook tips, servings, prep time, storage. Empty string if none.
- If NO recipe found, return { "title": "", "ingredients": [], "steps": [] }.`

async function callGemini(prompt: string, imageParts: { data: string; mimeType: string }[]): Promise<ScannedRecipe> {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) throw new Error('Server not configured: GEMINI_API_KEY missing')

  const ai = new GoogleGenAI({ apiKey })
  const input: unknown[] = imageParts.map(img => ({
    type: 'image',
    mime_type: img.mimeType,
    data: img.data,
  }))
  input.push({ type: 'text', text: prompt })

  const clientAny = ai as unknown as {
    interactions: {
      create: (args: unknown) => Promise<{ output_text?: string; outputText?: string }>
    }
  }

  const interaction = await clientAny.interactions.create({
    model: 'gemini-3.6-flash',
    input,
    response_format: [{ type: 'text', mime_type: 'application/json', schema: SCHEMA }],
  })

  const responseText = interaction.output_text ?? interaction.outputText ?? ''

  try {
    const parsed = JSON.parse(responseText)
    if (!parsed.title || !Array.isArray(parsed.ingredients) || parsed.ingredients.length === 0) {
      throw new Error('No recipe found. Try a different source.')
    }
    return {
      title: String(parsed.title),
      category: VALID_CATEGORIES.includes(parsed.category) ? parsed.category : 'Dinner',
      ingredients: parsed.ingredients.map(String),
      steps: Array.isArray(parsed.steps) ? parsed.steps.map(String) : [],
      notes: String(parsed.notes || ''),
    }
  } catch (e) {
    if (e instanceof Error && e.message.startsWith('No recipe')) throw e
    console.error('Gemini raw response:', responseText)
    throw new Error('Could not parse recipe. Try again or use a different source.')
  }
}

async function fetchPageText(url: string): Promise<string> {
  const directFetch = async (): Promise<string> => {
    const res = await fetch(url, {
      signal: AbortSignal.timeout(20000),
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Cache-Control': 'no-cache',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Sec-Fetch-User': '?1',
        'Upgrade-Insecure-Requests': '1',
      },
    })
    if (!res.ok) throw new Error('direct: HTTP ' + res.status)
    const html = await res.text()
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
    if (text.length < 200) throw new Error('direct: not enough content')
    return text
  }

  const jinaFetch = async (): Promise<string> => {
    const res = await fetch('https://r.jina.ai/' + url, {
      signal: AbortSignal.timeout(30000),
      headers: {
        'Accept': 'text/plain',
      },
    })
    if (!res.ok) throw new Error('jina: HTTP ' + res.status)
    const text = (await res.text()).trim()
    if (text.length < 200) throw new Error('jina: not enough content')
    return text
  }

  // Race both — use whichever succeeds first
  try {
    return await Promise.any([directFetch(), jinaFetch()])
  } catch {
    throw new Error('Could not read that page. Try a different URL, or use Paste Recipe Text below.')
  }
}

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

  const prompt = `You are a recipe extraction assistant. The image(s) below contain a single recipe (possibly split across multiple screenshots or photos).

Extract the recipe and return ONLY valid JSON matching the schema.
Combine information across ALL images (they show parts of the same recipe).

` + RULES

  return callGemini(prompt, images)
}

export async function scanRecipeFromUrl(url: string): Promise<ScannedRecipe> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not signed in')

  let parsedUrl: URL
  try { parsedUrl = new URL(url) } catch { throw new Error('Not a valid URL') }
  if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
    throw new Error('URL must start with http:// or https://')
  }

  const text = await fetchPageText(url)
  const truncated = text.length > 30000 ? text.substring(0, 30000) : text

  const prompt = `You are a recipe extraction assistant. The text below was fetched from a recipe webpage.

Extract the recipe and return ONLY valid JSON matching the schema.

` + RULES + `

Webpage text:
` + truncated

  return callGemini(prompt, [])
}

export async function scanRecipeFromText(text: string): Promise<ScannedRecipe> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not signed in')

  const cleaned = text.trim()
  if (cleaned.length < 20) throw new Error('Not enough text. Paste the full recipe.')
  if (cleaned.length > 50000) throw new Error('Text is too long. Trim it down under 50000 characters.')

  const prompt = `You are a recipe extraction assistant. Extract the recipe from the text below and return ONLY valid JSON matching the schema.

` + RULES + `

Text:
` + cleaned

  return callGemini(prompt, [])
}
