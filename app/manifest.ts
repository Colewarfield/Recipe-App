import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Recipe App',
    short_name: 'Recipes',
    description: 'Personal recipe collection',
    start_url: '/',
    display: 'standalone',
    background_color: '#fef7ed',
    theme_color: '#c2410c',
    icons: [
      { src: '/icon', sizes: '512x512', type: 'image/png' },
      { src: '/apple-icon', sizes: '180x180', type: 'image/png' },
    ],
  }
}
