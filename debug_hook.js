/**
 * debug_hook.js — instrumented /start handler to find the silent failure.
 * Called from webhook_server.js AFTER requiring bot.js.
 */
module.exports = function installDebugHook(bot, tryMarkProcessed) {
  // Replace the registered /start callback
  const startReg = bot._textRegexpCallbacks.find(r => String(r.regexp) === '/\\/start/');
  if (!startReg) {
    console.error('❌ /start callback not found in bot._textRegexpCallbacks');
    return;
  }
  const origCb = startReg.callback;
  startReg.callback = async (msg, match) => {
    const step = (s) => console.log('🔍 /start [' + s + ']', msg.message_id);
    try {
      step('A-enter');
      if (msg.message_id && !tryMarkProcessed(msg.message_id)) { step('deduped'); return; }
      const chatId = msg.chat.id;
      const isGroup = msg.chat.type === 'group' || msg.chat.type === 'supergroup';
      step('B-chat=' + chatId + ' type=' + msg.chat.type);
      if (isGroup) { step('group branch'); return; }
      step('C-calling sendPhoto');
      const sendWithTimeout = (p, ms) =>
        new Promise((res, rej) => {
          const t = setTimeout(() => rej(new Error('sendPhoto timed out after ' + ms + 'ms')), ms);
          p.then(v => { clearTimeout(t); res(v); }, rej);
        });
      const photo = await sendWithTimeout(
        bot.sendPhoto(
          chatId,
          'https://i.postimg.cc/rw66X4zb/IMG-20260815-WA0051.jpg',
          {
            caption:
              '🪀 *𓆩֓𝐒ᴏɴᴜ x 𝐁ᴏᴛ𓆪*\n\n╔════════════════════╗\n ⤷ /pair <wa_number>\n ⤷ /unpair <wa_number>\n╚════════════════════╝',
            parse_mode: 'Markdown',
            reply_markup: {
              inline_keyboard: [[{ text: '👑 Owner', url: 'https://t.me/Sonu_x_md' }]],
            },
          }
        ),
        20000
      );
      step('D-sendPhoto OK mid=' + photo.message_id);
    } catch (err) {
      console.error('❌ /start debug caught:', err.message);
      try {
        await bot.sendMessage(msg.chat.id, '🪀 *𓆩֓𝐒ᴏɴᴜ x 𝐁ᴏᴛ𓆪*\n\nMenu:\n ⤷ /pair <wa_number>\n ⤷ /unpair <wa_number>');
        console.log('✅ fallback sendMessage sent');
      } catch (e) {
        console.error('❌ fallback also failed:', e.message);
      }
    }
  };
  console.log('✅ debug /start hook installed');
};
