#!/bin/bash
# Auto retest WhatsApp pairing until a real code generates
while true; do
  cd /home/ubuntu/bot
  curl -s --max-time 8 https://api.ipify.org
  echo ""
  rm -rf kingbadboitimewisher/pairing/918653517139@s.whatsapp.net
  cat > /tmp/pr.js << 'JS'
process.env.WEBHOOK_PORT = '9';
const B = require('/home/ubuntu/bot/pair.js');
(async () => {
  try { await B('918653517139@s.whatsapp.net'); console.log('FLOW_OK'); }
  catch(e) { console.log('ERR:', e.message.slice(0,60)); }
})();
setTimeout(() => process.exit(0), 70000);
JS
  node /tmp/pr.js > /tmp/pr.log 2>&1
  echo "=== run at $(date '+%F %T %Z') ===" >> /tmp/pair_retest_results.log
  grep -E "Pairing code for|saved to|Socket never|FLOW_OK|ERR" /tmp/pr.log | head -4 >> /tmp/pair_retest_results.log
  if grep -q "saved to pairing.json" /tmp/pr.log; then
    echo "SUCCESS - code generated at $(date '+%F %T %Z')" >> /tmp/pair_retest_results.log
    cat kingbadboitimewisher/pairing/pairing.json >> /tmp/pair_retest_results.log
    break
  fi
  rm -f /tmp/pr.js
  sleep 600
done
