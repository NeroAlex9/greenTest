# MAX Chat на GREEN-API

Тестовое задание на позицию «Фронтенд-разработчик React».

Веб-интерфейс для отправки и получения текстовых сообщений в [MAX](https://web.max.ru/) через [GREEN-API](https://green-api.com/max).

Стек: React 19, TypeScript, Vite, [MAX UI](https://github.com/max-messenger/max-ui).

## Текущий статус

Приложение проверено на реальном инстансе MAX (сервер `3100.api.green-api.com`): отправка и получение сообщений, статусы и входящие чаты работают.

Сайт: https://neroalex9.github.io/greenTest/ (демо без API: https://neroalex9.github.io/greenTest/?demo)

На бесплатном тарифе GREEN-API писать можно только на разрешённые номера (их список есть в личном кабинете). На остальные номера API возвращает ошибку 466.

## Возможности

- Вход по `idInstance`, `apiTokenInstance` и `apiUrl`. `apiUrl` подставляется сам по первым 4 цифрам `idInstance` (например, `3100…` → `https://3100.api.green-api.com`), при необходимости его можно изменить. При входе проверяется, что инстанс авторизован (`getStateInstance`).
- Новый чат по номеру телефона.
- Отправка сообщений методом [SendMessage](https://green-api.com/v3/docs/api/sending/SendMessage/).
- Получение сообщений через [HTTP API](https://green-api.com/v3/docs/api/receiving/technology-http-api/): `ReceiveNotification` и `DeleteNotification`.
- Если собеседник пишет первым, чат появляется в списке сам.
- Статусы своих сообщений как в MAX: одна галочка — отправлено или доставлено, две — прочитано, а также ошибка отправки.
- Поиск по чатам, переименование и удаление чата.
- Тёмная тема в стиле web.max.ru, адаптивная вёрстка под телефон.

Логин и токен хранятся только в `sessionStorage` (до закрытия вкладки), история чатов хранится в `localStorage`.

## Запуск

Нужен Node.js 20.19+ или 22.12+.

```bash
git clone <ссылка на репозиторий>
cd max-chat
npm install
npm run dev
```

После запуска откройте http://localhost:5173.

### Демо-режим

Есть два способа войти:

- нажать кнопку «Демо без API» на странице входа;
- добавить к адресу `?demo`, например http://localhost:5173/?demo.

В демо уже есть один чат. Отправленные сообщения получают статусы «доставлено» и «прочитано», и через пару секунд приходит автоответ. Запросы к GREEN-API в демо не отправляются.

### Сборка

```bash
npm run build
npm run preview
```

## Настройка инстанса GREEN-API

1. В [личном кабинете](https://console.green-api.com) создать инстанс MAX и авторизовать его.
2. Взять из карточки инстанса `idInstance` и `apiTokenInstance` (`apiUrl` подставится сам).
3. В настройках инстанса:
   - поле «Адрес отправки уведомлений (URL)» оставить пустым, иначе `ReceiveNotification` не работает;
   - включить уведомления о входящих сообщениях;
   - включить уведомления о сообщениях, отправленных с API, и о статусах отправленных сообщений.

## Как проверить

1. Ввести данные инстанса и войти.
2. Нажать «+», ввести номер получателя и нажать «Создать».
3. Написать сообщение и отправить его (Enter).
4. Ответить на него в MAX с телефона получателя.
5. Через несколько секунд ответ появится в чате.

## Деплой

Workflow `.github/workflows/deploy.yml` публикует сайт на GitHub Pages при push в `main`. Чтобы он заработал, в настройках репозитория выберите **Settings → Pages → Source → GitHub Actions**.

## Чем пользовался

- **Claude Code**: помощь в написании кода.
- **ChatGPT**: генерация логотипа.
- **[MAX UI](https://github.com/max-messenger/max-ui)**: официальная библиотека компонентов MAX, на ней собран интерфейс.
- **[Консоль GREEN-API](https://console.green-api.com)**: создание и настройка инстанса.
- Документация GREEN-API: [SendMessage](https://green-api.com/v3/docs/api/sending/SendMessage/), [HTTP API](https://green-api.com/v3/docs/api/receiving/technology-http-api/).

## Структура

```
src/
  api/greenApi.ts            запросы к GREEN-API
  api/demo.ts                имитация API для демо-режима
  state/chats.ts             состояние чатов
  hooks/useNotifications.ts  получение уведомлений
  components/                компоненты интерфейса
  storage.ts                 работа с sessionStorage и localStorage
```
