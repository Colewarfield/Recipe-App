import { ImageResponse } from 'next/og'

export const size = { width: 512, height: 512 }
export const contentType = 'image/png'

export default function Icon() {
  return new ImageResponse(
    (
      <div style={{
        width: '100%', height: '100%', background: '#c2410c',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <div style={{
          width: 380, height: 380, borderRadius: 190, background: '#fef3e2',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{
            width: 240, height: 240, borderRadius: 120, background: '#fed7aa',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <div style={{
              width: 100, height: 100, borderRadius: 50, background: '#c2410c',
            }} />
          </div>
        </div>
      </div>
    ),
    size
  )
}
