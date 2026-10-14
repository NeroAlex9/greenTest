export const DEFAULT_API_URL = 'https://api.green-api.com'

export interface Credentials {
  apiUrl: string
  idInstance: string
  apiTokenInstance: string
}

export interface SenderData {
  chatId: string
  chatName?: string
  sender?: string
  senderName?: string
  senderPhoneNumber?: number
}

export interface MessageData {
  typeMessage: string
  textMessageData?: { textMessage: string }
  extendedTextMessageData?: { text: string }
}

export interface Notification {
  receiptId: number
  body: {
    typeWebhook: string
    timestamp: number
    idMessage?: string
    status?: string
    chatId?: string
    senderData?: SenderData
    messageData?: MessageData
  }
}

export class GreenApiError extends Error {
  status: number

  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

function buildUrl({ apiUrl, idInstance, apiTokenInstance }: Credentials, method: string, suffix = '') {
  const base = apiUrl.trim().replace(/\/+$/, '')
  return `${base}/waInstance${idInstance.trim()}/${method}/${apiTokenInstance.trim()}${suffix}`
}

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, init)
  const text = await response.text()

  if (!response.ok) {
    throw new GreenApiError(response.status, text || response.statusText)
  }

  return (text ? JSON.parse(text) : null) as T
}

export const DEMO_ID_INSTANCE = 'demo'

const isDemo = (credentials: Credentials) => credentials.idInstance === DEMO_ID_INSTANCE

export function getStateInstance(credentials: Credentials) {
  if (isDemo(credentials)) return Promise.resolve({ stateInstance: 'authorized' })
  return request<{ stateInstance: string }>(buildUrl(credentials, 'getStateInstance'))
}

export function sendMessage(credentials: Credentials, chatId: string, message: string) {
  if (isDemo(credentials)) return import('./demo').then((demo) => demo.demoSendMessage(chatId, message))
  return request<{ idMessage: string }>(buildUrl(credentials, 'sendMessage'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chatId, message }),
  })
}

export function receiveNotification(credentials: Credentials, receiveTimeout: number, signal?: AbortSignal) {
  if (isDemo(credentials)) return import('./demo').then((demo) => demo.demoReceiveNotification(receiveTimeout, signal))
  return request<Notification | null>(
    buildUrl(credentials, 'receiveNotification', `?receiveTimeout=${receiveTimeout}`),
    { signal },
  )
}

export function deleteNotification(credentials: Credentials, receiptId: number) {
  if (isDemo(credentials)) return Promise.resolve({ result: true })
  return request<{ result: boolean }>(buildUrl(credentials, 'deleteNotification', `/${receiptId}`), {
    method: 'DELETE',
  })
}

export function normalizePhone(value: string) {
  const digits = value.replace(/\D/g, '')
  return digits.length === 11 && digits.startsWith('8') ? `7${digits.slice(1)}` : digits
}

// Сервер инстанса задают первые 4 цифры idInstance: 3100123456 → https://3100.api.green-api.com
export function apiUrlForInstance(idInstance: string) {
  const digits = idInstance.replace(/\D/g, '')
  return digits.length >= 4 ? `https://${digits.slice(0, 4)}.api.green-api.com` : DEFAULT_API_URL
}

export function normalizeApiUrl(value: string) {
  const url = value.trim().replace(/\/+$/, '') || DEFAULT_API_URL
  return /^https?:\/\//i.test(url) ? url : `https://${url}`
}

export function phoneToChatId(phone: string) {
  return `${phone}@c.us`
}
