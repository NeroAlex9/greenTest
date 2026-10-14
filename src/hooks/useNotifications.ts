import { useEffect, useRef } from 'react'
import { deleteNotification, GreenApiError, receiveNotification, type Credentials, type Notification } from '../api/greenApi'

const RECEIVE_TIMEOUT_SEC = 5
const RETRY_DELAY_MS = 3000

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export function useNotifications(
  credentials: Credentials,
  onNotification: (notification: Notification) => void,
  onError: (error: unknown) => void,
) {
  const handlers = useRef({ onNotification, onError })
  useEffect(() => {
    handlers.current = { onNotification, onError }
  })

  useEffect(() => {
    const controller = new AbortController()

    async function poll() {
      while (!controller.signal.aborted) {
        try {
          const notification = await receiveNotification(credentials, RECEIVE_TIMEOUT_SEC, controller.signal)
          if (!notification) continue

          handlers.current.onNotification(notification)
          await deleteNotification(credentials, notification.receiptId)
        } catch (error) {
          if (controller.signal.aborted) return
          // 408: сервер закрыл долгий запрос раньше времени, новых уведомлений нет
          if (error instanceof GreenApiError && error.status === 408) continue
          handlers.current.onError(error)
          await sleep(RETRY_DELAY_MS)
        }
      }
    }

    poll()
    return () => controller.abort()
  }, [credentials])
}
