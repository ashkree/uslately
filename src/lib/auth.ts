// src/lib/auth.ts
export const USERS = ['Him', 'Her'] as const
export type AppUser = (typeof USERS)[number]

const SESSION_KEY = 'uslately_session'
const DEVICE_USER_KEY = 'uslately_device_user'
const pinKey = (name: AppUser) => `uslately_pin_${name}`

async function hashPin(pin: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(pin))
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

export function hasPinSet(user: AppUser): boolean {
  return !!localStorage.getItem(pinKey(user))
}

/** Store a hashed PIN for a user */
export async function savePinHash(user: AppUser, pin: string): Promise<void> {
  const hash = await hashPin(pin)
  localStorage.setItem(pinKey(user), hash)
}

/** Returns true if the PIN matches the stored hash */
export async function verifyPin(user: AppUser, pin: string): Promise<boolean> {
  const stored = localStorage.getItem(pinKey(user))
  if (!stored) return false
  const hash = await hashPin(pin)
  return hash === stored
}

export function getDeviceUser(): AppUser | null {
  const val = localStorage.getItem(DEVICE_USER_KEY)
  return USERS.includes(val as AppUser) ? (val as AppUser) : null
}

export function setDeviceUser(user: AppUser): void {
  localStorage.setItem(DEVICE_USER_KEY, user)
}

export function getSessionUser(): AppUser | null {
  const val = sessionStorage.getItem(SESSION_KEY)
  return USERS.includes(val as AppUser) ? (val as AppUser) : null
}

export function setSessionUser(user: AppUser): void {
  sessionStorage.setItem(SESSION_KEY, user)
}

export function clearSession(): void {
  sessionStorage.removeItem(SESSION_KEY)
}
