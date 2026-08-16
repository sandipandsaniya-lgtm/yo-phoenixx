// Verify the bot can ACTUALLY send a message to the user's chat right now
const { BOT_TOKEN } = require('./token');
const https = require('https');

function api(method, params) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(params);
    const req = https.request({
      hostname: 'api.telegram.org',
      hostname: 'api.telegram.org',
      path: `/bot${BOT_TOKEN}/${method}`,
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) }
    }, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => {
        const j = JSON.parse(d);
        if (j.ok) { console.log(method, 'OK →', j.result && j.result.message_id); resolve(j); }
        else { console.log(method, 'FAIL:', j.description); reject(new Error(j.description)); }
      });
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

(async () => {
  const chat = 8036220038;
  try {
    const m = await api('sendMessage', { chat_id: chat, text: '✅ Test reply — bot is working! (This is a diagnostic test)' });
    console.log('SENT OK, message_id:', m.result.message_id);
  } catch (e) {
    console.log('SEND FAILED:', e.message);
  }
  process.exit(0);
})();
