#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
source scripts/load-env.sh

if ! command -v node >/dev/null; then
  for local_node in "$PWD"/work/tools/node-*/bin; do
    if [[ -x "$local_node/node" ]]; then
      export PATH="$local_node:$PATH"
      break
    fi
  done
fi
exec node scripts/smoke-test.mjs
