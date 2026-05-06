// src/components/PinScreen.tsx
import { useEffect, useState } from 'react'
import { USERS, type AppUser, signIn, setDeviceUser } from '../lib/auth'

interface PinScreenProps {
  onAuth: (user: AppUser) => void
  initialUser?: AppUser | null
}

type Step = 'pick_name' | 'enter_pin'

const PIN_LENGTH = 4

function PinDots({ filled, shake }: { filled: number; shake: boolean }) {
  return (
    <div className={`flex gap-5 justify-center my-10 ${shake ? 'animate-[shake_0.35s_ease]' : ''}`}>
      {Array.from({ length: PIN_LENGTH }).map((_, i) => (
        <div
          key={i}
          className={`w-3.5 h-3.5 rounded-full border-2 transition-all duration-150 ${
            i < filled
              ? 'bg-[#b07aa0] border-[#b07aa0] scale-110'
              : 'bg-transparent border-[#d9b8d3]'
          }`}
        />
      ))}
    </div>
  )
}

function NumPad({ onPress, disabled }: { onPress: (key: string) => void; disabled?: boolean }) {
  const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', '⌫']
  return (
    <div className='grid grid-cols-3 gap-3 w-64 mx-auto select-none'>
      {keys.map((key, i) => {
        if (!key) return <div key={i} />
        const isDelete = key === '⌫'
        return (
          <button
            key={i}
            onClick={() => !disabled && onPress(key)}
            disabled={disabled}
            className={`h-14 rounded-2xl text-xl font-light transition-all duration-100 active:scale-95
              ${
                isDelete
                  ? "text-[#a07090] bg-transparent font-['Cormorant_Garamond'] text-2xl"
                  : 'bg-white/70 border border-[#e0c8d8] text-[#3d2435] hover:bg-white active:bg-[#f5eaf3] disabled:opacity-40'
              }`}
          >
            {key}
          </button>
        )
      })}
    </div>
  )
}

export default function PinScreen({ onAuth, initialUser }: PinScreenProps) {
  const [step, setStep] = useState<Step>(initialUser ? 'enter_pin' : 'pick_name')
  const [user, setUser] = useState<AppUser | null>(initialUser ?? null)
  // `digits` holds the currently entered PIN digits for every step
  const [digits, setDigits] = useState('')
  // `firstDigits` holds the first PIN entry during set_pin so we can compare in confirm_pin
  const [firstDigits, setFirstDigits] = useState('')
  const [shake, setShake] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Keyboard support
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (step === 'pick_name') return
      if (/^[0-9]$/.test(e.key)) handleKey(e.key)
      if (e.key === 'Backspace') handleKey('⌫')
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [step, digits, firstDigits]) // eslint-disable-line react-hooks/exhaustive-deps

  const triggerShake = () => {
    setShake(true)
    setTimeout(() => setShake(false), 400)
  }

  const handleKey = (key: string) => {
    if (loading) return
    if (key === '⌫') {
      setDigits((d) => d.slice(0, -1))
      setError('')
      return
    }
    if (digits.length >= PIN_LENGTH) return
    const next = digits + key
    setDigits(next)
    if (next.length === PIN_LENGTH) {
      setTimeout(() => handlePinComplete(next), 120)
    }
  }

  const handlePinComplete = async (completed: string) => {
    if (!user) return
    setLoading(true)
    const ok = await signIn(user, completed)
    setLoading(false)
    if (ok) {
      setDeviceUser(user)
      onAuth(user)
    } else {
      triggerShake()
      setDigits('')
      setError('Wrong PIN — try again')
    }
  }

  const handlePickName = (picked: AppUser) => {
    setUser(picked)
    setStep('enter_pin')
    setError('')
    setDigits('')
  }

  const handleBack = () => {
    setUser(null)
    setDigits('')
    setFirstDigits('')
    setError('')
    setStep('pick_name')
  }

  const headings: Record<Step, string> = {
    pick_name: 'who are you?',
    enter_pin: 'welcome back',
  }

  const subheadings: Record<Step, string> = {
    pick_name: '',
    enter_pin: `enter your pin, ${user?.toLowerCase() ?? ''}`,
  }

  return (
    <div className='min-h-screen flex items-center justify-center bg-[#f5eaf3]'>
      <div className='w-full max-w-sm px-6 flex flex-col items-center text-center'>
        <p className="font-['Cormorant_Garamond'] text-sm italic tracking-[0.2em] text-[#a07090] mb-2">
          us, lately
        </p>

        <h1 className="font-['Cormorant_Garamond'] text-3xl font-light text-[#3d2435] mb-1">
          {headings[step]}
        </h1>

        {subheadings[step] && (
          <p className="font-['DM_Sans'] text-sm text-[#a07090] mb-2">{subheadings[step]}</p>
        )}

        {/* Name picker */}
        {step === 'pick_name' && (
          <div className='flex gap-4 mt-10'>
            {USERS.map((u) => (
              <button
                key={u}
                onClick={() => handlePickName(u)}
                className="w-32 py-4 rounded-2xl border border-[#d9b8d3] bg-white/70 font-['Cormorant_Garamond'] text-xl italic font-light text-[#7a5c72] hover:bg-white hover:border-[#b07aa0] transition-all duration-150 active:scale-95"
              >
                {u}
              </button>
            ))}
          </div>
        )}

        {/* PIN entry */}
        {step !== 'pick_name' && (
          <>
            <PinDots filled={digits.length} shake={shake} />

            <p
              className={`font-['DM_Sans'] text-xs text-[#b07aa0] mb-6 h-4 transition-opacity duration-200 ${
                error ? 'opacity-100' : 'opacity-0'
              }`}
            >
              {error || ' '}
            </p>

            <NumPad onPress={handleKey} disabled={loading} />

            <button
              onClick={handleBack}
              className="mt-8 font-['Cormorant_Garamond'] text-sm italic text-[#c9a8c0] hover:text-[#a07090] transition-colors"
            >
              ← not you?
            </button>
          </>
        )}
      </div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20%       { transform: translateX(-8px); }
          40%       { transform: translateX(8px); }
          60%       { transform: translateX(-6px); }
          80%       { transform: translateX(6px); }
        }
      `}</style>
    </div>
  )
}
