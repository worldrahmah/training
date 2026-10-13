#!/usr/bin/env bash
set -e
cd "$(dirname "$0")"
node tools/cache-google-fonts.mjs --optional || true
node --no-warnings app/server.mjs
