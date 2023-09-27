#!/bin/bash

set -e
set -x


DEST_DIR='${HOME}/domains/studio.brooklynrail.org'

rsync -acr --stats -e 'ssh -o StrictHostKeyChecking=no -o HostKeyAlgorithms=ssh-rsa' --exclude .git . 'smqszzcrkk6c@192.169.151.162:${HOME}/domains/studio.brooklynrail.org'

DOMAIN="studio.brooklynrail.org"

echo "Deployed to ${DOMAIN}"

BODY=$(printf '{
  "state": "success",
  "target_url": "https://%s",
  "description": "Studio deployed",
  "context": "Deployment"
}' "$DOMAIN")

# don't print the token
set +x
curl -u "afeld:${GITHUB_TOKEN}" --fail --data "${BODY}" "https://api.github.com/repos/brooklynrail/studio/statuses/$(git rev-parse HEAD)"
set -x
