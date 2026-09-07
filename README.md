# AI Capsule

AI Capsule is a full-stack web application built with React, Node.js/Express and SQLite.

Users log in through GitHub OAuth and can save, view, edit and delete their own AI prompt records.

## Setup

Run the setup script from the project root:

chmod +x setup_ubuntu.sh run_backend.sh run_frontend.sh
./setup_ubuntu.sh

This checks Node.js, installs backend and frontend dependencies, validates the SQLite database schema and checks that the frontend builds successfully.

## Run

Terminal 1:

./run_backend.sh

Backend:
http://localhost:3001

Terminal 2:

./run_frontend.sh

Frontend:
http://localhost:5173

## Database

SQLite stores AI Capsule prompt records.

The capsules table is created automatically when the backend starts.

Each record contains:

- user_id
- project_name
- prompt_title
- prompt_version
- prompt_text
- response_summary
- category
- usefulness
- reviewed
- improved
- screenshot_url
- notes
- created_at

The user_id is taken from the verified JWT and is not supplied by the frontend.

## API routes

Public:

- GET /api/health
- GET /login
- GET /auth/github/callback

Protected:

- GET /api/capsules
- POST /api/capsules
- PUT /api/capsules/:id
- DELETE /api/capsules/:id

All capsule routes require a valid JWT.

## Authentication

GitHub OAuth is used for login.

After a successful GitHub login, the Express backend creates its own JWT.

The JWT is stored in a Secure, HttpOnly cookie named:

token

Protected API requests verify this JWT before allowing access.

Users can only access records belonging to their own authenticated user_id.

## Environment variables

The backend uses:

- PORT
- FRONTEND_URL
- JWT_SECRET
- GITHUB_CLIENT_ID
- GITHUB_CLIENT_SECRET

Secret values must not be committed to GitHub.