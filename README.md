# 🩸 RedPint — Blood Donor–Hospital Matching Application

A full-stack web application that connects blood donors with hospitals in need, enabling efficient blood request matching, donor eligibility tracking, and inter-hospital coordination.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB Atlas (Mongoose ODM) |
| **Authentication** | Firebase Auth (Email + Phone OTP) |
| **File Storage** | Firebase Storage |
| **Frontend** | React (Vite), React Router, Axios |
| **Maps** | Leaflet.js + OpenStreetMap |

## Features

- **Donor registration** with document upload, OTP verification, and blood group tracking
- **Hospital registration** with license verification
- **Smart matching engine** — filters donors by blood-type compatibility (8×8 matrix), 90-day donation cooldown, and ranks by Haversine distance
- **Blood request system** — hospitals can request specific blood groups with urgency levels
- **Inter-hospital requests** — hospitals can request blood from each other
- **Hospital blood stock** — self-reported inventory visible to all
- **Blood drives** — hospitals can create and list donation drives on a map
- **In-app notifications** — mocked notification layer (no real SMS)
- **Leaflet map** — shows hospitals, drives, and user location

## Project Structure

```
redpint/
├── backend/
│   ├── src/
│   │   ├── config/          # DB connection, Firebase Admin SDK
│   │   ├── controllers/     # Route handler logic
│   │   ├── middleware/       # Firebase auth verification
│   │   ├── models/          # Mongoose schemas (8 models)
│   │   ├── routes/          # Express route files
│   │   ├── seed/            # Seed scripts for test data
│   │   └── utils/           # Haversine, blood compatibility, helpers
│   ├── server.js            # Express entry point
│   ├── .env.example         # Environment variable template
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/      # Reusable UI (Navbar, MapView, AuthContext)
│   │   ├── pages/           # Route-level pages (dashboards, auth)
│   │   ├── services/        # API client, Firebase config
│   │   └── utils/           # Frontend helpers
│   ├── .env.example         # Frontend env template
│   └── package.json
├── .gitignore
└── README.md
```

## Setup Instructions

### Prerequisites

- Node.js 18+
- MongoDB Atlas account (free tier works)
- Firebase project with Auth + Storage enabled

### 1. Clone the repository

```bash
git clone https://github.com/<your-username>/redpint.git
cd redpint
```

### 2. Backend setup

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your MongoDB Atlas URI and Firebase credentials
```

### 3. Seed the database

```bash
npm run seed
# Inserts 3 Mumbai hospitals + 30 synthetic donors
```

### 4. Start the backend

```bash
npm run dev
# Server runs on http://localhost:5000
```

### 5. Frontend setup

```bash
cd ../frontend
npm install
cp .env.example .env
# Edit .env with your Firebase web config
```

### 6. Start the frontend

```bash
npm run dev
# App runs on http://localhost:5173
```

## API Endpoints

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/auth/verify` | Mark user verified after OTP |
| GET | `/api/auth/me` | Get current user profile |
| POST | `/api/donors/register` | Register donor (multipart) |
| GET | `/api/donors/me/matches` | Donor's active matches |
| POST | `/api/hospitals/register` | Register hospital (multipart) |
| GET | `/api/hospitals` | List all verified hospitals |
| POST | `/api/blood-requests` | Create blood request (triggers matching) |
| POST | `/api/blood-requests/inter-hospital` | Inter-hospital request |
| GET | `/api/blood-requests/:id/matches` | Matches for a request |
| PATCH | `/api/matches/:id/respond` | Donor accept/decline |
| POST | `/api/donations` | Record donation (resets cooldown) |
| GET/PUT | `/api/hospital-stock` | View/update blood stock |
| POST/GET | `/api/drives` | Create/list blood drives |
| GET | `/api/notifications` | User's notifications |

## Blood Compatibility Matrix

```
Recipient →  O-  O+  A-  A+  B-  B+  AB-  AB+
Donor ↓
O-           ✓   ✓   ✓   ✓   ✓   ✓   ✓    ✓    ← Universal Donor
O+               ✓        ✓        ✓        ✓
A-                    ✓   ✓             ✓    ✓
A+                        ✓                  ✓
B-                             ✓   ✓   ✓    ✓
B+                                  ✓        ✓
AB-                                     ✓    ✓
AB+                                          ✓    ← Universal Recipient
```

## Seeded Test Data

**Hospitals (Mumbai):**
- KEM Hospital, Parel (19.0012, 72.8416)
- Lilavati Hospital, Bandra (19.0509, 72.8289)
- Tata Memorial Hospital, Parel (18.9986, 72.8413)

**Donors:** 30 synthetic donors with Indian names, Mumbai coordinates, and blood groups weighted by Indian population distribution (O+ 37%, B+ 33%, A+ 22%, AB+ 7%).

## License

MIT
