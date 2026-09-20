# AI Capsule

AI Capsule is a private prompt library built with React, Node.js, Express and SQLite.

Users sign in through GitHub OAuth and can create, read, update and delete their own prompt records. Express issues an application JWT after login and verifies it before allowing access to capsule data.

## Deployment details

- Public HTTPS URL: [TODO: insert the deployed application URL]
- Cloud platform: [TODO: insert the platform used]
- Deployment date: [TODO: insert the date]
- Deployed storage persistence: [TODO: state whether the SQLite file is persistent or ephemeral and explain why]

The deployment design serves the React production build and Express API from the same public HTTPS URL.

Keep the deployed application available until marking is complete.

## Requirements

- Node.js 24 and npm.
- A GitHub OAuth application.
- A cloud platform capable of running the Express server for deployment.

Run the following commands from the project root unless another directory is specified.

## Local installation

Install the dependencies:

```bash
npm --prefix backend install
npm --prefix frontend install --include=dev
```

If `backend/.env` does not already exist, copy `backend/.env.example` to `backend/.env`.

On Linux or macOS:

```bash
cp backend/.env.example backend/.env
```

On Windows PowerShell:

```powershell
Copy-Item -LiteralPath backend/.env.example -Destination backend/.env
```

If the file already exists, update its settings while preserving the real secret values.

Configure these local settings:

```dotenv
NODE_ENV=development
FRONTEND_HOST=localhost
BACKEND_HOST=localhost
FRONTEND_PORT=5173
BACKEND_PORT=3001
FRONTEND_DIST=../frontend/dist
```

Set real values for the following variables in `backend/.env`:

- `JWT_SECRET`
- `GITHUB_CLIENT_ID`
- `GITHUB_CLIENT_SECRET`

Use a long, randomly generated JWT secret. Do not commit the `.env` file.

Configure the GitHub OAuth application for local testing:

- Homepage URL: `http://localhost:5173`
- Authorization callback URL: `http://localhost:3001/auth/github/callback`

The OAuth credentials must belong to the application whose callback URL is configured for the environment being tested.

## Running locally

Start the backend in one terminal:

```bash
cd backend
npm run dev
```

Start the frontend in another terminal:

```bash
cd frontend
npm run dev
```

Open `http://localhost:5173`.

The Express backend runs at `http://localhost:3001`.

The SQLite database and capsules table are created automatically when the backend starts.

### Optional Ubuntu setup script

After installing Node.js and npm, run:

```bash
chmod +x setup_ubuntu.sh run_backend.sh run_frontend.sh
./setup_ubuntu.sh
```

The script:

- Creates `backend/.env` from the example if it is missing.
- Installs backend and frontend dependencies.
- Checks backend JavaScript syntax.
- Initialises and checks the SQLite table.
- Builds the frontend into `frontend/dist`.

Configure the real OAuth credentials and JWT secret before starting the application.

The helper scripts start the local development servers:

```bash
./run_backend.sh
```

```bash
./run_frontend.sh
```

## Cloud deployment

These instructions deploy the frontend and backend together under one public HTTPS URL.

Configure the cloud service to use Node.js 24 and the repository root as its working directory.

Use this build command:

```bash
npm --prefix backend install && npm --prefix frontend install --include=dev && npm --prefix frontend run build
```

Use this start command:

```bash
cd backend && npm start
```

Configure these environment variables on the cloud platform:

```dotenv
NODE_ENV=production
FRONTEND_HOST=YOUR_APP_HOSTNAME
BACKEND_HOST=YOUR_APP_HOSTNAME
FRONTEND_DIST=../frontend/dist
```

Replace `YOUR_APP_HOSTNAME` with the actual public hostname. Do not include `https://`, a path or a trailing slash.

Set these secrets through the cloud platform's environment settings:

- `JWT_SECRET`
- `GITHUB_CLIENT_ID`
- `GITHUB_CLIENT_SECRET`

The backend reads the platform-provided `PORT`. If it is absent, the backend uses `BACKEND_PORT`, or port `3001` by default.

Configure the GitHub OAuth application for deployment:

- Homepage URL: `https://YOUR_APP_HOSTNAME`
- Authorization callback URL: `https://YOUR_APP_HOSTNAME/auth/github/callback`

With `NODE_ENV=production`, Express serves `frontend/dist`, supports direct navigation to `/dashboard`, and sets the application cookie with the Secure attribute.

The build command explicitly installs frontend development dependencies because Vite is required to build the React application.

## Environment variables

### Backend

| Variable | Purpose |
| --- | --- |
| `NODE_ENV` | Use `development` locally and `production` in the HTTPS deployment. |
| `FRONTEND_HOST` | Frontend hostname without a protocol or path. Defaults to `localhost`. |
| `BACKEND_HOST` | Backend hostname without a protocol or path. Defaults to `localhost`. |
| `FRONTEND_PORT` | Local frontend port. Defaults to `5173`. |
| `BACKEND_PORT` | Backend listening port when `PORT` is absent. Defaults to `3001`. |
| `PORT` | Cloud-provided listening port; takes precedence over `BACKEND_PORT`. |
| `JWT_SECRET` | Secret used by Express to sign and verify application JWTs. |
| `GITHUB_CLIENT_ID` | GitHub OAuth application client ID. |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth application client secret. |
| `FRONTEND_DIST` | React build directory, resolved relative to the backend directory. Defaults to `../frontend/dist`. |

Production public URLs use HTTPS without exposing the backend's internal listening port.

### Optional frontend development settings

The frontend also supports these variables in `frontend/.env`:

| Variable | Purpose |
| --- | --- |
| `VITE_BACKEND_HOST` | Overrides the backend hostname used during frontend development. |
| `VITE_BACKEND_PORT` | Overrides the development API port, which defaults to `3001`. |

Restart the frontend development server after changing these settings.

In production, React uses relative API paths and communicates with Express on the same public origin.

## Pages and API routes

| Method | Route | Access | Purpose |
| --- | --- | --- | --- |
| GET | `/` | Public | Explains AI Capsule and provides the login entry point. |
| GET | `/login` | Public | Starts GitHub OAuth login. |
| GET | `/auth/github/callback` | OAuth callback | Completes OAuth login and issues the application JWT. |
| GET | `/dashboard` | Protected application | Displays the authenticated user's prompt records. |
| GET | `/api/health` | Public | Returns `{"status":"ok"}`. |
| GET | `/api/auth/me` | JWT required | Checks the current authenticated session. |
| GET | `/api/capsules` | JWT required | Lists the authenticated user's records. |
| POST | `/api/capsules` | JWT required | Creates a record owned by the authenticated user. |
| PUT | `/api/capsules/:id` | JWT required | Updates a record owned by the authenticated user. |
| DELETE | `/api/capsules/:id` | JWT required | Deletes a record owned by the authenticated user. |
| POST | `/logout` | Public | Clears the application session cookie. |

React uses the functions in `frontend/src/api.js` to call Express through `fetch`.

Requests use `credentials: 'include'` so the browser sends the application cookie. Create and update requests send JSON bodies.

The dashboard checks the session before displaying the protected application. The backend independently verifies authentication on every capsule request.

## OAuth, JWT and ownership

The authentication flow is:

1. The user opens `/login`.
2. Express creates a random OAuth state value and redirects to GitHub.
3. GitHub redirects to `/auth/github/callback` after authentication.
4. Express checks the OAuth state and exchanges the code for a GitHub access token.
5. Express retrieves the GitHub user's identity.
6. Express creates its own application JWT containing the GitHub user ID.
7. Express stores that JWT in a cookie named `token`.
8. The browser is redirected to `/dashboard`.

The GitHub access token is used by the backend to retrieve the user's identity. It is not used as the application's session JWT.

The application JWT:

- Is signed using `JWT_SECRET`.
- Expires after two hours.
- Is stored in an HttpOnly cookie named `token`.
- Uses the Secure cookie attribute in production.
- Is verified server-side using `jsonwebtoken.verify`.

For the documented deployment, frontend and backend use the same hostname and the cookie uses `SameSite=Lax`.

Local HTTP development uses a non-Secure cookie. The deployed application must use HTTPS and `NODE_ENV=production`.

All four capsule CRUD routes use `requireAuth`.

Requests with a missing or invalid JWT return `401` without capsule data.

For CRUD operations, the record owner comes from `req.user.userId`, obtained from the verified JWT. A browser-supplied `user_id` is not used.

Read queries filter by `user_id`. Update and delete queries match both the record ID and authenticated user ID. An inaccessible or nonexistent record returns `404`.

## Database and record model

The application uses SQLite through `better-sqlite3`.

`backend/db.js` opens `capsules.db` relative to the backend process's working directory. With the documented start command, the database is stored in `backend/capsules.db`.

The capsules table is created automatically using `CREATE TABLE IF NOT EXISTS`.

| Field | Stored information |
| --- | --- |
| `id` | Automatically generated record ID. |
| `user_id` | GitHub user ID obtained from the verified application JWT. |
| `project_name` | Project or assignment name. |
| `prompt_title` | Short prompt title. |
| `prompt_version` | Version text, such as `v1` or `v2`. |
| `prompt_text` | The prompt itself. |
| `response_summary` | Summary of the AI response. |
| `category` | Task category. |
| `usefulness` | Rating stored as text; the interface uses values from 1 to 5. |
| `reviewed` | Whether the response was checked, stored as 0 or 1. |
| `improved` | Whether the output was improved, stored as 0 or 1. |
| `screenshot_url` | Optional screenshot URLs stored as JSON text. |
| `notes` | Additional reflection or comments. |
| `created_at` | Timestamp generated automatically by SQLite. |

Project name, prompt title and prompt text must contain non-empty text.

Create and update requests validate required fields and optional text field types before performing database operations.

SQL statements use bound parameters, and ownership conditions are included in the queries.

### Storage persistence

The database is a local file. Its durability depends on whether the hosting platform preserves that file.

If the deployed filesystem is ephemeral, records can be lost after a restart, replacement or redeployment. A persistent disk must preserve the actual database location to retain those records.

Actual deployed storage arrangement:

[TODO: explain where the SQLite file is stored, whether that location is persistent, and what happens after a restart or redeployment.]

## Verification and required cURL results

Replace `YOUR_APP_HOSTNAME` in the commands below with the deployed hostname.

In Windows PowerShell, use `curl.exe` instead of `curl` if `curl` resolves to a PowerShell alias.

### Public health check

```bash
curl -i https://YOUR_APP_HOSTNAME/api/health
```

Expected status: `200`.

Expected response body:

```json
{"status":"ok"}
```

Actual result and date:

[TODO: record the result obtained from the deployed application.]

### Test 1: no authentication

```bash
curl -i https://YOUR_APP_HOSTNAME/api/capsules
```

Expected status: `401 Unauthorized`.

Expected response body:

```json
{"error":"Unauthorized"}
```

Actual result and date:

[TODO: paste the actual status and response obtained from the deployed application.]

### Test 2: fake JWT

```bash
curl -i -H "Cookie: token=fake-token-123" https://YOUR_APP_HOSTNAME/api/capsules
```

Expected status: `401 Unauthorized`.

Expected response body:

```json
{"error":"Unauthorized"}
```

Actual result and date:

[TODO: paste the actual status and response obtained from the deployed application.]

### Browser and ownership verification

Perform these checks against the deployed application and record the actual outcomes.

| Check | Expected behaviour | Actual result |
| --- | --- | --- |
| Open `/dashboard` while logged out | The protected application is unavailable and no capsule data is returned. | TODO |
| Complete GitHub OAuth login | The user reaches the dashboard with an authenticated session. | TODO |
| Inspect cookie attributes without recording its value | Cookie is named `token` and has HttpOnly and Secure attributes. | TODO |
| Create a record | The record is saved and displayed. | TODO |
| Refresh the dashboard | The saved record is loaded from the database. | TODO |
| Update the record | The changed values remain after refreshing. | TODO |
| Delete the record | The record disappears and remains deleted after refreshing. | TODO |
| Sign in as a second GitHub user | The second user cannot list the first user's records. | TODO |
| Attempt update/delete of the first user's record using the second user's session | The API returns `404` and the original record is unchanged. | TODO |
| Log out | The session cookie is cleared and protected API access returns `401`. | TODO |

Record the test date and any issue found:

[TODO: insert the real deployed verification results.]

Do not include a real JWT, OAuth secret or JWT secret in recorded results.

## AI-assisted development

### Tools used

Codex was used to review the assignment requirements, inspect the implementation, suggest fixes and check proposed configuration and route behaviour in memory.

Other AI tools used:

[TODO: list any other tools actually used, or write "None".]

### Problem found and corrected in an AI suggestion

An initial AI-proposed validation change checked only the required text fields.

This still allowed a numeric value in an optional field such as `notes` to reach `.trim()` and cause a `500` response.

The revised `validateCapsule` middleware checks that the request body is an object, that required fields contain non-empty text, and that optional text fields contain strings when supplied.

In-memory checks reproduced the earlier `500` and confirmed that the revised validation returns `400` for the same invalid input.

A separate configuration issue was also identified: the OAuth callback used `process.env.BACKEND_PORT` directly instead of the resolved backend port. The revised configuration uses `BACKEND_PORT`, including its default and `PORT` override.

### Verification performed during the review

The proposed backend changes were checked for:

- JavaScript syntax.
- Default and custom OAuth callback ports.
- Production HTTPS callback construction.
- Create, read, update and delete behaviour.
- Storage of the required record fields.
- Two-user ownership isolation.
- Rejection of invalid request bodies and text field types.

The route checks used an in-memory SQLite database with mocked Express and JWT dependencies. They did not verify real JWT cryptography, a running HTTP server, browser behaviour or live GitHub OAuth.

Actual deployed OAuth, JWT protection, CRUD and ownership verification must be recorded in the verification section above.

### Implementation decision

The application serves the React production build from Express under one public URL.

This lets React use relative API paths and keeps the browser session on the same origin. It reduces the cloud configuration needed for CORS and cross-origin cookies.

SQLite provides the required relational record storage without requiring a separate database service. The deployed filesystem's persistence must still be documented.

## Known limitation

Updating a capsule replaces its previous contents. The application stores a prompt version label but does not automatically preserve earlier revisions.

## Submission checklist

- Replace all TODO fields in this README with accurate information.
- Confirm the public application is working over HTTPS.
- Confirm `/api/health` returns the required response.
- Record both required cURL tests returning `401`.
- Demonstrate GitHub OAuth login and complete CRUD on the deployed application.
- Prepare a source-code ZIP containing the project, README, package files and database setup code.
- Exclude `node_modules`, generated build folders, `.env` files and personal database files from the source ZIP.
- Include `.env.example` with placeholder values.
- Record a 3-5 minute MP4 with working audio.
- Show the deployed URL, health check, both cURL tests, OAuth login, CRUD, cloud settings and environment-variable names.
- Explain the storage approach and one deployment issue or limitation.
- Keep secret values and real JWTs out of the video.
- Upload both the ZIP and MP4 directly to the LMS.
- Check that the uploaded video and audio work.