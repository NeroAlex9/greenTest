import type { MessageStatus as Status } from '../state/chats'
import { AlertIcon, ClockIcon, TicksIcon } from './icons'

const TITLES: Record<Status, string> = {
  pending: 'Отправляется',
  sent: 'Отправлено',
  delivered: 'Доставлено',
  read: 'Прочитано',
  failed: 'Не отправлено',
}

export function MessageStatus({ status }: { status: Status }) {
  return (
    <span className={`status status--${status}`} title={TITLES[status]}>
      {status === 'pending' && <ClockIcon />}
      {status === 'sent' && <TicksIcon />}
      {(status === 'delivered' || status === 'read') && <TicksIcon double />}
      {status === 'failed' && <AlertIcon />}
    </span>
  )
}
