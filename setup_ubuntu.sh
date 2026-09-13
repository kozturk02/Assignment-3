#!/usr/bin/env bash
set -euo pipefail

echo "======================================"
echo "AI Capsule Setup"
echo "======================================"

if ! command -v node >/dev/null 2>&1 || ! command -v npm >/dev/null 2>&1; then
  echo "Installing Node.js..."
  sudo apt-get update
  sudo apt-get install -y curl
  curl -fsSL https://deb.nodesource.com/setup_24.x | sudo -E bash -
  sudo apt-get install -y nodejs
fi

echo "Node: $(node --version)"
echo "npm: $(npm --version)"

if [ ! -f backend/.env ]; then
  cp backend/.env.example backend/.env
  echo "Created backend/.env from .env.example"
fi

echo "Installing backend dependencies..."
(cd backend && npm install)

echo "Installing frontend dependencies..."
(cd frontend && npm install)

echo "Checking backend..."
node --check backend/index.js
node --check backend/auth.js

echo "Checking database..."
(
  cd backend
  node -e "
    const db = require('./db');
    const columns = db.prepare('PRAGMA table_info(capsules)').all();
    if (!columns.length) process.exit(1);
    console.log('capsules table: OK');
  "
)

echo "Checking frontend..."
(cd frontend && npm run build)
rm -rf frontend/dist

echo
echo "Setup complete."
echo
echo "Edit backend/.env and add your GitHub OAuth details."
echo
echo "GitHub OAuth:"
echo "Homepage URL: http://localhost:5173"
echo "Callback URL: http://localhost:3001/auth/github/callback"