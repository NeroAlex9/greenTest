import { Fragment, useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from 'react'
import { Typography } from '@maxhub/max-ui'
import type { Chat } from '../state/chats'
import { formatDayLabel, formatTime, isSameDay } from '../format'
import { ChatAvatar } from './ChatAvatar'
import { MessageStatus } from './MessageStatus'
import { Dialog } from './Dialog'
import { BackIcon, EditIcon, MoreIcon, SendIcon, TrashIcon } from './icons'

const MAX_LENGTH = 4000

interface Props {
  chat: Chat
  onSend: (text: string) => void
  onBack: () => void
  onRename: (title: string) => void
  onDelete: () => void
}

export function ChatWindow({ chat, onSend, onBack, onRename, onDelete }: Props) {
  const [text, setText] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)
  const [dialog, setDialog] = useState<'rename' | 'delete' | null>(null)
  const [newTitle, setNewTitle] = useState('')
  const menuRef = useRef<HTMLDivElement>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: 'end' })
  }, [chat.messages.length])

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  useEffect(() => {
    if (!menuOpen) return
    const onMouseDown = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) setMenuOpen(false)
    }
    document.addEventListener('mousedown', onMouseDown)
    return () => document.removeEventListener('mousedown', onMouseDown)
  }, [menuOpen])

  function openDialog(kind: 'rename' | 'delete') {
    setMenuOpen(false)
    setNewTitle(chat.title)
    setDialog(kind)
  }

  useEffect(() => {
    const input = inputRef.current
    if (!input) return
    input.style.height = 'auto'
    input.style.height = `${input.scrollHeight}px`
  }, [text])

  function submit() {
    const message = text.trim()
    if (!message) return
    onSend(message)
    setText('')
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    submit()
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      submit()
    }
  }

  const subtitle = chat.phone && chat.title !== `+${chat.phone}` ? `+${chat.phone}` : 'MAX'

  return (
    <section className="chat">
      <header className="chat__header">
        <button type="button" className="icon-button" onClick={onBack} aria-label="Назад" title="Назад">
          <BackIcon />
        </button>
        <ChatAvatar title={chat.title} size={40} />
        <div className="chat__title">
          <span className="chat__name">{chat.title}</span>
          <span className="chat__subtitle">{subtitle}</span>
        </div>

        <div className="menu" ref={menuRef}>
          <button
            type="button"
            className="icon-button icon-button--always"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Действия с чатом"
            aria-expanded={menuOpen}
            title="Действия с чатом"
          >
            <MoreIcon />
          </button>
          {menuOpen && (
            <div className="menu__list" role="menu">
              <button type="button" role="menuitem" className="menu__item" onClick={() => openDialog('rename')}>
                <EditIcon size={18} />
                Переименовать
              </button>
              <button
                type="button"
                role="menuitem"
                className="menu__item menu__item--danger"
                onClick={() => openDialog('delete')}
              >
                <TrashIcon size={18} />
                Удалить чат
              </button>
            </div>
          )}
        </div>
      </header>

      {dialog === 'rename' && (
        <Dialog
          title="Переименовать чат"
          confirmLabel="Сохранить"
          confirmDisabled={!newTitle.trim()}
          onConfirm={() => {
            onRename(newTitle.trim())
            setDialog(null)
          }}
          onClose={() => setDialog(null)}
        >
          <label className="field">
            <input
              value={newTitle}
              maxLength={64}
              onChange={(e) => setNewTitle(e.target.value)}
              onFocus={(e) => e.target.select()}
              aria-label="Название чата"
              autoFocus
            />
          </label>
        </Dialog>
      )}

      {dialog === 'delete' && (
        <Dialog
          title="Удалить чат?"
          confirmLabel="Удалить"
          destructive
          onConfirm={onDelete}
          onClose={() => setDialog(null)}
        >
          Чат «{chat.title}» и его история будут удалены из этого браузера. В MAX сообщения останутся. Если собеседник
          напишет снова, чат появится заново.
        </Dialog>
      )}

      <div className="chat__scroll">
        <div className="chat__messages">
          {chat.messages.length === 0 && (
            <Typography.Body variant="small" className="chat__empty">
              Сообщений пока нет. Напишите первым!
            </Typography.Body>
          )}

          {chat.messages.map((message, index) => {
            const previous = chat.messages[index - 1]
            const newDay = !previous || !isSameDay(previous.timestamp, message.timestamp)
            return (
              <Fragment key={message.id}>
                {newDay && <div className="day-separator">{formatDayLabel(message.timestamp)}</div>}
                <div className={`bubble ${message.outgoing ? 'bubble--out' : 'bubble--in'}`}>
                  <span className="bubble__text">{message.text}</span>
                  <span className="bubble__meta">
                    {formatTime(message.timestamp)}
                    {message.status && <MessageStatus status={message.status} />}
                  </span>
                </div>
              </Fragment>
            )
          })}
          <div ref={bottomRef} />
        </div>
      </div>

      <form className="composer" onSubmit={handleSubmit}>
        <div className="composer__field">
          <textarea
            ref={inputRef}
            placeholder="Сообщение"
            rows={1}
            maxLength={MAX_LENGTH}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          {text.trim() && (
            <button type="submit" className="composer__send" aria-label="Отправить" title="Отправить (Enter)">
              <SendIcon size={20} />
            </button>
          )}
        </div>
      </form>
    </section>
  )
}
