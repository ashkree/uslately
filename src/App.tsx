import { useState, useEffect } from 'react'
import { type AppUser, getSessionUser, getDeviceUser, signOut } from './lib/auth'
import PinScreen from './components/PinScreen'
import Feed from './components/Feed'

export default function App() {
  const [user, setUser] = useState<AppUser | null>(null)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    getSessionUser().then((u) => {
      setUser(u)
      setChecking(false)
    })
  }, [])

  const handleAuth = (authedUser: AppUser) => setUser(authedUser)

  const handleSignOut = async () => {
    await signOut()
    setUser(null)
  }

  if (checking) return null

  if (!user) {
    return <PinScreen onAuth={handleAuth} initialUser={getDeviceUser()} />
  }

  return <Feed currentUser={user} onSignOut={handleSignOut} />
}
