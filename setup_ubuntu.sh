#!/usr/bin/env bash
set -euo pipefail

echo "======================================"
echo "AI Capsule Setup"
echo "======================================"

# Check Node.js and npm
if ! command -v node >/dev/null 2>&1 || ! command -v npm >/dev/null 2>&1; then
  echo "Installing Node.js..."

  sudo apt-get update
  sudo apt-get install -y curl ca-certificates

  curl -fsSL https://deb.nodesource.com/setup_24.x | sudo -E bash -
  sudo apt-get install -y nodejs
fi

echo "Node: $(node --version)"
echo "npm:  $(npm --version)"

# Create backend .env if missing
if [ ! -f backend/.env ]; then
  cp backend/.env.example backend/.env
  echo "Created backend/.env from .env.example"
fi

# Install backend dependencies
echo
echo "Installing backend dependencies..."
(
  cd backend
  npm install
)

# Install frontend dependencies
echo
echo "Installing frontend dependencies..."
(
  cd frontend
  npm install
)

# Check backend syntax
echo
echo "Checking backend files..."

node --check backend/index.js
node --check backend/db.js
node --check backend/auth.js

echo "Backend syntax: OK"

# Initialise and check database
echo
echo "Checking database..."

(
  cd backend

  node -e "
    const db = require('./db');
    const columns = db.prepare('PRAGMA table_info(capsules)').all();
    if (!columns.length) { process.exit(1); }
    console.log('capsules table: OK');
  "
)

# Check frontend build
echo
echo "Checking frontend build..."

(
  cd frontend
  npm run build
)

rm -rf frontend/dist

echo "Frontend build: OK"

# Make scripts executable
chmod +x setup_ubuntu.sh run_backend.sh run_frontend.sh 2>/dev/null || true

echo
echo "======================================"
echo "Setup completed successfully"
echo "======================================"

echo
echo "Before running, check backend/.env contains:"
echo "  JWT_SECRET"
echo "  GITHUB_CLIENT_ID"
echo "  GITHUB_CLIENT_SECRET"
echo "  FRONTEND_HOST"
echo "  BACKEND_HOST"
echo
echo "Start backend:"
echo "  ./run_backend.sh"
echo
echo "Start frontend:"
echo "  ./run_frontend.sh"
echo
echo "Open:"
echo "  http://localhost:5173"