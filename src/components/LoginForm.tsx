import { useState, type FormEvent, type ReactNode } from 'react'
import { Button, Input, Typography } from '@maxhub/max-ui'
import {
  DEFAULT_API_URL,
  DEMO_ID_INSTANCE,
  getStateInstance,
  GreenApiError,
  normalizeApiUrl,
  type Credentials,
} from '../api/greenApi'

interface Props {
  onLogin: (credentials: Credentials) => void
}

function Field({ label, htmlFor, children }: { label: string; htmlFor: string; children: ReactNode }) {
  return (
    <div className="login__field">
      <label htmlFor={htmlFor} className="login__label">
        {label}
      </label>
      {children}
    </div>
  )
}

export function LoginForm({ onLogin }: Props) {
  const [apiUrl, setApiUrl] = useState(DEFAULT_API_URL)
  const [idInstance, setIdInstance] = useState('')
  const [apiTokenInstance, setApiTokenInstance] = useState('')
  const [showToken, setShowToken] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const credentials = {
      apiUrl: normalizeApiUrl(apiUrl),
      idInstance: idInstance.trim(),
      apiTokenInstance: apiTokenInstance.trim(),
    }

    if (!credentials.apiUrl.startsWith('https://')) {
      setError('apiUrl должен начинаться с https://')
      return
    }

    setLoading(true)
    setError(null)
    try {
      const { stateInstance } = await getStateInstance(credentials)
      if (stateInstance !== 'authorized') {
        setError(`Инстанс не авторизован (состояние: ${stateInstance}). Авторизуйте его в консоли GREEN-API.`)
        return
      }
      onLogin(credentials)
    } catch (e) {
      setError(
        e instanceof GreenApiError
          ? `Ошибка ${e.status}: проверьте idInstance, apiTokenInstance и apiUrl`
          : 'Не удалось подключиться к GREEN-API. Проверьте apiUrl и соединение.',
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="login">
      <div className="login__glow login__glow--1" />
      <div className="login__glow login__glow--2" />

      <form className="login__card" onSubmit={handleSubmit}>
        <img className="login__logo" src={`${import.meta.env.BASE_URL}logo.png`} alt="" width={112} height={112} />

        <div className="login__heading">
          <Typography.Headline variant="medium">Вход в чат MAX</Typography.Headline>
          <Typography.Body variant="small" className="muted">
            Подключите инстанс GREEN-API, чтобы отправлять и получать сообщения
          </Typography.Body>
        </div>

        <Field label="ID инстанса" htmlFor="idInstance">
          <Input
            id="idInstance"
            placeholder="1101000001"
            inputMode="numeric"
            autoComplete="username"
            value={idInstance}
            onChange={(e) => setIdInstance(e.target.value.replace(/\D/g, ''))}
            autoFocus
            required
          />
        </Field>

        <Field label="API токен" htmlFor="apiTokenInstance">
          <Input
            id="apiTokenInstance"
            placeholder="apiTokenInstance"
            type={showToken ? 'text' : 'password'}
            autoComplete="current-password"
            value={apiTokenInstance}
            onChange={(e) => setApiTokenInstance(e.target.value)}
            required
            iconAfter={
              <button
                type="button"
                className="login__toggle"
                onClick={() => setShowToken((v) => !v)}
                aria-label={showToken ? 'Скрыть токен' : 'Показать токен'}
              >
                {showToken ? 'Скрыть' : 'Показать'}
              </button>
            }
          />
        </Field>

        <Field label="API URL" htmlFor="apiUrl">
          <Input
            id="apiUrl"
            placeholder={DEFAULT_API_URL}
            inputMode="url"
            value={apiUrl}
            onChange={(e) => setApiUrl(e.target.value)}
          />
        </Field>

        {error && (
          <div className="login__error" role="alert">
            {error}
          </div>
        )}

        <Button type="submit" size="large" stretched loading={loading} disabled={!idInstance || !apiTokenInstance}>
          Войти
        </Button>

        <Button
          type="button"
          variant="secondary"
          size="large"
          stretched
          onClick={() => onLogin({ apiUrl: DEFAULT_API_URL, idInstance: DEMO_ID_INSTANCE, apiTokenInstance: 'demo' })}
        >
          Демо без API
        </Button>

        <Typography.Body variant="small" className="muted login__hint">
          Данные инстанса есть в{' '}
          <a href="https://console.green-api.com" target="_blank" rel="noreferrer">
            личном кабинете GREEN-API
          </a>
          . Они хранятся только в этой вкладке.
        </Typography.Body>
      </form>
    </main>
  )
}
