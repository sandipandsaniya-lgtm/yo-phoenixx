// Live test: simulate Telegram POSTing /start and /pair to the webhook server
const http = require('http');
const { BOT_TOKEN } = require('./token');

const USER_CHAT = 8036220038; // user's chat id
let updateId = 1000;

function postUpdate(msg) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify({ update_id: updateId++, message: msg });
    const req = http.request({
      hostname: '127.0.0.1', port: 8444,
      path: '/bot' + BOT_TOKEN, method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(payload) }
    }, res => {
      let d = ''; res.on('data', c => d += c);
      res.on('end', () => { console.log(`[${msg.text}] status=${res.statusCode} body=${d}`); resolve(); });
    });
    req.on('error', reject);
    req.write(payload); req.end();
  });
}

(async () => {
  const now = Math.floor(Date.now() / 1000);
  await postUpdate({
    message_id: 9001, date: now,
    chat: { id: USER_CHAT, type: 'private' },
    from: { id: USER_CHAT, is_bot: false, first_name: 'Test' },
    text: '/start'
  });
  await new Promise(r => setTimeout(r, 3000));
  await postUpdate({
    message_id: 9002, date: now,
    chat: { id: USER_CHAT, type: 'private' },
    from: { id: USER_CHAT, is_bot: false, first_name: 'Test' },
    text: '/pair 917679357138'
  });
  console.log('Test done. Check Telegram for replies.');
  process.exit(0);
})();

setTimeout(() => { console.log('timeout'); process.exit(1); }, 60000);
