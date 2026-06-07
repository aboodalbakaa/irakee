#!/bin/bash
# Iraqee Watchdog — runs every 15 min via cron
# Checks site health, error logs, and auto-restarts if down

set -e

PROJECT_DIR="/root/irakee"
PORT=3000
HEALTH_URL="http://localhost:$PORT/en"
API_URL="http://localhost:$PORT/api/events"
ERROR_LOG="$PROJECT_DIR/.server-errors.log"
HACK_LOG="$PROJECT_DIR/.hack-attempts.log"
PID_FILE="/tmp/irakee-server.pid"

# Timestamp
now() { date "+%Y-%m-%d %H:%M:%S"; }

# Log message
log() { echo "$(now) | $1"; }

# Send Telegram alert
alert() {
  local msg="$1"
  # Use Hermes send_message if available, otherwise curl to Telegram API
  # We'll write to a file that a cron job picks up
  echo "$(now) | ALERT: $msg" >> "$PROJECT_DIR/.watchdog-alerts.log"
}

# ── Step 1: Check server is running ──
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" --connect-timeout 5 --max-time 10 "$HEALTH_URL" 2>/dev/null || echo "000")

if [ "$HTTP_CODE" = "000" ]; then
  log "SERVER DOWN — restarting"
  alert "⚠️ Iraqee server DOWN on port $PORT. Attempting restart..."

  # Kill any stale node processes
  pkill -f "next start -p $PORT" 2>/dev/null || true
  sleep 2

  # Start server
  cd "$PROJECT_DIR"
  nohup npx next start -p $PORT >> "$PROJECT_DIR/.server-output.log" 2>&1 &
  echo $! > "$PID_FILE"

  sleep 5

  # Verify restart
  HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" --connect-timeout 5 --max-time 10 "$HEALTH_URL" 2>/dev/null || echo "000")
  if [ "$HTTP_CODE" != "000" ]; then
    alert "✅ Iraqee server restarted successfully (HTTP $HTTP_CODE)"
  else
    alert "❌ Iraqee server FAILED to restart after crash"
  fi

elif [ "$HTTP_CODE" != "200" ]; then
  log "WARNING — HTTP $HTTP_CODE from $HEALTH_URL"
  alert "⚠️ Iraqee returning HTTP $HTTP_CODE — needs investigation"
fi

# ── Step 2: Check API endpoints ──
API_CODE=$(curl -s -o /dev/null -w "%{http_code}" --connect-timeout 5 --max-time 10 "$API_URL" 2>/dev/null || echo "000")
if [ "$API_CODE" = "000" ] || [ "$API_CODE" = "500" ]; then
  log "API ERROR — HTTP $API_CODE"
  alert "⚠️ Iraqee API returning $API_CODE — check /api/events"
fi

# ── Step 3: Check error log for new errors ──
if [ -f "$ERROR_LOG" ]; then
  # Count errors in last 15 min
  RECENT_ERRORS=$(grep -c "ERROR\|error\|Error\|Traceback\|Unhandled" "$ERROR_LOG" 2>/dev/null || echo "0")
  if [ "$RECENT_ERRORS" -gt 0 ]; then
    LAST_ERROR=$(tail -5 "$ERROR_LOG")
    log "$RECENT_ERRORS recent errors in log"
    alert "⚠️ $RECENT_ERRORS recent errors detected on Iraqee\nLast: $LAST_ERROR"
  fi
fi

# ── Step 4: Check for hack attempts ──
if [ -f "$HACK_LOG" ]; then
  RECENT_HACKS=$(wc -l < "$HACK_LOG" 2>/dev/null || echo "0")
  if [ "$RECENT_HACKS" -gt 0 ]; then
    alert "⚠️ $RECENT_HACKS suspicious requests detected"
  fi
fi

# ── Step 5: Memory check ──
MEM_USAGE=$(ps -o %mem,pid,comm -p $(cat "$PID_FILE" 2>/dev/null) 2>/dev/null | tail -1 | awk '{print $1}' || echo "0")
if [ -n "$MEM_USAGE" ] && [ "$(echo "$MEM_USAGE > 80" | bc 2>/dev/null || echo "0")" = "1" ]; then
  log "HIGH MEMORY: ${MEM_USAGE}%"
  alert "⚠️ Iraqee server memory at ${MEM_USAGE}% — consider restart"
fi

log "Watchdog check complete (HTTP $HTTP_CODE, API $API_CODE)"