# AI Capsule

AI Capsule is a full-stack web application for saving and managing useful AI prompts.

The application uses a React frontend, Node.js/Express backend and SQLite database. Users authenticate through GitHub OAuth and can create, view, update and delete their own prompt records.

## Deployed Application

**Public URL:**  
https://api-capsule-kayahan.onrender.com/

**Cloud platform:**  
Render Web Service

The React production build and Express backend are served from the same public application and URL.

---

## Technology

- React
- Vite
- Node.js
- Express
- SQLite
- GitHub OAuth
- JSON Web Tokens (JWT)
- Render

---

## Installation

Clone or extract the project and open a terminal in the project root.

Use Node.js 24 and npm.

Install the backend dependencies:

```bash
npm --prefix backend install
```

Install the frontend dependencies:

```bash
npm --prefix frontend install
```

Create `backend/.env` using `backend/.env.example` as a template.

Replace the example JWT secret and GitHub OAuth credentials with your own values.

The `.env` file is for local configuration and must not be committed to the repository. Real JWT and GitHub OAuth secrets must not appear in the README or submitted source code.

---

## Local Development

Start the backend:

```bash
npm --prefix backend run dev
```

The backend runs on port `3001` by default:

```text
http://localhost:3001
```

Start the frontend in another terminal:

```bash
npm --prefix frontend run dev
```

The frontend runs on port `5173` by default:

```text
http://localhost:5173
```

For local development, configure the GitHub OAuth application with:

```text
Homepage URL:
http://localhost:5173

Authorization callback URL:
http://localhost:3001/auth/github/callback
```

---

## Project Structure

The project is separated into a React frontend and Express backend.

```text
frontend/
├── src/
│   ├── App.jsx
│   ├── api.js
│   ├── App.css
│   ├── pages/
│   └── components/
├── package.json
└── vite.config.js

backend/
├── index.js
├── auth.js
├── config.js
├── db.js
├── package.json
├── .env.example
└── .env                 # Local configuration; excluded from Git
```

The React frontend provides the user interface.

`frontend/src/api.js` communicates with Express using `fetch` and:

```js
credentials: 'include'
```

This allows the browser to send the authentication cookie with protected API requests.

During local development, the frontend communicates with the backend development host and port.

In production, React uses relative API paths because the React production build and Express API are served from the same public URL.

---

## Application Pages

### `/`

Public landing page explaining AI Capsule and providing GitHub login.

### `/dashboard`

React dashboard containing the authenticated user's prompt records.

The frontend checks the current authenticated session before allowing the dashboard to be displayed.

The protected data remains secured by JWT authentication on the Express API.

---

## API Routes

### Public

```text
GET  /api/health
GET  /login
GET  /auth/github/callback
POST /logout
```

The health endpoint returns:

```json
{"status":"ok"}
```

### Authentication

```text
GET /api/auth/me
```

This verifies the current application JWT and returns the authenticated user information when the session is valid.

### Protected Capsule API

```text
GET    /api/capsules
POST   /api/capsules
PUT    /api/capsules/:id
DELETE /api/capsules/:id
```

All capsule API routes use JWT authentication middleware.

A request without a valid application JWT returns:

```text
401 Unauthorized
```

---

## CRUD Behaviour

### Create

New records are created through:

```text
POST /api/capsules
```

The authenticated user's ID is taken from the verified JWT.

The frontend does not provide `user_id`.

### Read

Records are loaded through:

```text
GET /api/capsules
```

The SQL query only returns records belonging to the authenticated `user_id`.

### Update

Existing records are updated through:

```text
PUT /api/capsules/:id
```

The backend checks both the capsule ID and authenticated `user_id` before updating the record.

### Delete

Records are deleted through:

```text
DELETE /api/capsules/:id
```

The delete query also checks both the capsule ID and authenticated `user_id`.

This prevents an authenticated user from updating or deleting a record belonging to another user.

---

## Prompt Data

Each capsule can store:

- `id`
- `user_id`
- `project_name`
- `prompt_title`
- `prompt_version`
- `prompt_text`
- `response_summary`
- `category`
- `usefulness`
- `reviewed`
- `improved`
- `screenshot_url`
- `notes`
- `created_at`

Screenshot evidence is stored as URLs rather than uploading image files to the server.

---

## Database

SQLite is used to store the capsule records.

The database and `capsules` table are automatically initialised when the backend starts.

When started using the documented commands, the database file is:

```text
backend/capsules.db
```

The `user_id` is obtained from the verified application JWT and is not supplied by the browser.

The `created_at` timestamp is generated automatically by SQLite.

### Cloud Storage

The deployed Render application uses SQLite on the service's local filesystem.

This filesystem is ephemeral. Saved records are lost when the service restarts or redeploys.

On Render's Free plan, records are also lost when the service spins down after inactivity. Free services normally spin down after 15 minutes without incoming traffic.

The database and table are recreated when the backend starts, but previously saved records are not restored.

This is a known limitation of the submitted application.

---

## GitHub OAuth and JWT Authentication

GitHub OAuth is used to authenticate users.

The authentication process is:

1. The user selects GitHub login.
2. Express generates a random OAuth `state` value.
3. The browser is redirected to GitHub.
4. GitHub redirects the browser back to `/auth/github/callback`.
5. Express verifies the returned OAuth `state`.
6. Express exchanges the GitHub authorization code for a GitHub access token.
7. Express requests the authenticated GitHub user's information.
8. Express creates its own application JWT.
9. The JWT is stored in a cookie named `token`.
10. Protected API requests verify that JWT before allowing access.

The application JWT is separate from the GitHub OAuth access token.

The JWT contains the authenticated GitHub user ID and basic user information required by the application.

The JWT expires after two hours.

In production, the `token` cookie is configured as:

```text
HttpOnly
Secure
SameSite=Lax
```

Because the deployed React frontend and Express backend are served from the same site, a cross-site authentication cookie is not required.

The JWT is verified on the Express server using `jsonwebtoken.verify`.

The application does not store the JWT in `localStorage` and does not send it as a browser-supplied Bearer token.

---

## User Ownership

Each capsule belongs to the authenticated GitHub user.

Ownership is determined using:

```text
req.user.userId
```

This comes from the verified application JWT.

CREATE stores this authenticated user ID as the owner.

READ filters records by the authenticated user ID.

UPDATE and DELETE both require:

```text
capsule id
authenticated user_id
```

The frontend never supplies the owner `user_id`.

This ownership behaviour was checked by reviewing the CREATE, READ, UPDATE and DELETE queries and confirming that each operation derives the user identity from the verified JWT rather than request data.

---

## Environment Variables

The backend supports the following environment variables:

```text
NODE_ENV
FRONTEND_HOST
BACKEND_HOST
FRONTEND_PORT
BACKEND_PORT
PORT
FRONTEND_DIST
JWT_SECRET
GITHUB_CLIENT_ID
GITHUB_CLIENT_SECRET
```

`FRONTEND_HOST` and `BACKEND_HOST` contain only the hostname and do not include a protocol or URL path.

Local example, containing placeholders rather than real secrets:

```env
NODE_ENV=development

FRONTEND_HOST=localhost
FRONTEND_PORT=5173

BACKEND_HOST=localhost
BACKEND_PORT=3001

JWT_SECRET=replace-with-a-long-random-secret

GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret

FRONTEND_DIST=../frontend/dist
```

The application constructs the frontend URL, backend URL and GitHub callback URL internally from these values.

The backend uses the cloud-provided `PORT` value when available.

If `PORT` is not provided, `BACKEND_PORT` is used.

The default backend port is `3001`.

`FRONTEND_DIST` defaults to:

```text
../frontend/dist
```

For optional frontend development configuration, these variables can be provided in the frontend environment:

```text
VITE_BACKEND_HOST
VITE_BACKEND_PORT
```

Secret values such as `JWT_SECRET` and `GITHUB_CLIENT_SECRET` are configured through backend environment variables and must not be committed to GitHub or included in frontend code.

Render also supports `NODE_VERSION` for selecting the Node.js runtime version.

---

## Cloud Deployment

The application is deployed using Render as a Node.js Web Service.

The React application is built into:

```text
frontend/dist
```

Express serves this production build together with the API.

Render's Root Directory setting is left blank so that both the `frontend` and `backend` folders are available.

### Build Command

From the repository root:

```bash
npm --prefix backend install && npm --prefix frontend install --include=dev && npm --prefix frontend run build
```

### Start Command

```bash
cd backend && npm start
```

### Production Environment

The deployed application uses:

```env
NODE_ENV=production

FRONTEND_HOST=api-capsule-kayahan.onrender.com
BACKEND_HOST=api-capsule-kayahan.onrender.com

FRONTEND_DIST=../frontend/dist
```

The following credentials are configured through Render's environment settings:

```text
JWT_SECRET
GITHUB_CLIENT_ID
GITHUB_CLIENT_SECRET
```

Render provides the backend `PORT` automatically.

### GitHub OAuth Deployment Configuration

The GitHub OAuth application uses:

```text
Homepage URL:
https://api-capsule-kayahan.onrender.com

Authorization callback URL:
https://api-capsule-kayahan.onrender.com/auth/github/callback
```

---

## Required cURL Checks

The following deployed responses were independently checked during the review on 20 September 2026.

### Health Check

Command:

```bash
curl -i https://api-capsule-kayahan.onrender.com/api/health
```

Windows PowerShell:

```powershell
curl.exe -i https://api-capsule-kayahan.onrender.com/api/health
```

Observed status and response body:

```text
HTTP/1.1 200 OK
{"status":"ok"}
```

### Test 1 — No Authentication

Command:

```bash
curl -i https://api-capsule-kayahan.onrender.com/api/capsules
```

Windows PowerShell:

```powershell
curl.exe -i https://api-capsule-kayahan.onrender.com/api/capsules
```

Observed status and response body:

```text
HTTP/1.1 401 Unauthorized
{"error":"Unauthorized"}
```

### Test 2 — Invalid JWT

Command:

```bash
curl -i -H "Cookie: token=fake-token-123" https://api-capsule-kayahan.onrender.com/api/capsules
```

Windows PowerShell:

```powershell
curl.exe -i -H "Cookie: token=fake-token-123" https://api-capsule-kayahan.onrender.com/api/capsules
```

Observed status and response body:

```text
HTTP/1.1 401 Unauthorized
{"error":"Unauthorized"}
```

These tests demonstrate that the deployed endpoint rejects both a missing JWT and the supplied invalid JWT.

Code inspection also confirms that all four CRUD routes use the server-side JWT verification middleware.

No real application JWT is included in these commands or results.

---

## Verification

### OAuth Login

GitHub OAuth was tested by authenticating through GitHub and returning to the application.

After login, the application calls:

```text
GET /api/auth/me
```

This verifies the authenticated session and retrieves the user information stored in the application JWT.

### JWT Protection

JWT protection was checked using the two required deployed cURL tests.

A request with no authentication returned:

```text
401 Unauthorized
```

A request with:

```text
token=fake-token-123
```

also returned:

```text
401 Unauthorized
```

The backend implementation was reviewed to confirm that Express calls `jsonwebtoken.verify` before protected route handlers run.

### CRUD

The deployed CRUD verification procedure is:

1. Sign in through GitHub.
2. Create a prompt record through the React interface.
3. Refresh the dashboard and confirm that the record is loaded from SQLite.
4. Edit the record.
5. Refresh again and confirm that the updated values remain.
6. Delete the record.
7. Refresh again and confirm that the record remains absent.

Actual test result and date:

Test date: 20 September 2026

CRUD testing was completed successfully on the deployed Render application:

- CREATE: A new prompt record was saved and appeared on the dashboard.
- READ: The saved record and its details were displayed correctly.
- UPDATE: Changes to the record were saved and displayed correctly.
- DELETE: The record was removed and no longer appeared on the dashboard.

All four CRUD operations worked successfully through the React interface
and protected Express API after GitHub login.

The corresponding API operations are:

```text
CREATE -> POST /api/capsules
READ   -> GET /api/capsules
UPDATE -> PUT /api/capsules/:id
DELETE -> DELETE /api/capsules/:id
```

### Ownership

User ownership was verified through code inspection by checking that:

- `user_id` is never accepted as the record owner from the frontend.
- CREATE gets the owner from the verified JWT.
- READ filters records using the authenticated user ID.
- UPDATE checks both the capsule ID and authenticated user ID.
- DELETE checks both the capsule ID and authenticated user ID.

This describes implementation review rather than claiming that a deployed two-account test was performed.

---

## AI-Assisted Development

ChatGPT was used during development and review to inspect the assignment requirements, inspect code, identify problems, explain full-stack concepts and suggest improvements to the React, Express, OAuth/JWT and deployment configuration.

Suggested changes were checked against the assignment requirements and the behaviour of the application.

### Problems Identified and Corrected

One problem found during review was that the frontend originally used a hard-coded backend address:

```text
http://localhost:3001
```

This would work locally but would fail when the application was deployed to a public cloud host.

The configuration was changed so that development host and port values are configurable, while the production frontend uses relative API paths because React and Express are served from the same public URL.

Another issue identified during review was that the original GitHub OAuth flow did not use an OAuth `state` value.

A random `state` value is now generated before redirecting to GitHub and validated when GitHub returns to the callback endpoint.

GitHub API responses were also updated to be checked before their data is trusted. The application verifies the access-token response and GitHub user response before creating an application JWT.

The original screenshot implementation allowed uploaded image files to be converted to base64 data and placed inside JSON requests. This was unnecessary for the assignment and could exceed the Express JSON body limit. Screenshot evidence was simplified to URL-only storage.

Error handling was also improved so that failed create, load, update or delete operations can display an error to the user rather than only writing the error to the browser console.

During deployment review, the API response initially showed:

```text
access-control-allow-origin: https://localhost
```

The Render host configuration was corrected. A later public API check confirmed:

```text
access-control-allow-origin: https://api-capsule-kayahan.onrender.com
```

### OAuth and JWT Verification

The OAuth/JWT implementation was reviewed to confirm that:

- GitHub OAuth identifies the user.
- Express creates its own application JWT.
- The GitHub access token is not used as the application session token.
- The JWT is stored in an HttpOnly `token` cookie.
- Production uses a Secure cookie.
- Protected routes verify the JWT server-side.
- Missing and invalid JWTs return `401 Unauthorized`.

The deployed no-token and fake-token cURL tests were also used to verify the protected API behaviour.

### CRUD and Ownership Verification

The CRUD routes were reviewed to confirm that CREATE, READ, UPDATE and DELETE all use the authenticated identity from the verified JWT.

The frontend does not submit `user_id`.

The SQL queries restrict capsule access using the authenticated user's ID.

During the AI-assisted review, proposed backend changes were also checked using an in-memory SQLite database and mocked Express/authentication dependencies. These checks covered route behaviour and ownership logic; they did not replace deployed browser testing or verify real OAuth authentication.

The actual deployed CRUD test result is recorded in the Verification section.

### Implementation Decision

One implementation decision was to deploy the React frontend and Express backend together under one public Render URL.

Express serves the React production build and the API from the same application.

This allows the frontend to use relative API paths, reduces unnecessary CORS complexity and simplifies the authentication cookie configuration.

---

## Limitations

The deployed version uses SQLite on Render's ephemeral local filesystem.

Saved records are lost when the service restarts or redeploys. On Render's Free plan, this also occurs when the service spins down after inactivity.

The application also stores `prompt_version` as a text value such as `v1`, `v2` or `v3`. Updating a capsule changes the existing record rather than automatically keeping a complete historical copy of every previous version.