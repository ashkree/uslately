import { useState, useEffect } from 'react'
import type { PostType } from '../types'
import ShareModal from './ShareModal'

interface ShareFABProps {
  currentUser: string
}

const TYPE_CONFIG = {
  music: {
    icon: '♪',
    description: 'share a song',
    accent: '#7eb8a4',
  },
  photo: {
    icon: '◻',
    description: 'share a photo',
    accent: '#7a9ec4',
  },
} as const

const TYPES: PostType[] = ['music', 'photo']

export default function ShareFAB({ currentUser }: ShareFABProps) {
  const [open, setOpen] = useState(false)
  const [selectedType, setSelectedType] = useState<PostType | null>(null)

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [])

  const handleTypeSelect = (type: PostType) => {
    setOpen(false)
    setSelectedType(type)
  }

  return (
    <>
      {open && <div className='fixed inset-0 z-40' onClick={() => setOpen(false)} />}

      <div className='fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3'>
        {TYPES.map((type, i) => {
          const config = TYPE_CONFIG[type]
          const delay = open ? i * 50 : (TYPES.length - 1 - i) * 30

          return (
            <div
              key={type}
              className='flex items-center gap-2.5'
              style={{
                transform: open ? 'translateY(0)' : 'translateY(16px)',
                opacity: open ? 1 : 0,
                pointerEvents: open ? 'auto' : 'none',
                transition: `transform 0.3s cubic-bezier(0.34,1.56,0.64,1) ${delay}ms, opacity 0.2s ease ${delay}ms`,
              }}
            >
              <span
                className='text-xs px-2.5 py-1 rounded-lg whitespace-nowrap'
                style={{
                  background: 'rgba(26,25,22,0.95)',
                  border: '1px solid rgba(240,237,232,0.1)',
                  color: '#8a8680',
                  fontFamily: "'DM Sans', sans-serif",
                  letterSpacing: '0.04em',
                  backdropFilter: 'blur(8px)',
                }}
              >
                {config.description}
              </span>
              <button
                onClick={() => handleTypeSelect(type)}
                className='w-11 h-11 rounded-2xl flex items-center justify-center text-lg transition-transform hover:scale-110 active:scale-95'
                style={{
                  background: `${config.accent}15`,
                  border: `1px solid ${config.accent}35`,
                  color: config.accent,
                  cursor: 'pointer',
                  backdropFilter: 'blur(8px)',
                  boxShadow: `0 4px 16px ${config.accent}20`,
                }}
              >
                {config.icon}
              </button>
            </div>
          )
        })}

        <button
          onClick={() => setOpen((v) => !v)}
          className='flex items-center justify-center rounded-2xl text-2xl active:scale-95'
          style={{
            width: '52px',
            height: '52px',
            background: open ? 'rgba(201,169,110,0.15)' : 'rgba(26,25,22,0.95)',
            border: '1px solid rgba(201,169,110,0.25)',
            color: '#c9a96e',
            cursor: 'pointer',
            backdropFilter: 'blur(12px)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
            transform: open ? 'rotate(45deg)' : 'rotate(0deg)',
            transition: 'transform 0.25s cubic-bezier(0.34,1.56,0.64,1), background 0.2s',
          }}
        >
          +
        </button>
      </div>

      {selectedType && (
        <ShareModal
          type={selectedType}
          currentUser={currentUser}
          onClose={() => setSelectedType(null)}
        />
      )}
    </>
  )
}
