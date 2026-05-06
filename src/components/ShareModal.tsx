import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { TYPE_CONFIG, type PostType } from '../types'

interface ShareModalProps {
  type: PostType
  currentUser: string
  onClose: () => void
}

interface FormState {
  title: string
  sub: string
  note: string
  url: string
}

const EMPTY_FORM: FormState = { title: '', sub: '', note: '', url: '' }

export default function ShareModal({ type, currentUser, onClose }: ShareModalProps) {
  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [loading, setLoading] = useState(false)

  const cfg = TYPE_CONFIG[type]

  const handleSubmit = async () => {
    if (!form.title || !form.note) return
    setLoading(true)

    await supabase.from('posts').insert({
      type,
      title: form.title,
      sub: form.sub || null,
      note: form.note,
      url: form.url || null,
      sender: currentUser,
    })

    setLoading(false)
    onClose()
  }

  const isValid = form.title.trim().length > 0 && form.note.trim().length > 0

  return (
    <div
      className='fixed inset-0 z-50 flex items-center justify-center bg-[rgba(90,55,80,0.28)]'
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className='relative w-80 rounded-2xl border border-[#e0c8d8] bg-[#fffaf8] px-7 pb-6 pt-7 shadow-sm'>
        {/* Close */}
        <button
          onClick={onClose}
          aria-label='close'
          className='absolute right-4 top-3.5 text-xl leading-none text-[#c9a8c0] hover:text-[#a07090] transition-colors'
        >
          ×
        </button>

        {/* Header */}
        <p className="mb-1.5 font-['Cormorant_Garamond'] text-xs italic tracking-widest text-[#a07090]">
          {cfg.icon} {cfg.label}
        </p>
        <h2 className="mb-5 font-['Cormorant_Garamond'] text-[22px] font-light leading-tight text-[#3d2435]">
          {cfg.description}
        </h2>

        {/* Fields */}
        <div className='flex flex-col gap-3'>
          <div>
            <label className="mb-1 block font-['DM_Sans'] text-[11px] uppercase tracking-widest text-[#a07090]">
              title
            </label>
            <input
              autoFocus
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              placeholder='title'
              className="w-full rounded-lg border border-[#d9b8d3] bg-white px-3 py-2 font-['DM_Sans'] text-sm text-[#3d2435] outline-none focus:border-[#b07aa0] transition-colors"
            />
          </div>

          <div>
            <label className="mb-1 block font-['DM_Sans'] text-[11px] uppercase tracking-widest text-[#a07090]">
              {cfg.subPlaceholder}
            </label>
            <input
              value={form.sub}
              onChange={(e) => setForm((f) => ({ ...f, sub: e.target.value }))}
              placeholder={cfg.subPlaceholder}
              className="w-full rounded-lg border border-[#d9b8d3] bg-white px-3 py-2 font-['DM_Sans'] text-sm text-[#3d2435] outline-none focus:border-[#b07aa0] transition-colors"
            />
          </div>

          <div>
            <label className="mb-1 block font-['DM_Sans'] text-[11px] uppercase tracking-widest text-[#a07090]">
              note
            </label>
            <textarea
              value={form.note}
              onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
              placeholder='why this one...'
              rows={2}
              className="w-full resize-none rounded-lg border border-[#d9b8d3] bg-white px-3 py-2 font-['DM_Sans'] text-sm text-[#3d2435] outline-none focus:border-[#b07aa0] transition-colors"
            />
          </div>

          <div>
            <label className="mb-1 block font-['DM_Sans'] text-[11px] uppercase tracking-widest text-[#a07090]">
              url
            </label>
            <input
              type='url'
              value={form.url}
              onChange={(e) => setForm((f) => ({ ...f, url: e.target.value }))}
              placeholder='https://'
              className="w-full rounded-lg border border-[#d9b8d3] bg-white px-3 py-2 font-['DM_Sans'] text-sm text-[#3d2435] outline-none focus:border-[#b07aa0] transition-colors"
            />
          </div>
        </div>

        {/* Actions */}
        <div className='mt-5 flex gap-2'>
          <button
            onClick={onClose}
            className="rounded-lg border border-[#d9b8d3] px-4 py-2 font-['DM_Sans'] text-sm text-[#a07090] transition-colors hover:bg-[#f5eaf3]"
          >
            cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || !isValid}
            className="flex-1 rounded-lg bg-[#b07aa0] py-2 font-['Cormorant_Garamond'] text-base italic tracking-wide text-white transition-opacity hover:bg-[#9c6a8d] disabled:opacity-40"
          >
            {loading ? '...' : 'send ✦'}
          </button>
        </div>
      </div>
    </div>
  )
}
