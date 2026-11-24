#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
source scripts/load-env.sh

# 优先使用原生安装目录的客户端，避免 PATH 中旧版 mysql 不支持服务端认证插件。
mysql_client="${MYSQL_CLIENT:-mysql}"
if [[ -z "${MYSQL_CLIENT:-}" && -x /usr/local/mysql/bin/mysql ]]; then
  mysql_client=/usr/local/mysql/bin/mysql
fi
umask 077
mysql_config=$(mktemp)
trap 'rm -f "$mysql_config"' EXIT
escape_mysql_value() {
  local value="$1"
  value="${value//\\/\\\\}"
  value="${value//\"/\\\"}"
  printf '%s' "$value"
}
printf '[client]\npassword="%s"\n' "$(escape_mysql_value "$DB_PASSWORD")" > "$mysql_config"
# defaults-file 必须放在首位，密码只存在权限 0600 的临时文件中。
"$mysql_client" --defaults-file="$mysql_config" --protocol=TCP --host="$DB_HOST" --port="$DB_PORT" \
  --user="$DB_USERNAME" --execute="CREATE DATABASE IF NOT EXISTS factory_link CHARACTER SET utf8mb4;"
printf '%s\n' 'factory_link データベースを確認しました。'
