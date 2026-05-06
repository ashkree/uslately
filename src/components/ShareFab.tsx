import { useState } from 'react'
import { TYPE_CONFIG, type PostType } from '../types'
import ShareModal from './ShareModal'

interface ShareFABProps {
  currentUser: string
  onShareSuccess: () => void
}

const TYPE_ORDER: PostType[] = ['music', 'movie', 'article']

export default function ShareFAB({ currentUser, onShareSuccess }: ShareFABProps) {
  const [fabOpen, setFabOpen] = useState(false)
  const [activeType, setActiveType] = useState<PostType | null>(null)

  const openModal = (type: PostType) => {
    setActiveType(type)
    setFabOpen(false)
  }

  return (
    <>
      {/* FAB container — fixed bottom right */}
      <div className='fixed bottom-7 right-7 z-40 flex flex-col items-end gap-2.5'>
        {/* Child buttons */}
        <div
          className={`flex flex-col items-end gap-2.5 transition-all duration-200 ${
            fabOpen
              ? 'opacity-100 translate-y-0 pointer-events-auto'
              : 'opacity-0 translate-y-2 pointer-events-none'
          }`}
        >
          {TYPE_ORDER.map((type, i) => {
            const cfg = TYPE_CONFIG[type]
            return (
              <button
                key={type}
                onClick={() => openModal(type)}
                aria-label={cfg.description}
                style={{ transitionDelay: fabOpen ? `${i * 40}ms` : '0ms' }}
                className={`flex items-center gap-2.5 transition-all duration-200 ${
                  fabOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
                }`}
              >
                {/* Label */}
                <span className="rounded-full border border-[#d9b8d3] bg-white/90 px-3 py-1 font-['Cormorant_Garamond'] text-sm italic font-light tracking-wide text-[#7a5c72] whitespace-nowrap">
                  {cfg.description}
                </span>

                {/* Icon circle — aligned with main FAB below */}
                <span className='flex h-10.5 w-10.5 items-center justify-center rounded-full border border-[#d9b8d3] bg-white/90 text-base text-[#7a5c72]'>
                  {cfg.icon}
                </span>
              </button>
            )
          })}
        </div>

        {/* Main FAB */}
        <button
          onClick={() => setFabOpen((o) => !o)}
          aria-label={fabOpen ? 'close' : 'share'}
          className={`flex h-13 w-13 items-center justify-center rounded-full bg-[#b07aa0] text-2xl text-white shadow-[0_4px_20px_rgba(176,122,160,0.4)] transition-all duration-300 hover:bg-[#9c6a8d] ${
            fabOpen ? 'rotate-45' : 'rotate-0'
          }`}
        >
          +
        </button>
      </div>

      {/* Modal */}
      {activeType && (
        <ShareModal
          type={activeType}
          currentUser={currentUser}
          onClose={() => setActiveType(null)}
          onSuccess={onShareSuccess}
        />
      )}
    </>
  )
}
