/**
 * Telegram Webhook Server — single TelegramBot instance (no duplicates)
 * bot.js creates the TelegramBot in webHook mode; its internal server
 * listens on WEBHOOK_PORT and handles POST /bot<TOKEN>.
 * No polling → no 409 Conflict ever.
 */
require('dotenv').config();
process.env.WEBHOOK_MODE = '1';

// Port first, so bot.js (webHook mode) listens here
process.env.WEBHOOK_PORT = process.env.WEBHOOK_PORT || '8443';

require('./setting/config');

// bot.js creates the TelegramBot(webHook:{port}) and registers all handlers
const { bot } = require('./bot.js');


console.log('✅ Telegram bot running in webhook mode on port', process.env.WEBHOOK_PORT);
console.log('✅ No polling → no 409 Conflict');

process.on('uncaughtException', (err) => {
  console.error('Fatal webhook error:', err.message);
  process.exit(1);
});
