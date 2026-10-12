import { useState, type FormEvent } from 'react'
import { Typography } from '@maxhub/max-ui'
import { normalizePhone } from '../api/greenApi'
import type { Chat } from '../state/chats'
import { formatListTime } from '../format'
import { ChatAvatar } from './ChatAvatar'
import { MessageStatus } from './MessageStatus'
import { CloseIcon, PhoneIcon, PlusIcon, SearchIcon } from './icons'

interface Props {
  chats: Chat[]
  activeKey: string | null
  onSelect: (key: string) => void
  onOpen: (phone: string) => void
}

export function ChatList({ chats, activeKey, onSelect, onOpen }: Props) {
  const [creating, setCreating] = useState(false)
  const [phone, setPhone] = useState('')
  const [query, setQuery] = useState('')

  const digits = normalizePhone(phone)
  const valid = digits.length >= 10 && digits.length <= 15

  const search = query.trim().toLowerCase()
  const searchDigits = normalizePhone(search)
  const visibleChats = search
    ? chats.filter(
        (c) => c.title.toLowerCase().includes(search) || (searchDigits !== '' && c.phone?.includes(searchDigits)),
      )
    : chats

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!valid) return
    onOpen(digits)
    setPhone('')
    setCreating(false)
  }

  return (
    <aside className="sidebar">
      <header className="sidebar__header">
        <h1 className="sidebar__title">Чаты</h1>
        <button
          type="button"
          className={`round-button ${creating ? 'round-button--muted' : ''}`}
          onClick={() => setCreating((v) => !v)}
          aria-label={creating ? 'Отмена' : 'Новый чат'}
          title={creating ? 'Отмена' : 'Новый чат'}
        >
          {creating ? <CloseIcon size={20} /> : <PlusIcon size={20} />}
        </button>
      </header>

      {creating ? (
        <form className="sidebar__new-chat" onSubmit={handleSubmit}>
          <label className="field">
            <PhoneIcon size={18} />
            <input
              placeholder="+7 999 123-45-67"
              inputMode="tel"
              aria-label="Номер телефона получателя"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              autoFocus
            />
          </label>
          <button type="submit" className="small-button" disabled={!valid}>
            Создать
          </button>
        </form>
      ) : (
        <label className="field sidebar__search">
          <SearchIcon size={18} />
          <input placeholder="Найти" value={query} onChange={(e) => setQuery(e.target.value)} />
        </label>
      )}

      <div className="sidebar__list">
        {visibleChats.length === 0 && (
          <Typography.Body variant="small" className="muted sidebar__empty">
            {search ? 'Ничего не найдено' : 'Нажмите «+», чтобы начать чат по номеру телефона'}
          </Typography.Body>
        )}

        {visibleChats.map((chat) => {
          const last = chat.messages.at(-1)
          return (
            <button
              key={chat.key}
              type="button"
              className={`chat-row ${chat.key === activeKey ? 'chat-row--active' : ''}`}
              onClick={() => onSelect(chat.key)}
            >
              <ChatAvatar title={chat.title} size={56} />
              <span className="chat-row__body">
                <span className="chat-row__top">
                  <span className="chat-row__title">{chat.title}</span>
                  {last?.status && <MessageStatus status={last.status} />}
                  {last && <span className="chat-row__time">{formatListTime(last.timestamp)}</span>}
                </span>
                <span className="chat-row__preview">
                  {last ? (last.outgoing ? `Вы: ${last.text}` : last.text) : 'Нет сообщений'}
                </span>
              </span>
            </button>
          )
        })}
      </div>
    </aside>
  )
}
