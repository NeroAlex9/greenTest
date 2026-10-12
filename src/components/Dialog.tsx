import { useEffect, type FormEvent, type ReactNode } from 'react'

interface Props {
  title: string
  children: ReactNode
  confirmLabel: string
  destructive?: boolean
  confirmDisabled?: boolean
  onConfirm: () => void
  onClose: () => void
}

export function Dialog({ title, children, confirmLabel, destructive, confirmDisabled, onConfirm, onClose }: Props) {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => event.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!confirmDisabled) onConfirm()
  }

  return (
    <div className="dialog-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <form className="dialog" role="dialog" aria-modal="true" aria-label={title} onSubmit={handleSubmit}>
        <h2 className="dialog__title">{title}</h2>
        <div className="dialog__body">{children}</div>
        <div className="dialog__actions">
          <button type="button" className="small-button small-button--ghost" onClick={onClose}>
            Отмена
          </button>
          <button
            type="submit"
            className={`small-button ${destructive ? 'small-button--danger' : ''}`}
            disabled={confirmDisabled}
            autoFocus={destructive}
          >
            {confirmLabel}
          </button>
        </div>
      </form>
    </div>
  )
}
