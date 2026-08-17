#!/bin/bash
# Auto-restart tunnel watchdog for Telegram webhook
TOKEN="8810097363:AAGadUZakL_CG0eUbsHKWLIOCSSy0nV2sV4"
CHAT=8036220038
WEBHOOK_PREFIX="/bot$TOKEN"
LOG=/tmp/tunnel_watchdog.log
URL_FILE=/tmp/current_tunnel_url.txt

set_webhook() {
  local url="$1"
  echo "$(date) setWebhook $url" >> $LOG
  curl -s "https://api.telegram.org/bot$TOKEN/setWebhook" -d "url=${url}${WEBHOOK_PREFIX}" >> $LOG 2>&1
  echo >> $LOG
}

# ---------- second tunnel: Xsonu_md_bot (port 8444 via localhost.run) ----------
XSONU_TOKEN="8738695990:AAGy6R2QYHe6Ugmjykn_LqWTNXooPL2IHks"
XSONU_WEBHOOK_PREFIX="/bot$XSONU_TOKEN"
XSONU_LOG=/tmp/serveo3.log
ensure_xsonu_tunnel() {
  if [ -z "$(pgrep -f 'nokey@localhost.run')" ]; then
    setsid ssh -o StrictHostKeyChecking=no -o ServerAliveInterval=30 -o ServerAliveCountMax=3 -R 80:localhost:8444 nokey@localhost.run > $XSONU_LOG 2>&1 < /dev/null &
    sleep 12
  fi
  local new
  new=$(grep -o "https://[a-z0-9-]*\.localhost\.run" $XSONU_LOG 2>/dev/null | tail -1)
  if [ -n "$new" ]; then
    curl -s --max-time 15 "https://api.telegram.org/bot$XSONU_TOKEN/setWebhook" -d "url=${new}${XSONU_WEBHOOK_PREFIX}" > /dev/null 2>&1
    echo "$(date) xsonu webhook: $new" >> $LOG
  fi
}
ensure_xsonu_tunnel

while true; do
  # find any active serveo ssh tunnel
  TUN_PID=$(pgrep -f "nokey@serveo.net\|ssh.*serveo.net" | head -1)
  if [ -z "$TUN_PID" ]; then
    # start new tunnel in background
    setsid ssh -o StrictHostKeyChecking=no -o ServerAliveInterval=30 -o ServerAliveCountMax=3 -R 80:localhost:8443 serveo.net > /tmp/serveo.log 2>&1 < /dev/null &
    sleep 12
    NEW=$(grep -o "https://[a-z0-9-]*\.serveousercontent\.com" /tmp/serveo.log | tail -1)
    if [ -n "$NEW" ]; then
      # verify tunnel works externally
      CODE=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "$NEW$WEBHOOK_PREFIX")
      if [ "$CODE" = "418" ]; then
        echo "$NEW" > $URL_FILE
        set_webhook "$NEW"
        echo "$(date) TUNNEL UP: $NEW" >> $LOG
      else
        echo "$(date) tunnel $NEW not responding (code $CODE), retry cycle" >> $LOG
        pkill -f "ssh.*serveo.net" 2>/dev/null
        sleep 5
      fi
    fi
  else
    # verify current tunnel URL
    CUR=$(cat $URL_FILE 2>/dev/null)
    if [ -n "$CUR" ]; then
      CODE=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "$CUR$WEBHOOK_PREFIX")
      if [ "$CODE" != "418" ]; then
        echo "$(date) current tunnel $CUR failed (code $CODE), killing" >> $LOG
        pkill -f "ssh.*serveo.net" 2>/dev/null
        echo "" > $URL_FILE
      fi
    else
      echo "" > $URL_FILE
    fi
  fi
  sleep 30
done
