#!/usr/bin/env bash

# 仅加载本人在本机创建的配置。调用脚本先切换到项目根目录。
if [[ ! -f .env ]]; then
  printf '%s\n' '先に ./scripts/configure-env.sh を実行してください。' >&2
  exit 1
fi
set -a
source ./.env
set +a

export DB_HOST="${DB_HOST:-localhost}"
export DB_PORT="${DB_PORT:-3306}"
export DB_USERNAME="${DB_USERNAME:-root}"
: "${DB_PASSWORD:?.env に DB_PASSWORD を設定してください。}"
