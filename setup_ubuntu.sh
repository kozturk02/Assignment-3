#!/usr/bin/env bash
set -Eeuo pipefail

if [[ ${EUID} -eq 0 ]]; then
  echo "ERROR: Do not run this script with sudo."
  echo "Run: ./setup_ubuntu.sh"
  exit 1
fi

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

MIN_NODE_MAJOR=20

node_major() {
  node -p 'Number(process.versions.node.split(".")[0])' 2>/dev/null || echo 0
}

check_files() {
  local missing=0

  local required=(
    "backend/index.js"
    "backend/db.js"
    "backend/auth.js"
    "backend/package.json"
    "frontend/package.json"
    "frontend/index.html"
    "frontend/src/main.jsx"
    "frontend/src/App.jsx"
    "frontend/src/services/api.js"
    "frontend/src/components/LoginCard.jsx"
    "frontend/src/components/CapsuleForm.jsx"
    "frontend/src/components/ViewCard.jsx"
    "frontend/src/pages/HomePage.jsx"
    "frontend/src/pages/LoginPage.jsx"
    "frontend/src/pages/DashboardPage.jsx"
  )

  for file in "${required[@]}"; do
    if [[ ! -f "$file" ]]; then
      echo "Missing: $file"
      missing=1
    fi
  done

  [[ $missing -eq 0 ]] || exit 1
}

check_node() {
  if ! command -v node >/dev/null 2>&1 || \
     ! command -v npm >/dev/null 2>&1 || \
     [[ $(node_major) -lt $MIN_NODE_MAJOR ]]; then

    echo "Installing Node.js through nvm..."

    export NVM_DIR="$HOME/.nvm"

    if [[ ! -d "$NVM_DIR" ]]; then
      curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
    fi

    source "$NVM_DIR/nvm.sh"

    nvm install --lts
    nvm use --lts
  fi

  echo "Node: $(node --version)"
  echo "npm:  $(npm --version)"
}

echo "======================================"
echo "AI Capsule Setup"
echo "======================================"

check_files
check_node

echo
echo "Installing backend dependencies..."
(cd backend && npm install)

echo
echo "Installing frontend dependencies..."
(cd frontend && npm install)

echo
echo "Checking backend syntax..."
node --check backend/index.js
node --check backend/auth.js

echo
echo "Checking database..."

(
  cd backend

  node - <<'NODE'
const db = require('./db');

const columns = db
  .prepare('PRAGMA table_info(capsules)')
  .all()
  .map(column => column.name);

const required = [
  'id',
  'user_id',
  'project_name',
  'prompt_title',
  'prompt_version',
  'prompt_text',
  'response_summary',
  'category',
  'usefulness',
  'reviewed',
  'improved',
  'screenshot_url',
  'notes',
  'created_at',
];

const missing = required.filter(column => !columns.includes(column));

if (missing.length > 0) {
  console.error('Missing database columns:', missing.join(', '));
  process.exit(1);
}

console.log('capsules table: OK');
NODE
)

echo
echo "Checking frontend build..."
(cd frontend && npm run build)

rm -rf frontend/dist

chmod +x setup_ubuntu.sh run_backend.sh run_frontend.sh 2>/dev/null || true

echo
echo "======================================"
echo "Setup completed successfully"
echo "======================================"
echo
echo "Terminal 1:"
echo "  ./run_backend.sh"
echo
echo "Terminal 2:"
echo "  ./run_frontend.sh"