import { useState, useRef } from 'react'
import imageCompression from 'browser-image-compression'
import { supabase } from '../lib/supabase'
import { TYPE_CONFIG, type PostType } from '../types'

interface ShareModalProps {
  type: PostType
  currentUser: string
  onClose: () => void
  onSuccess: () => void
}

interface FormState {
  title: string
  sub: string
  note: string
  url: string
}

const EMPTY_FORM: FormState = { title: '', sub: '', note: '', url: '' }

export default function ShareModal({ type, currentUser, onClose, onSuccess }: ShareModalProps) {
  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [loading, setLoading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)

  const cameraInputRef = useRef<HTMLInputElement>(null)
  const galleryInputRef = useRef<HTMLInputElement>(null)

  const cfg = TYPE_CONFIG[type]

  const handleFileSelected = (file: File) => {
    setPhotoFile(file)
    setPhotoPreview(URL.createObjectURL(file))
  }

  const uploadPhoto = async (): Promise<string | null> => {
    if (!photoFile) return null

    setUploadProgress(5)

    // compress before uploading — brings 5MB phone photo down to ~500KB
    const compressed = await imageCompression(photoFile, {
      maxSizeMB: 0.8,
      maxWidthOrHeight: 1920,
      useWebWorker: true,
      onProgress: (p) => setUploadProgress(Math.round(p * 0.6)), // 0–60% = compression phase
    })

    setUploadProgress(65)

    const ext = photoFile.name.split('.').pop() ?? 'jpg'
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

    const { data, error } = await supabase.storage.from('photos').upload(filename, compressed, {
      cacheControl: '3600',
      upsert: false,
      contentType: compressed.type,
    })

    if (error) {
      console.error('Upload error:', error)
      return null
    }

    setUploadProgress(95)

    const { data: urlData } = supabase.storage.from('photos').getPublicUrl(data.path)

    setUploadProgress(100)
    return urlData.publicUrl
  }

  const handleSubmit = async () => {
    if (!form.note) return
    if (type === 'photo' && !photoFile) return
    if (type !== 'photo' && type !== 'thought' && !form.title) return

    setLoading(true)

    let image_url: string | null = null

    if (type === 'photo') {
      image_url = await uploadPhoto()
      if (!image_url) {
        setLoading(false)
        setUploadProgress(0)
        return
      }
    }

    const { error } = await supabase.from('posts').insert({
      type,
      title: type === 'thought' ? 'thought' : form.title,
      sub: form.sub || null,
      note: form.note,
      url: form.url || null,
      image_url,
      sender: currentUser,
    })

    setLoading(false)
    if (!error) onSuccess()
    onClose()
  }

  const hasNote = form.note.trim().length > 0
  const isValid =
    type === 'photo'
      ? !!photoFile && hasNote
      : type === 'thought'
        ? hasNote
        : form.title.trim().length > 0 && hasNote

  const progressLabel =
    uploadProgress < 60
      ? `compressing… ${uploadProgress}%`
      : uploadProgress < 95
        ? `uploading… ${uploadProgress}%`
        : 'saving…'

  return (
    <div
      className='fixed inset-0 z-50 flex items-end justify-center bg-[rgba(90,55,80,0.28)] sm:items-center'
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className='relative w-full max-w-sm rounded-t-3xl sm:rounded-2xl border border-[#e0c8d8] bg-[#fffaf8] px-7 pb-8 pt-7 shadow-sm'>
        {/* close */}
        <button
          onClick={onClose}
          aria-label='close'
          className='absolute right-4 top-3.5 text-xl leading-none text-[#c9a8c0] hover:text-[#a07090] transition-colors'
        >
          ×
        </button>

        {/* header */}
        <p className="mb-1.5 font-['Cormorant_Garamond'] text-xs italic tracking-widest text-[#a07090]">
          {cfg.icon} {cfg.label}
        </p>
        <h2 className="mb-5 font-['Cormorant_Garamond'] text-[22px] font-light leading-tight text-[#3d2435]">
          {cfg.description}
        </h2>

        <div className='flex flex-col gap-3'>
          {/* ── photo picker ── */}
          {type === 'photo' && (
            <>
              {/* hidden inputs */}
              <input
                ref={cameraInputRef}
                type='file'
                accept='image/*'
                capture='environment'
                className='hidden'
                onChange={(e) => e.target.files?.[0] && handleFileSelected(e.target.files[0])}
              />
              <input
                ref={galleryInputRef}
                type='file'
                accept='image/*'
                className='hidden'
                onChange={(e) => e.target.files?.[0] && handleFileSelected(e.target.files[0])}
              />

              {photoPreview ? (
                <div className='relative mb-1'>
                  <img
                    src={photoPreview}
                    alt='preview'
                    className='w-full rounded-xl object-cover max-h-56'
                  />
                  <button
                    onClick={() => {
                      setPhotoFile(null)
                      setPhotoPreview(null)
                    }}
                    className='absolute top-2 right-2 h-6 w-6 rounded-full bg-[rgba(61,36,53,0.6)] text-white text-xs flex items-center justify-center'
                  >
                    ×
                  </button>
                </div>
              ) : (
                <div className='grid grid-cols-2 gap-2 mb-1'>
                  <button
                    onClick={() => cameraInputRef.current?.click()}
                    className="py-7 rounded-xl border-2 border-dashed border-[#d9b8d3] bg-white/60 font-['Cormorant_Garamond'] text-base italic text-[#a07090] hover:border-[#b07aa0] hover:bg-white transition-all active:scale-95"
                  >
                    ◎ camera
                  </button>
                  <button
                    onClick={() => galleryInputRef.current?.click()}
                    className="py-7 rounded-xl border-2 border-dashed border-[#d9b8d3] bg-white/60 font-['Cormorant_Garamond'] text-base italic text-[#a07090] hover:border-[#b07aa0] hover:bg-white transition-all active:scale-95"
                  >
                    ✦ gallery
                  </button>
                </div>
              )}
            </>
          )}

          {/* title — not for photo or thought */}
          {type !== 'photo' && type !== 'thought' && (
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
          )}

          {/* sub — not for thought */}
          {type !== 'thought' && (
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
          )}

          {/* note */}
          <div>
            <label className="mb-1 block font-['DM_Sans'] text-[11px] uppercase tracking-widest text-[#a07090]">
              note
            </label>
            <textarea
              value={form.note}
              onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
              placeholder={type === 'thought' ? "what's on your mind?" : 'why this one…'}
              rows={2}
              className="w-full resize-none rounded-lg border border-[#d9b8d3] bg-white px-3 py-2 font-['DM_Sans'] text-sm text-[#3d2435] outline-none focus:border-[#b07aa0] transition-colors"
            />
          </div>

          {/* url — only shown if cfg.urlPrompt is set */}
          {cfg.urlPrompt && (
            <div>
              <label className="mb-1 block font-['DM_Sans'] text-[11px] uppercase tracking-widest text-[#a07090]">
                link (optional)
              </label>
              <input
                type='url'
                value={form.url}
                onChange={(e) => setForm((f) => ({ ...f, url: e.target.value }))}
                placeholder='https://'
                className="w-full rounded-lg border border-[#d9b8d3] bg-white px-3 py-2 font-['DM_Sans'] text-sm text-[#3d2435] outline-none focus:border-[#b07aa0] transition-colors"
              />
            </div>
          )}

          {/* progress bar — photo uploads only */}
          {loading && type === 'photo' && uploadProgress > 0 && (
            <div>
              <div className='h-1 w-full rounded-full bg-[#e0c8d8] overflow-hidden'>
                <div
                  className='h-full rounded-full bg-[#b07aa0] transition-all duration-300'
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <p className="mt-1 font-['DM_Sans'] text-[11px] text-[#a07090]">{progressLabel}</p>
            </div>
          )}
        </div>

        {/* actions */}
        <div className='mt-5 flex gap-2'>
          <button
            onClick={onClose}
            disabled={loading}
            className="rounded-lg border border-[#d9b8d3] px-4 py-2 font-['DM_Sans'] text-sm text-[#a07090] transition-colors hover:bg-[#f5eaf3] disabled:opacity-40"
          >
            cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || !isValid}
            className="flex-1 rounded-lg bg-[#b07aa0] py-2 font-['Cormorant_Garamond'] text-base italic tracking-wide text-white transition-opacity hover:bg-[#9c6a8d] disabled:opacity-40"
          >
            {loading ? '…' : 'send ✦'}
          </button>
        </div>
      </div>
    </div>
  )
}
