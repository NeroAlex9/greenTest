import { useCallback, useEffect, useReducer, useState } from 'react'
import { useSnackbar } from '@maxhub/max-ui'
import { GreenApiError, phoneToChatId, sendMessage, type Credentials, type Notification } from '../api/greenApi'
import { chatsReducer } from '../state/chats'
import { useNotifications } from '../hooks/useNotifications'
import { loadChats, saveChats } from '../storage'
import { ChatList } from './ChatList'
import { ChatWindow } from './ChatWindow'
import { ChatsIcon, LogoutIcon } from './icons'

interface Props {
  credentials: Credentials
  onLogout: () => void
}

export function Messenger({ credentials, onLogout }: Props) {
  const [chats, dispatch] = useReducer(chatsReducer, credentials.idInstance, loadChats)
  const [activeKey, setActiveKey] = useState<string | null>(null)
  const { showSnackbar } = useSnackbar()
  const showError = useCallback((text: string) => showSnackbar({ id: text, text }), [showSnackbar])

  useEffect(() => saveChats(credentials.idInstance, chats), [credentials.idInstance, chats])

  useNotifications(
    credentials,
    useCallback((notification: Notification) => dispatch({ type: 'notification', notification }), []),
    useCallback(
      (e: unknown) => {
        if (e instanceof GreenApiError && (e.status === 401 || e.status === 403)) {
          showError('Доступ к инстансу запрещён. Войдите заново.')
          onLogout()
          return
        }
        showError(
          e instanceof GreenApiError
            ? `Ошибка получения сообщений (${e.status}). Проверьте, что в настройках инстанса не задан webhookUrl.`
            : 'Нет соединения с GREEN-API, повторяем...',
        )
      },
      [showError, onLogout],
    ),
  )

  const activeChat = chats.find((c) => c.key === activeKey) ?? null

  function openChat(phone: string) {
    dispatch({ type: 'open', phone })
    const existing = chats.find((c) => c.phone === phone || c.key === phone)
    setActiveKey(existing?.key ?? phone)
  }

  async function send(text: string) {
    if (!activeChat) return
    const chatKey = activeChat.key
    const tempId = `local-${crypto.randomUUID()}`
    dispatch({ type: 'send', chatKey, tempId, text })

    try {
      const chatId = activeChat.chatId ?? phoneToChatId(activeChat.phone ?? activeChat.key)
      const { idMessage } = await sendMessage(credentials, chatId, text)
      dispatch({ type: 'sent', chatKey, tempId, idMessage })
    } catch (e) {
      dispatch({ type: 'sendFailed', chatKey, tempId })
      showError(e instanceof GreenApiError ? `Не удалось отправить сообщение (${e.status})` : 'Не удалось отправить сообщение')
    }
  }

  return (
    <div className={`messenger ${activeChat ? 'messenger--chat-open' : ''}`}>
      <nav className="rail">
        <img className="rail__logo" src={`${import.meta.env.BASE_URL}logo.png`} alt="logo" width={48} height={48} />
        <div className="rail__item rail__item--active">
          <ChatsIcon />
          <span>Все</span>
        </div>
        <button type="button" className="rail__item rail__item--bottom" onClick={onLogout} title={`Инстанс ${credentials.idInstance}`}>
          <LogoutIcon />
          <span>Выйти</span>
        </button>
      </nav>

      <ChatList chats={chats} activeKey={activeKey} onSelect={setActiveKey} onOpen={openChat} />

      {activeChat ? (
        <ChatWindow
          key={activeChat.key}
          chat={activeChat}
          onSend={send}
          onBack={() => setActiveKey(null)}
          onRename={(title) => dispatch({ type: 'rename', chatKey: activeChat.key, title })}
          onDelete={() => {
            dispatch({ type: 'delete', chatKey: activeChat.key })
            setActiveKey(null)
          }}
        />
      ) : (
        <section className="chat chat--placeholder">
          <span className="chat__hint">Выберите чат или создайте новый</span>
        </section>
      )}
    </div>
  )
}
