import { ImageResponse } from 'next/og'

export const size = { width: 512, height: 512 }
export const contentType = 'image/png'

export default function Icon() {
  return new ImageResponse(
    (
      <div style={{
        width: '100%', height: '100%', background: '#2563eb',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <div style={{
          width: 380, height: 380, borderRadius: 190, background: '#dbeafe',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{
            width: 240, height: 240, borderRadius: 120, background: '#bfdbfe',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <div style={{
              width: 100, height: 100, borderRadius: 50, background: '#2563eb',
            }} />
          </div>
        </div>
      </div>
    ),
    size
  )
}
