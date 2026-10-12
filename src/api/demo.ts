import type { Notification } from './greenApi'

type Body = Notification['body']

const queue: Body[] = []
const waiters = new Set<() => void>()
let receiptId = 0
let messageId = 0
let seeded = false

const now = () => Math.floor(Date.now() / 1000)

function push(body: Body) {
  queue.push(body)
  waiters.forEach((wake) => wake())
}

function seed() {
  if (seeded) return
  seeded = true
  push({
    typeWebhook: 'incomingMessageReceived',
    timestamp: now(),
    idMessage: 'demo-welcome',
    senderData: {
      chatId: '79991234567',
      chatName: 'Анна (демо)',
      senderName: 'Анна (демо)',
      senderPhoneNumber: 79991234567,
    },
    messageData: {
      typeMessage: 'textMessage',
      textMessageData: { textMessage: 'Привет! Это демо-чат: напиши что-нибудь, и я отвечу 🙂' },
    },
  })
}

export function demoSendMessage(chatId: string, message: string) {
  const idMessage = `demo-${Date.now()}-${++messageId}`
  const phone = chatId.replace(/@c\.us$/, '')

  setTimeout(() => push({ typeWebhook: 'outgoingMessageStatus', timestamp: now(), idMessage, chatId: phone, status: 'delivered' }), 600)
  setTimeout(() => push({ typeWebhook: 'outgoingMessageStatus', timestamp: now(), idMessage, chatId: phone, status: 'read' }), 1400)
  setTimeout(
    () =>
      push({
        typeWebhook: 'incomingMessageReceived',
        timestamp: now(),
        idMessage: `demo-reply-${idMessage}`,
        senderData: { chatId: phone, senderPhoneNumber: Number(phone) || undefined },
        messageData: { typeMessage: 'textMessage', textMessageData: { textMessage: `Получил: «${message}»` } },
      }),
    2500,
  )

  return Promise.resolve({ idMessage })
}

export function demoReceiveNotification(receiveTimeout: number, signal?: AbortSignal): Promise<Notification | null> {
  seed()
  return new Promise((resolve, reject) => {
    let timer: ReturnType<typeof setTimeout> | undefined

    const finish = () => {
      clearTimeout(timer)
      waiters.delete(finish)
      signal?.removeEventListener('abort', abort)
      const body = queue.shift()
      resolve(body ? { receiptId: ++receiptId, body } : null)
    }
    const abort = () => {
      clearTimeout(timer)
      waiters.delete(finish)
      reject(new DOMException('Aborted', 'AbortError'))
    }

    if (signal?.aborted) return abort()
    if (queue.length) return finish()

    timer = setTimeout(finish, receiveTimeout * 1000)
    waiters.add(finish)
    signal?.addEventListener('abort', abort, { once: true })
  })
}
