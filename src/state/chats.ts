import type { Notification } from '../api/greenApi'

export type MessageStatus = 'pending' | 'sent' | 'delivered' | 'read' | 'failed'

export interface Message {
  id: string
  text: string
  outgoing: boolean
  timestamp: number
  status?: MessageStatus
}

export interface Chat {
  key: string
  phone?: string
  chatId?: string
  title: string
  messages: Message[]
}

export type ChatsAction =
  | { type: 'open'; phone: string }
  | { type: 'send'; chatKey: string; tempId: string; text: string }
  | { type: 'sent'; chatKey: string; tempId: string; idMessage: string }
  | { type: 'sendFailed'; chatKey: string; tempId: string }
  | { type: 'rename'; chatKey: string; title: string }
  | { type: 'delete'; chatKey: string }
  | { type: 'notification'; notification: Notification }

const STATUSES: MessageStatus[] = ['sent', 'delivered', 'read', 'failed']

function updateChat(chats: Chat[], key: string, update: (chat: Chat) => Chat) {
  return chats.map((chat) => (chat.key === key ? update(chat) : chat))
}

function updateMessage(chat: Chat, id: string, update: (message: Message) => Message): Chat {
  return { ...chat, messages: chat.messages.map((m) => (m.id === id ? update(m) : m)) }
}

function addMessage(chat: Chat, message: Message): Chat {
  if (chat.messages.some((m) => m.id === message.id)) return chat
  return { ...chat, messages: [...chat.messages, message] }
}

function moveToTop(chats: Chat[], key: string) {
  const chat = chats.find((c) => c.key === key)
  return chat ? [chat, ...chats.filter((c) => c.key !== key)] : chats
}

function getText(notification: Notification) {
  const data = notification.body.messageData
  if (!data) return null
  return data.textMessageData?.textMessage ?? data.extendedTextMessageData?.text ?? null
}

function findChat(chats: Chat[], chatId: string, phone?: string) {
  return chats.find((c) => c.chatId === chatId || c.key === chatId || (phone !== undefined && c.phone === phone))
}

function applyNotification(chats: Chat[], { body }: Notification): Chat[] {
  switch (body.typeWebhook) {
    case 'incomingMessageReceived':
    case 'outgoingMessageReceived':
    case 'outgoingAPIMessageReceived': {
      const text = getText({ receiptId: 0, body })
      const sender = body.senderData
      if (text === null || !sender || !body.idMessage) return chats

      const outgoing = body.typeWebhook !== 'incomingMessageReceived'
      const phone = !outgoing && sender.senderPhoneNumber ? String(sender.senderPhoneNumber) : undefined
      const message: Message = {
        id: body.idMessage,
        text,
        outgoing,
        timestamp: body.timestamp * 1000,
        status: outgoing ? 'sent' : undefined,
      }

      const ownChat = chats.find((c) => c.messages.some((m) => m.id === body.idMessage))
      if (ownChat) {
        return updateChat(chats, ownChat.key, (c) => ({ ...c, chatId: c.chatId ?? sender.chatId }))
      }

      const existing = findChat(chats, sender.chatId, phone)
      if (existing) {
        const updated = updateChat(chats, existing.key, (c) =>
          addMessage({ ...c, chatId: sender.chatId, phone: c.phone ?? phone }, message),
        )
        return moveToTop(updated, existing.key)
      }

      const chat: Chat = {
        key: sender.chatId,
        chatId: sender.chatId,
        phone,
        title: sender.chatName || sender.senderName || phone || sender.chatId,
        messages: [message],
      }
      return [chat, ...chats]
    }

    case 'outgoingMessageStatus': {
      const status = body.status as MessageStatus
      if (!body.idMessage || !STATUSES.includes(status)) return chats
      return chats.map((chat) =>
        chat.messages.some((m) => m.id === body.idMessage)
          ? updateMessage({ ...chat, chatId: chat.chatId ?? body.chatId }, body.idMessage!, (m) => ({
              ...m,
              status,
            }))
          : chat,
      )
    }

    default:
      return chats
  }
}

export function chatsReducer(chats: Chat[], action: ChatsAction): Chat[] {
  switch (action.type) {
    case 'open':
      if (chats.some((c) => c.phone === action.phone || c.key === action.phone)) {
        return moveToTop(chats, chats.find((c) => c.phone === action.phone || c.key === action.phone)!.key)
      }
      return [{ key: action.phone, phone: action.phone, title: `+${action.phone}`, messages: [] }, ...chats]

    case 'send':
      return moveToTop(
        updateChat(chats, action.chatKey, (c) =>
          addMessage(c, {
            id: action.tempId,
            text: action.text,
            outgoing: true,
            timestamp: Date.now(),
            status: 'pending',
          }),
        ),
        action.chatKey,
      )

    case 'sent':
      return updateChat(chats, action.chatKey, (c) =>
        updateMessage(c, action.tempId, (m) => ({ ...m, id: action.idMessage, status: 'sent' })),
      )

    case 'sendFailed':
      return updateChat(chats, action.chatKey, (c) =>
        updateMessage(c, action.tempId, (m) => ({ ...m, status: 'failed' })),
      )

    case 'rename':
      return updateChat(chats, action.chatKey, (c) => ({ ...c, title: action.title }))

    case 'delete':
      return chats.filter((c) => c.key !== action.chatKey)

    case 'notification':
      return applyNotification(chats, action.notification)
  }
}
