// Test script: verify the bot token can poll updates (long poll 30s)
const TelegramBot = require('node-telegram-bot-api');
const { BOT_TOKEN } = require('./token');
const bot = new TelegramBot(BOT_TOKEN, { polling: false });

bot.getMe().then(m => console.log('Bot:', m.username, m.first_name));

// Long poll for 30 seconds - if user sends /start meanwhile, we'll see it
bot.getUpdates({ timeout: 30, offset: 0 }).then(updates => {
  console.log('Updates received:', updates.length);
  updates.forEach(u => {
    const msg = u.message || {};
    console.log('MSG:', msg.from && msg.from.id, msg.text);
  });
  process.exit(0);
}).catch(e => console.error('POLL ERROR:', e.message));

setTimeout(() => { console.log('TIMEOUT'); process.exit(1); }, 35000);
