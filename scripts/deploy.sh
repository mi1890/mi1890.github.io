#!/usr/bin/env bash
set -euo pipefail

# Ubuntu deploy script
# Usage: ./scripts/deploy.sh /path/to/target
# If no target provided, defaults to ./deploy_target

TARGET_PATH=${1:-"$(pwd)/deploy_target"}

echo "Deploy target: $TARGET_PATH"

function die() {
  echo "ERROR: $*" >&2
  exit 1
}

if [ ! -f package.json ]; then
  die "package.json not found. Run this script from the project root."
fi

echo "Installing dependencies (npm ci)..."
npm ci --silent || die "npm ci failed"

echo "Building project (npm run build)..."
npm run build || die "npm run build failed"

if [ ! -d dist ]; then
  die "Build output folder 'dist' not found"
fi

echo "Creating target directory: $TARGET_PATH"
mkdir -p "$TARGET_PATH" || die "Failed to create target dir"

echo "Syncing 'dist' -> '$TARGET_PATH'"
# Use rsync if available for a safe sync; fall back to cp -r
if command -v rsync >/dev/null 2>&1; then
  rsync -a --delete --checksum dist/ "$TARGET_PATH/" || die "rsync failed"
else
  # Remove existing files then copy
  rm -rf "$TARGET_PATH"/* || true
  cp -r dist/. "$TARGET_PATH/" || die "cp failed"
fi

echo "Deployment to $TARGET_PATH completed successfully."
echo "You can now point your webserver to $TARGET_PATH"

exit 0
