#!/bin/sh
# Fetches the default branch (main or develop) from origin, never master

if git ls-remote --exit-code --heads origin main > /dev/null; then
  DEFAULT_BRANCH=main
elif git ls-remote --exit-code --heads origin develop > /dev/null; then
  DEFAULT_BRANCH=develop
else
  echo "❌ No main or develop branch found on origin."
  exit 1
fi

echo "Fetching origin/$DEFAULT_BRANCH..."
git fetch origin $DEFAULT_BRANCH
