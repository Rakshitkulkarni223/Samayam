# SAMAYAM (समय) — Ayurvedic Hospital Management System

React frontend + Express/Node backend, backed by **MongoDB**. Designed to deploy
to [Render](https://render.com) with minimal configuration via a `render.yaml`
blueprint.

## Project layout

```
Samayam/
├── render.yaml          # Render blueprint (defines both services)
├── backend/             # Express API (Mongoose)
│   ├── server.js
│   └── package.json
└── client/              # React frontend (Create React App)
    ├── src/
    └── package.json
```

## Local development

### 1. Backend

```bash
cd backend
cp .env.example .env          # edit MONGODB_URI if not using local MongoDB
npm install
npm start                     # http://localhost:5000/api
```

Requires a running MongoDB (local `mongod` or a MongoDB Atlas URI in `.env`).
Default admin login: `admin` / `admin123` (override with `SAMAYAM_ADMIN_USER`
and `SAMAYAM_ADMIN_PASS`).

### 2. Frontend

```bash
cd client
cp .env.example .env          # points to http://localhost:5000/api by default
npm install
npm start                     # http://localhost:3000
```

## Deploying to Render (Blueprint)

The `render.yaml` at the repo root defines two services:

| Service      | Type         | Root     | Description                       |
| ------------ | ------------ | -------- | --------------------------------- |
| `samayam-api`| Web Service  | `backend`| Express API (Node, free tier)     |
| `samayam-web`| Static Site  | `client` | Built React app served as static  |

### Steps

1. **Push this repo** to GitHub or GitLab.

2. **Create a MongoDB database.**
   The easiest free option is [MongoDB Atlas](https://www.mongodb.com/atlas):
   - Create a free M0 cluster.
   - Add a database user.
   - Allow network access from anywhere (`0.0.0.0/0`) or from Render's IPs.
   - Copy the connection string, e.g.
     `mongodb+srv://<user>:<password>@<cluster>.mongodb.net/samayam_hospital?retryWrites=true&w=majority`

3. **Create the Blueprint on Render.**
   - In the Render dashboard: **New → Blueprint**.
   - Select your repo. Render reads `render.yaml` and creates both services.
   - When prompted for secrets, fill in:
     - `MONGODB_URI` (on `samayam-api`) → your Atlas connection string.
     - `SAMAYAM_ADMIN_PASS` (on `samayam-api`) → a secure admin password.
     - `REACT_APP_API_BASE_URL` (on `samayam-web`) → leave blank for now
       (you'll set it after the backend deploys).

4. **Wait for the backend to deploy**, then copy its public URL from the Render
   dashboard, e.g. `https://samayam-api.onrender.com`.

5. **Set the frontend API URL.**
   - On the `samayam-web` static site, set environment variable
     `REACT_APP_API_BASE_URL` to `<backend-url>/api`
     (e.g. `https://samayam-api.onrender.com/api`).
   - Trigger a redeploy (Render → Manual Deploy → Deploy latest commit).

6. Open the frontend URL and log in with the admin credentials.

### Notes

- Render's free Web Services spin down after 15 min of inactivity; the first
  request after idle may take ~30s to wake up.
- In-memory sessions are lost on backend redeploy/restart, so users will need
  to log in again after a deploy.
- The `render.yaml` uses `sync: false` for secrets so they are never committed
  to the repo — set them in the Render dashboard.
