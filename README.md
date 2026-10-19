# COMP3123 Assignment 1 - Employee Management API

A Node.js / Express REST API using MongoDB, Mongoose, JWT authentication, per-user employee ownership, Zod validation, bcrypt password hashing, Helmet, rate limiting and Winston logs.

**This is source code for an academic assignment.** Set up your own MongoDB Atlas account, run and test it, take genuine screenshots, and be able to explain your implementation before submitting. A hosted API and completed screenshots are not included in this source package.

## 1. Requirements

- Node.js 20+ and npm
- VS Code terminal or another terminal
- Free MongoDB Atlas database (MongoDB Compass optional)
- Postman
- Git and a GitHub account
- Vercel account for hosting

## 2. Setup (Windows PowerShell)

Open the **extracted folder itself** in VS Code using **File > Open Folder**. The terminal should show a path ending in `COMP3123_Assignment1_Complete` (you may rename it to `101579734_COMP3123_Assignment1`).

```powershell
node -v
npm -v
npm install
Copy-Item .env.example .env
notepad .env
```

Edit `.env`: use an Atlas MongoDB connection string that includes the database name `comp3123_assignment1`, and set a secure random `JWT_SECRET` (32+ characters). Example random secret generation in PowerShell:

```powershell
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

For Atlas: create a cluster, create a **database user**, allow your current IP in **Network Access**, then go to **Connect > Drivers** and copy the Node.js URI. Replace the username/password placeholders. URL-encode special password characters if necessary. **Never push `.env` to GitHub or include it in a ZIP**.

```powershell
npm test
npm start
```

Wait for `MongoDB connected` and `Server started on port 3000`. Open `http://localhost:3000/health` and expect a JSON response with `"database":"connected"`.

## 3. Architecture

```text
server.js                   Local startup
api/index.js                Vercel serverless entry
src/app.js                  Express middleware, routes, /health
src/config/database.js      MongoDB connection
src/config/logger.js        Winston console and local file logging
src/models/User.js          User model + hashed password field
src/models/Employee.js      Employee model with user:ObjectId ref
src/controllers/            Signup, login and CRUD logic
src/routes/                 Express Router, exact API paths
src/middleware/             JWT, validation, limits, logs, errors
src/validators/schemas.js   Zod request and ID validation
postman/                    Importable complete Postman collection
logs/                       Local log files (gitignored); sample
```

## 4. Endpoints

| Method | Path | Successful result | Needs JWT? |
|---|---|---|---|
| GET | `/health` | 200 | No |
| POST | `/api/v1/user/signup` | 201 | No |
| POST | `/api/v1/user/login` | 200 + JWT | No |
| GET | `/api/v1/emp/employees` | 200 | Yes |
| POST | `/api/v1/emp/employees` | 201 | Yes |
| GET | `/api/v1/emp/employees/:eid` | 200 | Yes |
| PUT | `/api/v1/emp/employees/:eid` | 200 | Yes |
| DELETE | `/api/v1/emp/employees?eid=...` | 204, empty response | Yes |

Signup requires `username` (3-30 letters, digits or `_`), a valid email, and password (8+ chars, uppercase + lowercase + digit). Login accepts `username` **or** `email` and `password`. An employee requires `first_name`, `last_name`, `email`, `position`, `salary` (positive number), `date_of_joining` (`YYYY-MM-DD`), and `department`. A `user` owner is attached server-side and is not accepted from request bodies.

Example signup:

```json
{ "username":"demouser1", "email":"demouser1@example.com", "password":"DemoPass123!" }
```

Example login:

```json
{ "username":"demouser1", "password":"DemoPass123!" }
```

Example employee POST:

```json
{
  "first_name":"Maya", "last_name":"Chen",
  "email":"maya.chen@example.com", "position":"Developer",
  "salary":70000, "date_of_joining":"2026-09-01", "department":"IT"
}
```

Send a login JWT in `Authorization: Bearer <token>`. To update, you may send just `{ "salary":77000 }`. To delete, use the **query parameter** `eid`, not `/employees/:eid`.

## 5. Postman testing

Import `postman/COMP3123_Assignment1.postman_collection.json` into Postman. Set collection variable `baseUrl` to `http://localhost:3000`. **Run requests in numerical order, one by one**, starting with Health, Signup User A, Signup User B, Login A, Login B, Create A and Create B. Scripts automatically save `tokenA`, `tokenB`, `employeeA`, `employeeB` and randomized demo usernames. Run the forbidden tests after both employees exist. Delete is intentionally last.

The collection contains **36 requests** covering valid cases, error cases, both directions of forbidden employee access, duplicate users, invalid ObjectIds, and Helmet header checks. The rate-limit test is separate (see below). Run the collection again with fresh usernames if you need to repeat the whole sequence.

Required proof/screenshots: health and security header, signup, login/JWT, list/create/get/update/delete, missing/invalid token, missing/invalid data, duplicate user, two-user ownership, 429, MongoDB collections, and local logging.

### Rate limiting demo

After other requests, stop the server (**Ctrl+C**), change `.env` `AUTH_RATE_LIMIT_MAX=5`, and restart with `npm start`. In Postman open **35 Repeat login after AUTH_RATE_LIMIT_MAX=5** and use Collection Runner to send it **7 times quickly**. Initial invalid logins should return 401, then requests will return **429**; take a screenshot showing 429 and the JSON error. Restore `AUTH_RATE_LIMIT_MAX=30` and restart. Rate limiting is in-memory per Node process/function instance.

## 6. Database relationship and security

- User fields: `username`, `email`, **bcrypt hash** `password`, `created_at`, `updated_at`.
- Employee fields: `first_name`, `last_name`, `email`, `position`, `salary`, `date_of_joining`, `department`, `user`, timestamps.
- `Employee.user` is a Mongoose `ObjectId` with `ref: 'User'` and is **never accepted from clients**.
- The verified JWT determines the requester. `GET /employees` filters by owner. Single employee requests compare the employee's user ID with the token's ID, returning **403** on cross-user access.
- Unknown employees get **404**, bad IDs **400**, missing/invalid JWT **401**, duplicates **409**, rate-limited requests **429**, unexpected errors **500**.
- Demo credentials for marking are created by the Postman signup requests (dummy accounts using `DemoPass123!`), not a hardcoded production account. Record the generated test usernames and emails after running the collection and share them with the instructor only if required; do not share JWTs or real secrets.

## 7. Security details

- Passwords hashed with `bcryptjs` cost 12, never sent in API responses (`select:false`).
- JWT tokens signed with HS256 and configurable expiration, validated on every employee call.
- Helmet adds HTTP security headers; check `X-Content-Type-Options: nosniff` in `/health` response headers.
- Auth routes have independent limits. General requests have an API limit. When exceeded, HTTP **429** is returned. Limits are stored in local memory and not globally coordinated on serverless instances.
- Zod rejects missing, malformed, invalid and unexpected fields, preventing users from setting ownership through JSON.
- Secrets are loaded from `.env` locally and Vercel environment variables when hosted. `.env` and `node_modules` are ignored.
- Error handling is centralized, with public JSON errors and no stack traces or internal secrets.

## 8. Logging

When running locally, request metadata (method, path, status, elapsed milliseconds), login outcomes, authorization failures and operations are logged by Winston to `logs/application.log`, with errors to `logs/errors.log`. The logger intentionally avoids full URLs with query data, request bodies, passwords, connection strings and JWTs. Take screenshots of actual local generated logs for proof. On Vercel, platform console logs are used since serverless storage is not persistent; local file logging is demonstrated locally.

## 9. Vercel deployment

1. Push the source folder to your **public** GitHub repository named `Student#_COMP3123_Assignment1` (with your own student number).
2. Sign into Vercel -> Add New -> Project -> Import the GitHub repository.
3. Framework preset: **Other**; Root Directory: project root. `vercel.json` rewrites all requests to `api/index.js`.
4. Under Environment Variables, add `MONGODB_URI`, `JWT_SECRET`, `JWT_EXPIRES_IN=2h`, `NODE_ENV=production`, `AUTH_RATE_LIMIT_MAX=30`, `API_RATE_LIMIT_MAX=150`. Do not upload your `.env` file.
5. Deploy. Test `https://YOUR-APP.vercel.app/health`, then set Postman `baseUrl` to the deployment URL and test signup, login and employee routes.
6. If connections fail, check Atlas **Network Access**. Vercel outbound IPs can vary. For a class demo, `0.0.0.0/0` Atlas allow-list can unblock it but broad network access increases risk; use a limited-permission database account with a strong password and remove broad access afterward where possible.
7. Vercel serverless filesystem is ephemeral; local log files will not persist there. Use Vercel runtime logs for deployed requests.

## 10. Git commands (PowerShell)

```powershell
git init
git add .
git commit -m "Set up Express project and user authentication"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/StudentNumber_COMP3123_Assignment1.git
git push -u origin main
```

**Avoid pretending to have a long commit history.** From this completed starter, make real future commits for testing fixes, README/evidence and deployment adjustments. Verify `git status` and `git check-ignore .env` before pushing. The instructor asks for regular development commits.

## 11. Submission

- ZIP the **project source only**, excluding `.env`, `node_modules`, `.git`, caches and credentials.
- Include the actual Postman collection and README in the ZIP and GitHub repo.
- Put genuine Postman and MongoDB screenshots into a DOCX with an appropriate title. Do not fabricate screenshots. Test two users, including forbidden access in both directions.
- D2L: upload project ZIP and screenshot DOCX; add GitHub URL, Vercel URL, and non-sensitive demo credentials in comments or an accompanying document as required by D2L.
- The published due date was October 18, 2026 at 11:59 PM; D2L availability until October 21 does not override the no-late-submissions policy.

**Note:** `npm test` checks input validation only. Full API/MongoDB integration and deployed operation still require real testing on your own machine, using the included Postman collection. This repo has not been tested against your Atlas or Vercel account.
