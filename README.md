# Cluster Manager

An internal tool that displays deployed VM **clusters** on a dashboard. It builds
on the ETL from Project 3: the same JSON data is joined into cluster records, then
served through a small REST API and shown in a React dashboard.

Because it is an internal tool, employees can **only log in** — there is no sign-up.
Accounts (and their passwords/roles) are seeded from the existing usernames in the
data.

- **Backend:** Python + Flask (reuses the P3 ETL code)
- **Frontend:** React + Vite

---

## Features

- Login-only authentication (JWT), no registration
- **My Clusters** view (your own clusters first) and an **All Clusters** view
- Search + filter by Podbox / User, sort by Created date
- Delete clusters, with roles:
  - **user** — can delete only their own clusters
  - **admin** — can delete any cluster
- Pagination (9 rows per page)

## Roles & demo accounts

Every account uses the password **`test123`**.

Four users are admins (chosen randomly with a fixed seed):

```
azveipdv, edpsdzyp, syqlmogo, wnjuxqoy
```

Everyone else (e.g. `xkaeqmom`, `hvujyxro`, …) is a normal **user**. The full list
lives in `backend/etl/data/users.json` after seeding.

---

## Project structure

```
OpenClassroomsProject6/
├── backend/
│   ├── app.py              # Flask app + API routes
│   ├── auth.py             # JWT: create token + @token_required
│   ├── users.py            # read users.json, check passwords
│   ├── seed_users.py       # build users.json (passwords + roles)
│   ├── requirements.txt
│   └── etl/                # ETL ported from Project 3
│       ├── vm_data_manager.py   # reads the JSON data files
│       ├── cluster.py           # joins the data into a cluster record
│       ├── cluster_service.py   # builds the cluster list + handles deletes
│       └── data/                # the 4 source JSON files (+ users.json)
└── frontend/
    ├── index.html
    ├── vite.config.js      # proxies /api to the backend (port 5001)
    └── src/
        ├── pages/          # Login, Dashboard
        ├── components/     # TopBar, ClusterTable, StatusBadge, PrivateRoute
        ├── api.js          # fetch wrapper (adds the token)
        └── auth.js         # stores the token/user in localStorage
```

---

## Running the app

You need **two terminals**: one for the backend, one for the frontend.

### 1. Backend (Flask) — port 5001

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

# Create the accounts (passwords + roles). Run this once.
python seed_users.py

# Start the API
python app.py
```

The API runs at `http://localhost:5001`.

### 2. Frontend (React) — port 5173

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173` and log in (e.g. `xkaeqmom` / `test123`, or an admin
like `azveipdv` / `test123`).

---

## API

All routes are prefixed with `/api`. Every route except `/login` requires the
header `Authorization: Bearer <token>`.

| Method   | Route                    | Description                                   |
|----------|--------------------------|-----------------------------------------------|
| `POST`   | `/api/login`             | `{username, password}` → `{token, username, role}` |
| `GET`    | `/api/me`                | Current `username` + `role`                   |
| `GET`    | `/api/clusters?scope=`   | `mine` (default) or `all`; also `search`, `status` |
| `DELETE` | `/api/clusters/<id>`     | Delete a cluster (own cluster, or admin)      |

Each cluster returned by `GET /api/clusters` includes a `canDelete` flag the UI
uses to enable/disable the delete checkbox.

---

## Notes

- The 4 source JSON files are **never modified**. Deletes are recorded in
  `backend/etl/data/deleted_ids.json`, so they survive a restart. Delete that file
  to restore all clusters.
- The dashboard's **Description** column shows the cluster version (e.g. `7.5.3`),
  matching the design.
