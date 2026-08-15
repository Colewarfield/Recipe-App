import { ImageResponse } from 'next/og'

export const size = { width: 180, height: 180 }
export const contentType = 'image/png'

async function loadGoogleFont(family: string, weight: number, italic = false): Promise<ArrayBuffer | null> {
  try {
    const styleParam = italic ? 'ital,wght@1,' + weight : 'wght@' + weight
    const familyParam = family.replace(/ /g, '+')
    const url = 'https://fonts.googleapis.com/css2?family=' + familyParam + ':' + styleParam + '&display=swap'
    const css = await (await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } })).text()
    const match = css.match(/src:\s*url\((.+?)\)/)
    if (!match) return null
    const font = await fetch(match[1])
    return await font.arrayBuffer()
  } catch {
    return null
  }
}

export default async function AppleIcon() {
  const fontData = await loadGoogleFont('Playfair Display', 900, true)

  return new ImageResponse(
    (
      <div style={{
        width: '100%',
        height: '100%',
        background: '#1e293b',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <div style={{
          fontSize: 140,
          fontWeight: 900,
          fontStyle: 'italic',
          fontFamily: fontData ? 'PlayfairDisplay' : 'sans-serif',
          color: '#60a5fa',
          lineHeight: 1,
          letterSpacing: -3,
        }}>
          R
        </div>
      </div>
    ),
    {
      ...size,
      fonts: fontData
        ? [{ name: 'PlayfairDisplay', data: fontData, weight: 900, style: 'italic' }]
        : undefined,
    }
  )
}
