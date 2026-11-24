#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."

# 工作区留有一份本次验证用的 Node；公开仓库使用本机安装的 Node.js。
if ! command -v npm >/dev/null; then
  for local_node in "$PWD"/work/tools/node-*/bin; do
    if [[ -x "$local_node/npm" ]]; then
      export PATH="$local_node:$PATH"
      break
    fi
  done
fi
command -v npm >/dev/null || { printf '%s\n' 'Node.js 24 と npm をインストールしてください。' >&2; exit 1; }
cd frontend
if [[ ! -d node_modules ]]; then
  npm ci
fi
exec npm run dev
