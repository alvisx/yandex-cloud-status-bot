# Yandex Cloud Status Telegram Bot
Bot monitors status.cloud.yandex.ru for new unresolved incidents
and sends alerts to specified Telegram chat or group.

### How to use
Create your own Telegram bot with BotFather

Clone this repository

Install dependencies
```
npm i
```
Create ```.env``` file in project directory with content like this: 
```
TELEGRAM_API_KEY=<YOUR_TELEGRAM_BOT_API_KEY>
CHAT_ID=@YandexCloudStatus
YANDEX_API_REQUEST_INTERVAL=15000
```
Run index.js
```bash
node index.js
```
or use process manager
```bash
pm2 start index.js --name yandex-cloud-status-bot
```