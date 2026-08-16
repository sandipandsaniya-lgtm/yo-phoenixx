process.env.WEBHOOK_PORT = '45082';
// instrument requestPairingCode error details
const orig = require('@whiskeysockets/baileys');
// patch to log
const m = require.resolve('@whiskeysockets/baileys/lib/Socket/socket.js');
