# MAX Chat на GREEN-API

Тестовое задание «Фронтенд-разработчик React». Это веб-интерфейс для отправки и получения текстовых сообщений в мессенджере [MAX](https://web.max.ru/) через [GREEN-API](https://green-api.com/max).

Стек: **React 19 + TypeScript + Vite**. UI собран на [MAX UI](https://github.com/max-messenger/max-ui), официальной библиотеке компонентов MAX, поэтому интерфейс похож на web.max.ru, а светлая и тёмная темы переключаются автоматически.

## Возможности

- Вход по учётным данным инстанса: `idInstance`, `apiTokenInstance` и `apiUrl` (по умолчанию `https://api.green-api.com`). Данные проверяются через `getStateInstance`, инстанс должен быть авторизован.
- Создание чата по номеру телефона получателя.
- Отправка текстовых сообщений методом [SendMessage](https://green-api.com/v3/docs/api/sending/SendMessage/).
- Получение входящих сообщений по технологии [HTTP API](https://green-api.com/v3/docs/api/receiving/technology-http-api/): long-polling `ReceiveNotification` с последующим `DeleteNotification`.
- Чаты, начатые собеседником, появляются в списке автоматически.
- Статусы исходящих сообщений: отправлено, доставлено, прочитано, ошибка.
- Адаптивная вёрстка: на мобильных экранах список чатов и переписка открываются по очереди.

Учётные данные хранятся только в `sessionStorage` текущей вкладки. История чатов сохраняется в `localStorage` браузера.

## Подготовка инстанса

1. Зарегистрируйтесь в [консоли GREEN-API](https://console.green-api.com), создайте инстанс для MAX и авторизуйте его.
2. Скопируйте из карточки инстанса `idInstance`, `apiTokenInstance` и `apiUrl`.
3. В настройках инстанса **оставьте пустым поле `webhookUrl`**: при заданном URL метод `ReceiveNotification` не работает. Включите уведомления о входящих сообщениях, а также, для статусов и сообщений с телефона, уведомления об исходящих сообщениях и их статусах.

## Локальный запуск

Нужен Node.js 20.19+ или 22.12+.

```bash
git clone <url-репозитория>
cd max-chat
npm install
npm run dev
```

Откройте адрес, который выведет Vite (обычно http://localhost:5173), и введите данные инстанса.

Production-сборка:

```bash
npm run build     # результат в dist/
npm run preview   # локальный просмотр сборки
```

## Деплой на GitHub Pages

В репозитории есть workflow `.github/workflows/deploy.yml`. Он собирает проект и публикует его на GitHub Pages при каждом push в `main`. Чтобы его включить, откройте **Settings → Pages → Build and deployment → Source** и выберите **GitHub Actions**.

## Структура

```
src/
  api/greenApi.ts           запросы к GREEN-API
  state/chats.ts            reducer чатов: отправка, входящие, статусы
  hooks/useNotifications.ts цикл receiveNotification → deleteNotification
  components/               LoginForm, Messenger, ChatList, ChatWindow
  storage.ts                sessionStorage / localStorage
```

## Сценарий проверки

1. Введите `idInstance` и `apiTokenInstance` инстанса.
2. Введите номер получателя (например, `79991234567`) и нажмите «Создать».
3. Напишите сообщение и отправьте его (Enter или кнопка «Отправить»).
4. Ответьте на сообщение в MAX с телефона получателя.
5. Ответ появится в чате через несколько секунд.
