#!/bin/bash
  
set -e
set -x

SSH_ADDR="smqszzcrkk6c@192.169.151.162"
GIT_BRANCH=$(git rev-parse --abbrev-ref HEAD)

DOMAIN="studio.brooklynrail.org"
DEST_DIR="\${HOME}/domains/studio.brooklynrail.org"

# copy files to server
rsync -acr --stats -e "ssh -o StrictHostKeyChecking=no" \
  --exclude .git \
  . "$SSH_ADDR:$DEST_DIR"


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
