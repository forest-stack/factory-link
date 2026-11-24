#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
source scripts/load-env.sh
maven_cache="${MAVEN_REPO_LOCAL:-}"
maven_args=()
if [[ -n "$maven_cache" ]]; then
  maven_args+=("-Dmaven.repo.local=$maven_cache")
fi
cd backend
if [[ ${#maven_args[@]} -gt 0 ]]; then
  exec mvn "${maven_args[@]}" spring-boot:run
fi
exec mvn spring-boot:run
