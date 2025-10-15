#!/usr/bin/env bash
set -euo pipefail
COLLECTION=${1:-infra/postman/buy01-collection.json}
BASE_URL=${BASE_URL:-https://localhost}
ACCESS_TOKEN=${ACCESS_TOKEN:-}
MEDIA_ID=${MEDIA_ID:-}

newman run "$COLLECTION" \
  --env-var "baseUrl=$BASE_URL" \
  --env-var "accessToken=$ACCESS_TOKEN" \
  --env-var "mediaId=$MEDIA_ID" \
  --color on
