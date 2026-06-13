#!/bin/sh
set -e

echo "==> Building OpenNext..."
npx opennextjs-cloudflare build

echo "==> Deploying to Cloudflare..."
npx opennextjs-cloudflare deploy
