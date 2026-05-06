// src/App.tsx
import { useState } from 'react'
import { type AppUser, getSessionUser, getDeviceUser, clearSession } from './lib/auth'
import PinScreen from './components/PinScreen'
import Feed from './components/Feed'

export default function App() {
  const [user, setUser] = useState<AppUser | null>(getSessionUser)
  const deviceUser = getDeviceUser()

  const handleAuth = (authedUser: AppUser) => setUser(authedUser)

  const handleSignOut = () => {
    clearSession()
    setUser(null)
  }

  if (!user) {
    return <PinScreen onAuth={handleAuth} initialUser={deviceUser} />
  }

  return <Feed currentUser={user} onSignOut={handleSignOut} />
}
