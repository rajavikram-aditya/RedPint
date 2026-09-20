# 🩸 RedPint — Blood Donor–Hospital Matching Application

A full-stack web application that connects blood donors with hospitals in need, enabling efficient blood request matching, donor eligibility tracking, and inter-hospital coordination.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB (Mongoose ODM) |
| **Authentication** | Native JWT (`jsonwebtoken` + `bcryptjs`) |
| **File Storage** | Express Local Disk Storage (Multer) |
| **Frontend** | React, TanStack Start & Router, TailwindCSS, Axios |
| **Maps** | Leaflet.js + OpenStreetMap |

## Features

- **Donor registration** with document upload and blood group tracking
- **Hospital registration** with license verification and admin workflow
- **Admin dashboard** for approving/rejecting hospital accounts and monitoring network metrics
- **Smart matching engine** — filters donors by blood-type compatibility (8×8 matrix), 90-day donation cooldown, and ranks by Haversine distance
- **Blood request system** — hospitals can request specific blood groups with urgency levels
- **Inter-hospital requests** — hospitals can request blood from each other
- **Hospital blood stock** — self-reported inventory visible to all
- **Blood drives** — hospitals can create and list donation drives on a map
- **In-app notifications** — real-time notifications for donors and hospitals
- **Leaflet map** — shows hospitals, drives, and user location

## Project Structure

```
redpint/
├── backend/
│   ├── src/
│   │   ├── config/          # DB connection
│   │   ├── controllers/     # Route handler logic (auth, donor, hospital, admin, matching)
│   │   ├── middleware/       # JWT auth & role verification
│   │   ├── models/          # Mongoose schemas (Admin, Donor, Hospital, Match, etc.)
│   │   ├── routes/          # Express route files
│   │   ├── seed/            # Seed scripts for test data
│   │   └── utils/           # Haversine, blood compatibility, helpers, uploader
│   ├── uploads/             # Uploaded license and donor documents
│   ├── server.js            # Express entry point
│   ├── .env.example         # Environment variable template
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/      # Reusable UI (Navbar, MapView, RequireAuth)
│   │   ├── routes/          # TanStack Router pages (dashboards, login, registers)
│   │   └── lib/             # API client, AuthContext, data utilities
│   ├── .env.example         # Frontend env template
│   └── package.json
├── .gitignore
└── README.md
```

## Setup Instructions

### Prerequisites

- Node.js 18+
- MongoDB instance (local or MongoDB Atlas)

### 1. Clone the repository

```bash
git clone https://github.com/rajavikram-aditya/RedPint.git
cd RedPint
```

### 2. Backend setup

```bash
cd backend
npm install
cp .env.example .env
```

### 3. Seed the database

```bash
npm run seed
# Inserts 1 Admin + 3 Mumbai hospitals + 30 synthetic donors (Default password for all: password123)
```

### 4. Start the backend

```bash
npm run dev
# Server runs on http://localhost:5001
```

### 5. Frontend setup

```bash
cd ../frontend
npm install
```

### 6. Start the frontend

```bash
npm run dev
# App runs on http://localhost:5173
```

## Test Accounts

All seeded accounts use password: `password123`

| Role | Email | Password |
|------|-------|----------|
| **Admin** | `admin@redpint.app` | `password123` |
| **Hospital** | `kem@hospital.org` | `password123` |
| **Hospital** | `lilavati@hospital.org` | `password123` |
| **Hospital** | `tata@hospital.org` | `password123` |
| **Donor** | Any seeded donor email | `password123` |

## License

MIT
