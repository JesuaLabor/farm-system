# 🌾 Farm System — Project Documentation

> **Web-Based Local Economic Support System for Filipino Farmers**
> Built with Next.js 16 · Firebase · Cloudinary · Leaflet.js · Recharts

---

## 📋 Table of Contents

1. [Project Overview](#1-project-overview)
2. [Tech Stack](#2-tech-stack)
3. [Project Structure](#3-project-structure)
4. [User Roles & Access](#4-user-roles--access)
5. [Features by Module](#5-features-by-module)
6. [Database Schema](#6-database-schema-firestore)
7. [Security Rules](#7-security-rules)
8. [Authentication & Mock Mode](#8-authentication--mock-mode)
9. [Environment Variables](#9-environment-variables)
10. [Running the Project](#10-running-the-project)
11. [Docker Setup](#11-docker-setup)
12. [Deployment](#12-deployment)
13. [Future Ideas](#13-future-ideas)

---

## 1. Project Overview

The **Farm System** is a full-stack web platform designed to bridge the gap between local Filipino farmers, buyers, government (LGU) officers, and agricultural experts. It provides a digital marketplace, government aid tracking, farm financial tools, and a community knowledge hub — all in one platform.

### Goals
- 🧑‍🌾 Empower farmers to list and sell produce directly to buyers
- 🏛️ Streamline LGU aid program applications and monitoring
- 📊 Give farmers financial visibility through harvest logs and income tracking
- 🤝 Connect farmers with experts via a community Q&A forum
- 🗺️ Visualize farm locations and crop distribution via interactive maps

---

## 2. Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Frontend** | Next.js 16 (App Router) + TypeScript | UI & routing |
| **Styling** | Tailwind CSS v4 | Utility-first styling |
| **Database** | Firebase Firestore | Real-time NoSQL database |
| **Auth** | Firebase Authentication | Email/password + Google Sign-In |
| **File Storage** | Cloudinary | Product photos, documents |
| **Maps** | Leaflet.js + react-leaflet | Farm & product location maps |
| **Charts** | Recharts | Financial and crop analytics |
| **Forms** | react-hook-form + Zod | Form validation |
| **Exports** | jspdf + xlsx | PDF & Excel report generation |
| **Notifications** | react-hot-toast | In-app toast notifications |
| **Deployment** | Vercel (frontend) + Firebase (backend) | Production hosting |

---

## 3. Project Structure

```
farm-system/
├── app/                        # Next.js App Router
│   ├── (auth)/                 # Auth pages (login, register)
│   ├── farmer/                 # Farmer role pages
│   │   ├── dashboard/
│   │   ├── marketplace/        # Product listings management
│   │   ├── financial-tracker/  # Income/expense tracker
│   │   ├── harvest-log/        # Crop harvest records
│   │   ├── aid-programs/       # Aid program applications
│   │   └── orders/             # Order management
│   ├── buyer/                  # Buyer role pages
│   │   ├── browse/             # Marketplace browse
│   │   └── orders/             # Order history
│   ├── lgu/                    # LGU Officer pages
│   │   ├── dashboard/          # Monitoring dashboard
│   │   ├── aid-management/     # Aid program CRUD
│   │   └── farmers/            # Farmer directory
│   ├── expert/                 # Agricultural Expert pages
│   │   └── forum/
│   ├── admin/                  # Admin panel
│   │   └── dashboard/
│   ├── community/              # Public community pages
│   │   ├── forum/              # Q&A forum
│   │   └── knowledge/          # Articles & guides
│   ├── market-prices/          # Crop price monitor
│   ├── layout.tsx              # Root layout with AuthProvider
│   ├── page.tsx                # Landing / home page
│   └── globals.css             # Global styles & CSS variables
│
├── components/                 # Reusable React components
│   ├── ui/                     # Base UI (Button, Card, Badge, Modal, Spinner, Input)
│   ├── marketplace/            # Product listing components
│   ├── financial/              # Charts & financial widgets
│   ├── aid/                    # Aid program UI components
│   ├── forum/                  # Forum post & answer components
│   └── dashboard/              # Dashboard stat cards & charts
│
├── context/
│   └── AuthContext.tsx         # Global auth state (user, profile, loading)
│
├── lib/
│   ├── firebase.ts             # Firebase app initialization
│   └── firestore/              # Firestore helper functions
│
├── hooks/                      # Custom React hooks
├── types/                      # TypeScript interface definitions
│
├── firestore.rules             # Firestore security rules
├── firestore.indexes.json      # Composite index definitions
├── firebase.json               # Firebase project config
│
├── Dockerfile                  # Next.js dev container
├── Dockerfile.firebase         # Firebase emulator container
├── docker-compose.yml          # Docker orchestration
├── run_project.sh              # Interactive dev launcher script
│
├── .env.example                # Environment variable template
├── IMPLEMENTATION_PLAN.md      # Full development roadmap
└── FUTURE_IDEAS.md             # Post-MVP innovation concepts
```

---

## 4. User Roles & Access

The system has **5 user roles**, each with a dedicated interface and permission set:

| Role | Dashboard Route | Description |
|---|---|---|
| `farmer` | `/farmer/dashboard` | Lists products, applies for aid, tracks finances |
| `buyer` | `/buyer/browse` | Browses marketplace, places & tracks orders |
| `lgu` | `/lgu/dashboard` | Manages aid programs, monitors farmers |
| `expert` | `/expert/forum` | Answers community questions with expert badge |
| `admin` | `/admin/dashboard` | Full platform control & content moderation |

### Feature Access Matrix

| Feature | Farmer | Buyer | LGU | Expert | Admin |
|---|:---:|:---:|:---:|:---:|:---:|
| List Products | ✅ | ❌ | ❌ | ❌ | ✅ |
| Buy Products | ❌ | ✅ | ❌ | ❌ | ✅ |
| Apply for Aid | ✅ | ❌ | ❌ | ❌ | ✅ |
| Approve Aid | ❌ | ❌ | ✅ | ❌ | ✅ |
| Financial Tracker | ✅ | ❌ | ❌ | ❌ | ✅ |
| Monitor Farmers | ❌ | ❌ | ✅ | ❌ | ✅ |
| Post/Answer Forum | ✅ | ❌ | ✅ | ✅ | ✅ |
| Manage Prices | ❌ | ❌ | ✅ | ❌ | ✅ |

---

## 5. Features by Module

### 🛒 Marketplace (Phase 2)
- Farmers create product listings with up to 5 photos (Cloudinary), price, quantity, location
- Buyers browse with search, filter (crop type, location, price range), and sort options
- Leaflet.js map view with product pins per barangay
- Direct messaging between buyer and farmer per order thread
- Order lifecycle: `pending → confirmed → ready → completed | cancelled`

### 🏛️ Government Aid Module (Phase 3)
- LGU officers create aid programs (subsidy, loan, seed, training) with eligibility criteria
- Farmers browse and apply with document uploads (Cloudinary)
- Application status tracking: `Submitted → Under Review → Approved / Rejected`
- LGU review panel with filter, approve/reject with notes, and document download
- Auto-notifications on status changes

### 📊 Farm Financial Tracker (Phase 4)
- Harvest log entries (crop, quantity, date, notes)
- Income & expense records with categories
- Analytics: monthly income vs expense bar chart, expense breakdown pie chart, crop revenue ranking
- Export reports as **PDF** (jspdf) or **Excel/CSV** (xlsx)

### 📈 Market Price Monitor (Phase 5)
- Live crop price listings with trend indicators (↑ ↓ →)
- 30-day price trend line charts per crop (Recharts)
- LGU/Admin can update prices manually
- Price alert notifications when prices change > 10%

### 🌤️ Weather Widget (Phase 5)
- Integrated with **Open-Meteo API** (free, no key required)
- Displays temperature, rain, humidity, and 5-day forecast
- Location-based using farmer's municipality from profile

### 💬 Community Forum & Knowledge Hub (Phase 5)
- Q&A forum with threaded answers and upvoting
- Expert answers highlighted with a badge
- Question author can mark a "Best Answer"
- Article library with category filter (pest control, soil, irrigation)
- Pest & Disease guide searchable by crop or symptom

### 🏛️ LGU Monitoring Dashboard (Phase 6)
- Overview stats: total farmers, active listings, pending aid applications
- Farmer directory table with full profile view
- Leaflet map of all farmers in municipality
- Crop production charts per barangay
- PDF & Excel report generation

### 🔔 Notification System (Phase 6)
- Real-time notification bell with unread count
- Notification types: orders, aid status, messages, price alerts, forum replies
- Firebase Cloud Functions trigger server-side notifications

---

## 6. Database Schema (Firestore)

| Collection | Key Fields |
|---|---|
| `users` | `uid, name, email, role, barangay, municipality, createdAt` |
| `farmer_profiles` | `uid, farmName, location (GeoPoint), cropTypes[], landArea, farmPhoto` |
| `products` | `farmerId, cropName, quantity, unit, price, photos[], location, status, createdAt` |
| `orders` | `buyerId, farmerId, productId, quantity, totalPrice, status, messages[]` |
| `market_prices` | `cropName, pricePerKg, source, date, trend[]` |
| `aid_programs` | `title, description, eligibility, documents[], deadline, managedBy` |
| `aid_applications` | `farmerId, programId, status, submittedDocs[], reviewedBy, timestamps` |
| `harvest_logs` | `farmerId, cropName, quantity, harvestDate, notes` |
| `financial_records` | `farmerId, type (income/expense), amount, category, date, notes` |
| `forum_posts` | `authorId, role, title, body, tags[], answers[], likes, createdAt` |
| `notifications` | `userId, type, message, isRead, createdAt` |
| `articles` | `authorId, title, content, category, tags[], publishedAt` |

> **Pagination:** Always use `startAfter()` cursor-based pagination for `products` and `forum_posts` to avoid loading full collections.

---

## 7. Security Rules

Firestore security rules are defined in `firestore.rules`. Summary:

| Collection | Read | Write |
|---|---|---|
| `users` | Any authenticated user | Owner or admin only |
| `products` | Public (anyone) | Farmer (create), Owner/Admin (update/delete) |
| `orders` | Buyer, Farmer, or Admin of that order | Buyer (create), Buyer/Farmer (update) |
| `aid_programs` | Public | LGU or Admin only |
| `aid_applications` | Farmer (own), LGU, Admin | Farmer (create), LGU/Admin (update) |
| `harvest_logs` | Owner farmer | Owner farmer |
| `financial_records` | Owner farmer | Owner farmer |
| `forum_posts` | Public | Any auth user (create), Author/Admin (edit/delete) |
| `market_prices` | Public | LGU or Admin only |
| `notifications` | Recipient user | Any auth user (create) |

> ⚠️ Before going to production, test all rules using the **Firebase Emulator Suite** and the **Firestore Rules Playground** in Firebase Console.

---

## 8. Authentication & Mock Mode

Authentication is handled in `context/AuthContext.tsx` using Firebase `onAuthStateChanged`.

### Live Mode (Firebase configured)
- User logs in via `/login`
- Auth state persists via Firebase session
- User profile fetched from `users/{uid}` in Firestore
- Role-based redirects handled on dashboard routes

### Mock Mode (no `.env.local` / missing API key)
When Firebase is not configured, the app runs in **Mock Mode**:
- No real login required
- A demo user is injected automatically
- Role can be set via URL query param: `?role=farmer`, `?role=lgu`, `?role=buyer`, etc.
- Useful for UI development without a Firebase project

```
http://localhost:3000/farmer/dashboard?role=farmer
http://localhost:3000/lgu/dashboard?role=lgu
http://localhost:3000/buyer/browse?role=buyer
```

---

## 9. Environment Variables

Copy `.env.example` to `.env.local` and fill in your credentials.

```env
# Firebase (required)
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# Cloudinary (optional — for image uploads)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Get Firebase values from: **Firebase Console → Project Settings → Your Apps → Web App config**

---

## 10. Running the Project

### Prerequisites
- Node.js 20+
- npm
- Firebase CLI (`npm install -g firebase-tools`)

### Quick Start (Interactive Launcher)

```bash
./run_project.sh
```

This presents a menu:

```
  [1] 🖥️   Local   — npm + Firebase Emulators
  [2] 🐳  Docker  — docker compose up --build
  [3] 🐳  Docker  — start existing containers (no rebuild)
  [4] 🛑  Docker  — stop & remove containers
```

### Manual Commands

```bash
# Install dependencies
npm install

# Start dev server only (points to live Firebase)
npm run dev

# Start with local Firebase emulators
firebase emulators:start --only auth,firestore &
npm run dev

# Build for production
npm run build

# Lint check
npm run lint
```

| URL | Service |
|---|---|
| `http://localhost:3000` | Next.js App |
| `http://localhost:4000` | Firebase Emulator UI |
| `http://localhost:8080` | Firestore Emulator |
| `http://localhost:9099` | Auth Emulator |

---

## 11. Docker Setup

The project includes a full Docker configuration for local development.

### Files

| File | Description |
|---|---|
| `Dockerfile` | Next.js dev container with hot-reload support |
| `Dockerfile.firebase` | Firebase Auth + Firestore emulator container |
| `docker-compose.yml` | Orchestrates both services |
| `.dockerignore` | Excludes `node_modules`, `.next`, and secrets |

### Commands

```bash
# First run (builds images)
docker compose up --build

# Subsequent runs (faster, no rebuild)
docker compose up

# Stop all containers
docker compose down

# View logs
docker compose logs -f
```

> **Hot reload** works out of the box — your source code is volume-mounted into the container.

---

## 12. Deployment

### Frontend → Vercel

1. Push the repository to GitHub
2. Import the project at [vercel.com](https://vercel.com)
3. Set all `NEXT_PUBLIC_*` environment variables in Vercel dashboard
4. Deploy — Vercel auto-deploys on every `main` branch push

### Backend → Firebase

```bash
# Deploy Firestore security rules
firebase deploy --only firestore:rules

# Deploy Firestore indexes
firebase deploy --only firestore:indexes

# Deploy Cloud Functions (if used)
firebase deploy --only functions
```

### Pre-Deployment Checklist

- [ ] Finalize Firestore security rules (test with Firebase Emulator)
- [ ] Enable Cloudinary **signed uploads** (remove unsigned presets)
- [ ] Set all env vars in Vercel project settings
- [ ] Configure Firebase App Check (anti-abuse)
- [ ] Seed initial data: crop prices, sample aid programs
- [ ] Create initial admin account via Firebase Console
- [ ] Run smoke test across all 5 user roles
- [ ] Monitor Firebase Spark plan quota (50K reads/day, 20K writes/day)

> **Firebase Free Tier:** The Spark plan allows 1 GiB storage, 50K reads/day, 20K writes/day. Upgrade to **Blaze (pay-as-you-go)** before public launch.

---

## 13. Future Ideas

Six high-impact post-MVP features are planned. See [`FUTURE_IDEAS.md`](./FUTURE_IDEAS.md) for full details.

| # | Feature | Tech |
|---|---|---|
| 1 | 🛡️ Farm-to-Table QR Code Traceability | `qrcode` library + Firestore URLs |
| 2 | 📲 SMS Gateway for feature-phone farmers | Semaphore PH / Twilio |
| 3 | 🤝 Barangay Group Buying (logistics sharing) | Firestore aggregation + real-time progress |
| 4 | 🤖 AI Pest & Disease Diagnosis | Gemini API (Multimodal) |
| 5 | 🚚 Shared Trucking ("Angkas for Vegetables") | Leaflet.js location matching |
| 6 | 🪙 Green Credits & Community Currency | Firestore ledger system |

---

## 👥 Post-MVP Integrations

| Integration | Purpose | Service |
|---|---|---|
| PAGASA / Open-Meteo | Weather forecast | `api.open-meteo.com` (free) |
| DA Price Feed | Automated crop prices | DA OpenData |
| GCash / PayMaya | In-platform payments | PayMongo (PH) |
| SMS Alerts | Notify farmers without smartphones | Semaphore PH |
| PhilSys | Farmer identity verification | eGov API |

---

*Documentation maintained by: Antigravity | Project: Farm System | May 2026*
