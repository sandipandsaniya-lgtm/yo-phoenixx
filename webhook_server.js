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

// Trace: verify live deliveries
bot.on('message', (m) => console.log('📥 TRACE:', JSON.stringify(m.text), 'msgId:', m.message_id, 'date:', m.date));


console.log('✅ Telegram bot running in webhook mode on port', process.env.WEBHOOK_PORT);
console.log('✅ No polling → no 409 Conflict');

// ============ SECOND BOT SUPPORT ============
// Xsonu_md_bot (8738695990) uses the SAME handlers as Sonu_x_md_bot.
// node-telegram-bot-api binds ONE path (/bot<LOCAL_TOKEN>) on port 8443,
// so we run a tiny proxy on 8444 that rewrites /bot8738695990:<token>
// updates into /bot8810097363:<token> and feeds them to the local handler.
const http = require('http');
const LOCAL_TOKEN = '8810097363:AAGadUZakL_CG0eUbsHKWLIOCSSy0nV2sV4';
const XSONU_TOKEN = '8738695990:AAGy6R2QYHe6Ugmjykn_LqWTNXooPL2IHks';
const XSONU_PORT = parseInt(process.env.WEBHOOK_PORT || '8443', 10) + 1;
const xsonuServer = http.createServer((req, res) => {
  const url = req.url || '';
  if (url.startsWith('/bot' + XSONU_TOKEN)) {
    let body = '';
    req.on('data', c => { body += c; });
    req.on('end', () => {
      const fwd = http.request(
        { hostname: '127.0.0.1', port: parseInt(process.env.WEBHOOK_PORT || '8443', 10),
          path: '/bot' + LOCAL_TOKEN, method: req.method,
          headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) } },
        (r) => { let rb = ''; r.on('data', c => rb += c); r.on('end', () => { res.writeHead(r.statusCode, { 'Content-Type': 'application/json' }); res.end(rb); }); }
      );
      fwd.on('error', () => { res.writeHead(502); res.end(); });
      fwd.write(body); fwd.end();
    });
  } else {
    res.writeHead(404); res.end();
  }
});
xsonuServer.listen(XSONU_PORT, '127.0.0.1', () => {
  console.log('✅ Xsonu forwarder on port', XSONU_PORT);
});

process.on('uncaughtException', (err) => {
  // Non-fatal: log socket/network errors (e.g. EBADF from WhatsApp sockets in restricted environments)
  // so the Telegram webhook server stays alive 24/7.
  console.error('⚠️ Background error (non-fatal):', err.code || '', err.message);
});
process.on('unhandledRejection', (reason) => {
  console.error('⚠️ Unhandled rejection (non-fatal):', reason && (reason.message || reason));
});
