import { useState } from 'react'
import { DEFAULT_API_URL, DEMO_ID_INSTANCE, type Credentials } from './api/greenApi'
import { LoginForm } from './components/LoginForm'
import { Messenger } from './components/Messenger'
import { loadCredentials, saveCredentials } from './storage'

const demoFromUrl = (): Credentials | null =>
  import.meta.env.DEV && new URLSearchParams(location.search).has('demo')
    ? { apiUrl: DEFAULT_API_URL, idInstance: DEMO_ID_INSTANCE, apiTokenInstance: 'demo' }
    : null

export default function App() {
  const [credentials, setCredentials] = useState<Credentials | null>(() => demoFromUrl() ?? loadCredentials())

  function handleLogin(value: Credentials) {
    saveCredentials(value)
    setCredentials(value)
  }

  function handleLogout() {
    saveCredentials(null)
    setCredentials(null)
  }

  return credentials ? (
    <Messenger key={credentials.idInstance} credentials={credentials} onLogout={handleLogout} />
  ) : (
    <LoginForm onLogin={handleLogin} />
  )
}
