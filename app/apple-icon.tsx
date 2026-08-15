import { ImageResponse } from 'next/og'

export const size = { width: 180, height: 180 }
export const contentType = 'image/png'

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div style={{
        width: '100%', height: '100%', background: '#2563eb',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <div style={{
          width: 135, height: 135, borderRadius: 68, background: '#dbeafe',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{
            width: 85, height: 85, borderRadius: 43, background: '#bfdbfe',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <div style={{
              width: 35, height: 35, borderRadius: 18, background: '#2563eb',
            }} />
          </div>
        </div>
      </div>
    ),
    size
  )
}
