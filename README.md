# QR-Bot

## Содержание

- [Описание проекта](#описание)
- [Установка](#установка)
- [Использование](#использование)
- [Контакты](#контакты)


## Описание

В проекте реализованы механизы сцен, миддлвееров, сессий и других удобных методов для работы с API Telegram.

Пример созданного бота работает с API goqr.me для создания и чтения QR-кодов. Код был написан с использованиес TypeScript.

Бот работает: https://t.me/SM_QR_bot


## Установка

### клонируйте репозиторий:
```bash
git clone https://github.com/SergeySoftDrop/QR-Bot.git
```

### перейдите в папку проекта:
```bash
cd ваш-проект
```

### установите зависимости:
```bash
npm install
```

### создайте файл .env, следуя файлу .env.example и пропишите необходимые параметры:
```env
BOT_TOKEN = "YOUR_TOKEN"

MONGO_URI = "mongodb://localhost:27017/YOUR_DB"

WEBHOOK_URL = YOUR_URL //Заполняйте, если хотите использовать webhook вместо long polling

BOT_PORT = YOUR_PORT //Заполняйте, если хотите использовать webhook вместо long polling

```
_WEBHOOK_URL и BOT_PORT заполняйте, если хотите использовать webhook вместо long polling_


## Использование

### Для запуска проекта и испоьзованием nodemon без предворительного билда:

```bash
npm run dev
```

### Для билда проекта:

```bash
npm run build
```

> [!WARNING]
> Папка [build](build) будет _удалена_ вместе со всеми файлами внутри неё. Создастся новая с билдом

### Для запуска проекта из папки build, без использования nodemon:

```bash
npm run start
```


## Контакты

По всем вопросам:
- [Телеграм](https://t.me/deadbloand): @deadbloand
- [Телеграм](https://t.me/mxmndrsn): @mxmndrsn
