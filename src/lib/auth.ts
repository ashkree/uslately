import { supabase } from './supabase'

export const USERS = ['Him', 'Her'] as const
export type AppUser = (typeof USERS)[number]

const DEVICE_USER_KEY = 'uslately_device_user'

const salt = import.meta.env.VITE_PIN_SALT

function buildPassword(pin: string): string {
  return `${pin}${salt}`
}

function emailForUser(user: AppUser): string {
  return `${user.toLowerCase()}@uslately.app`
}

export async function signIn(user: AppUser, pin: string): Promise<boolean> {
  const { error } = await supabase.auth.signInWithPassword({
    email: emailForUser(user),
    password: buildPassword(pin),
  })
  return !error
}

export async function signOut(): Promise<void> {
  await supabase.auth.signOut()
  localStorage.removeItem(DEVICE_USER_KEY)
}

export async function getSessionUser(): Promise<AppUser | null> {
  const { data } = await supabase.auth.getSession()
  if (!data.session) return null
  const email = data.session.user.email
  const match = USERS.find((u) => emailForUser(u) === email)
  return match ?? null
}

export function getDeviceUser(): AppUser | null {
  const val = localStorage.getItem(DEVICE_USER_KEY)
  return USERS.includes(val as AppUser) ? (val as AppUser) : null
}

export function setDeviceUser(user: AppUser): void {
  localStorage.setItem(DEVICE_USER_KEY, user)
}
