#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."

if [[ -e .env ]]; then
  printf '%s\n' '既存の .env を使用します。設定を変える場合はローカルで編集してください。'
  exit 0
fi

# 使用静默输入，密码既不会回显，也不会进入 shell 的命令历史。
IFS= read -r -s -p 'MySQL root パスワード: ' db_password
printf '\n'
IFS= read -r -s -p 'デモ用パスワード（12文字以上、UTF-8で72バイト以下）: ' demo_password
printf '\n'
if [[ -z "$db_password" || ${#demo_password} -lt 12 ]]; then
  printf '%s\n' 'パスワードの入力内容を確認して再実行してください。' >&2
  exit 1
fi

# printf %q 写出 bash 可安全读取的值，密码里的空格及特殊字符不会被执行。
umask 077
set -o noclobber
{
  printf 'DB_HOST=localhost\nDB_PORT=3306\nDB_USERNAME=root\n'
  printf 'DB_PASSWORD=%q\n' "$db_password"
  printf 'DEMO_USERNAME=operator\nDEMO_PASSWORD=%q\n' "$demo_password"
} > .env
printf '%s\n' '.env を作成しました。'
