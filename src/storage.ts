import type { Credentials } from './api/greenApi'
import type { Chat } from './state/chats'

const CREDENTIALS_KEY = 'max-chat:credentials'
const chatsKey = (idInstance: string) => `max-chat:chats:${idInstance}`

function read<T>(storage: Storage, key: string): T | null {
  try {
    const raw = storage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : null
  } catch {
    return null
  }
}

function write(storage: Storage, key: string, value: unknown) {
  try {
    if (value === null) storage.removeItem(key)
    else storage.setItem(key, JSON.stringify(value))
  } catch {
  }
}

export const loadCredentials = () => read<Credentials>(sessionStorage, CREDENTIALS_KEY)
export const saveCredentials = (credentials: Credentials | null) =>
  write(sessionStorage, CREDENTIALS_KEY, credentials)

export const loadChats = (idInstance: string) => read<Chat[]>(localStorage, chatsKey(idInstance)) ?? []
export const saveChats = (idInstance: string, chats: Chat[]) => write(localStorage, chatsKey(idInstance), chats)
