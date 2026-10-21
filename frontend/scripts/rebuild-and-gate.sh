#!/bin/sh
# The port's loop (mig-frontend-poc): stop this app's server, build, start it again on 3235, run the React fidelity gate.
# Needs the current app on 3234 (the legacy checkout, JG_LEGACY_DIR: ENGINE_LIVE=1 npx next dev -p 3234). Log: ../.superpowers/mig/gate.log
# The design files are committed (public/d, public/runtime): run scripts/sync-design.mjs first only to pick up a legacy design change.
cd "$(dirname "$0")/.." || exit 2
LOG=../.superpowers/mig/gate.log; mkdir -p ../.superpowers/mig
PID=$(netstat -ano | grep LISTENING | grep ':3235 ' | awk '{print $5}' | head -1)
[ -n "$PID" ] && taskkill //PID "$PID" //T //F > /dev/null 2>&1
{
  echo "== build $(date +%T)"
  JG_BACKEND=http://localhost:3234 npx next build > ../.superpowers/mig/frontend-build.log 2>&1 || { echo "BUILD FAILED"; tail -30 ../.superpowers/mig/frontend-build.log; echo "EXIT 1"; exit 1; }
  echo "== start $(date +%T)"
  (JG_BACKEND=http://localhost:3234 nohup npx next start -p 3235 > ../.superpowers/mig/frontend-start.log 2>&1 &)
  until curl -s -o /dev/null http://localhost:3235/signin; do sleep 1; done
  echo "== gate $(date +%T) ${FID_ONLY:-all}"
  npx tsx tests/fidelity-react.ts
  echo "EXIT $?"
} > "$LOG" 2>&1
