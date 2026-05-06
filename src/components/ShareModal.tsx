import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import type { PostType } from '../types'

const TYPE_CONFIG = {
  music: {
    label: 'music',
    icon: '♪',
    description: 'share a song',
    accent: '#7eb8a4',
    subPlaceholder: 'artist',
  },
  photo: {
    label: 'photo',
    icon: '◻',
    description: 'share a photo',
    accent: '#7a9ec4',
    subPlaceholder: 'source / caption',
  },
} as const

interface ShareModalProps {
  type: PostType
  currentUser: string
  onClose: () => void
}

export default function ShareModal({ type, currentUser, onClose }: ShareModalProps) {
  const [title, setTitle] = useState('')
  const [sub, setSub] = useState('')
  const [note, setNote] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true))
  }, [])

  const handleClose = () => {
    setVisible(false)
    setTimeout(onClose, 280)
  }

  const handleSubmit = async () => {
    if (!title || !note) return
    setLoading(true)
    await supabase.from('posts').insert({
      type,
      title,
      sub,
      note,
      sender: currentUser,
      image_url: type === 'photo' ? imageUrl : null,
    })
    setLoading(false)
    handleClose()
  }

  const config = TYPE_CONFIG[type]
  const canSubmit = !!title && !!note

  const fieldClass = 'w-full px-3.5 py-2.5 rounded-xl text-sm outline-none transition-colors'
  const fieldStyle = {
    background: 'rgba(240,237,232,0.04)',
    border: '1px solid rgba(240,237,232,0.08)',
    color: '#f0ede8',
    fontFamily: "'DM Sans', sans-serif",
  }

  return (
    <div
      onClick={(e) => e.target === e.currentTarget && handleClose()}
      className='fixed inset-0 z-50 flex items-end justify-center px-4 pb-24'
      style={{
        background: visible ? 'rgba(15,14,13,0.75)' : 'rgba(15,14,13,0)',
        backdropFilter: visible ? 'blur(8px)' : 'blur(0px)',
        transition: 'background 0.3s ease, backdrop-filter 0.3s ease',
      }}
    >
      <div
        className='w-full max-w-sm'
        style={{
          transform: visible ? 'translateY(0)' : 'translateY(20px)',
          opacity: visible ? 1 : 0,
          transition: 'transform 0.3s cubic-bezier(0.34,1.56,0.64,1), opacity 0.25s ease',
        }}
      >
        <div
          className='rounded-2xl overflow-hidden'
          style={{
            background: '#1a1916',
            border: '1px solid rgba(240,237,232,0.08)',
            boxShadow: '0 24px 64px rgba(0,0,0,0.6)',
          }}
        >
          {/* Header */}
          <div
            className='flex items-center gap-3 px-5 py-4'
            style={{ borderBottom: '1px solid rgba(240,237,232,0.06)' }}
          >
            <div
              className='w-9 h-9 rounded-xl flex items-center justify-center text-base flex-shrink-0'
              style={{
                background: `${config.accent}18`,
                border: `1px solid ${config.accent}40`,
                color: config.accent,
              }}
            >
              {config.icon}
            </div>
            <div>
              <p
                className='text-sm leading-tight'
                style={{ fontFamily: "'Lora', Georgia, serif", color: '#f0ede8' }}
              >
                {config.description}
              </p>
              <p
                className='text-xs mt-0.5 uppercase tracking-widest'
                style={{ fontFamily: "'DM Sans', sans-serif", color: '#8a8680' }}
              >
                {config.label}
              </p>
            </div>
            <button
              onClick={handleClose}
              className='ml-auto w-7 h-7 rounded-lg flex items-center justify-center text-xs'
              style={{
                background: 'rgba(240,237,232,0.06)',
                border: 'none',
                color: '#8a8680',
                cursor: 'pointer',
              }}
            >
              ✕
            </button>
          </div>

          {/* Fields */}
          <div className='px-5 py-4 flex flex-col gap-2.5'>
            <input
              autoFocus
              placeholder='title'
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={fieldClass}
              style={fieldStyle}
            />
            <input
              placeholder={config.subPlaceholder}
              value={sub}
              onChange={(e) => setSub(e.target.value)}
              className={fieldClass}
              style={fieldStyle}
            />
            {type === 'photo' && (
              <input
                placeholder='image url'
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className={fieldClass}
                style={fieldStyle}
              />
            )}
            <textarea
              placeholder='your note...'
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              className={`${fieldClass} resize-none leading-relaxed`}
              style={{ ...fieldStyle, fontFamily: "'Lora', Georgia, serif" }}
            />
            <button
              onClick={handleSubmit}
              disabled={loading || !canSubmit}
              className='mt-1 w-full py-3 rounded-xl text-sm font-medium transition-all'
              style={{
                background: canSubmit ? config.accent : 'rgba(240,237,232,0.06)',
                color: canSubmit ? '#0f0e0d' : '#8a8680',
                fontFamily: "'DM Sans', sans-serif",
                border: 'none',
                cursor: canSubmit ? 'pointer' : 'not-allowed',
              }}
            >
              {loading ? 'sharing...' : 'share'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
