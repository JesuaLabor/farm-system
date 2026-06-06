# 🌾 Farm System — Implementation Plan
### Web-Based Local Economic Support System for Local Farmers

---

> **Tech Stack:** Next.js (Frontend) · Firebase Firestore (Database) · Firebase Auth · Firebase Cloud Functions (Backend Logic) · Cloudinary (File Storage) · Leaflet.js (Maps) · Recharts (Charts) · Vercel (Deployment)

---

## 📁 Recommended Project Structure

```
farm-system/
├── app/                         # Next.js App Router pages
│   ├── (auth)/
│   │   ├── login/
│   │   └── register/
│   ├── farmer/
│   │   ├── dashboard/
│   │   ├── marketplace/
│   │   ├── financial-tracker/
│   │   └── aid-programs/
│   ├── buyer/
│   │   ├── browse/
│   │   └── orders/
│   ├── lgu/
│   │   ├── dashboard/
│   │   └── aid-management/
│   ├── expert/
│   │   └── forum/
│   ├── admin/
│   │   └── dashboard/
│   └── community/
│       ├── forum/
│       └── knowledge/
├── components/
│   ├── ui/                      # Reusable UI components
│   ├── marketplace/
│   ├── financial/
│   ├── aid/
│   ├── forum/
│   └── dashboard/
├── lib/
│   ├── firebase.ts              # Firebase client init
│   ├── firestore/               # Firestore helper functions
│   └── utils/
├── hooks/                       # Custom React hooks
├── context/                     # Auth & role context
├── types/                       # TypeScript interfaces
├── public/
└── functions/                   # Firebase Cloud Functions
    ├── notifications/
    └── scheduled/               # Price updates, cleanup
```

---

## 🗄️ Firestore Collections (Database Schema)

| Collection | Key Fields |
|---|---|
| `users` | uid, name, email, role, barangay, municipality, createdAt |
| `farmer_profiles` | uid, farmName, location (GeoPoint), cropTypes[], landArea, farmPhoto |
| `products` | farmerId, cropName, quantity, unit, price, photos[], location, status, createdAt |
| `orders` | buyerId, farmerId, productId, quantity, totalPrice, status, messages[] |
| `market_prices` | cropName, pricePerKg, source, date, trend[] |
| `aid_programs` | title, description, eligibility, documents[], deadline, managedBy (LGU uid) |
| `aid_applications` | farmerId, programId, status, submittedDocs[], reviewedBy, timestamps |
| `harvest_logs` | farmerId, cropName, quantity, harvestDate, notes |
| `financial_records` | farmerId, type (income/expense), amount, category, date, notes |
| `forum_posts` | authorId, role, title, body, tags[], answers[], likes, createdAt |
| `notifications` | userId, type, message, isRead, createdAt |
| `articles` | authorId, title, content, category, tags[], publishedAt |

---

## 🚀 Development Phases

---

### ✅ Phase 0 — Project Setup & Infrastructure
**Timeline: Days 1–3**

#### 0.1 Repository & Tooling
- [x] Initialize Next.js project with TypeScript: `npx create-next-app@latest ./ --typescript --app --eslint`
- [x] Install core dependencies:
  ```bash
  npm install firebase recharts leaflet react-leaflet
  npm install @types/leaflet react-hot-toast react-hook-form zod
  npm install @hookform/resolvers clsx tailwindcss lucide-react
  npm install cloudinary jspdf xlsx
  ```
- [x] Configure ESLint + Prettier
- [x] Set up `.env.local` with all Firebase and Cloudinary keys

#### 0.2 Firebase Project Setup
- [x] Create Firebase project at `console.firebase.google.com`
- [x] Enable **Firebase Auth** (Email/Password + Google Sign-In)
- [x] Enable **Firestore** in production mode
- [x] Enable **Firebase Storage** (for backup, Cloudinary is primary)
- [x] Set up **Firebase Cloud Functions** environment
- [x] Configure Firestore Security Rules (role-based read/write)

#### 0.3 Design System
- [x] Define CSS variables (colors, spacing, typography) in `globals.css`
- [x] Set up Google Fonts (Inter or Plus Jakarta Sans)
- [x] Create base UI components: `Button`, `Input`, `Card`, `Badge`, `Modal`, `Spinner`
- [x] Implement dark/light mode toggle (optional)

#### 0.4 Firebase Security Rules (Initial)
```firestore
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth.uid == userId;
    }
    match /products/{productId} {
      allow read: if true;
      allow write: if get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'farmer';
    }
  }
}
```

---

### ✅ Phase 1 — Authentication & User Management
**Timeline: Week 1 (Days 4–10)**

#### 1.1 Authentication Flow
- [x] Build `/login` page with email/password form
- [x] Build `/register` page with role selection:
  - Farmer | Buyer | Agricultural Expert
  - LGU Officer requires admin approval
- [x] Implement `AuthContext` with `useAuth()` hook
- [x] Create `RoleGuard` HOC to protect routes based on user role
- [x] Handle auth state persistence (Firebase `onAuthStateChanged`)
- [x] Implement logout with session cleanup

#### 1.2 Profile Setup (Post-Registration)
- [x] **Farmer Profile Setup Wizard:**
  - Step 1: Personal info (name, contact, address)
  - Step 2: Farm details (name, size, primary crops, location picker via Leaflet)
  - Step 3: Upload farm photo (via Cloudinary upload widget)
- [x] **Buyer Profile Setup:**
  - Contact info, delivery address
- [x] **LGU Officer Profile:**
  - Municipality, office, ID number (requires admin approval)

#### 1.3 Role-Based Dashboard Routing
- [x] Create role-specific landing pages after login:
  - Farmer → `/farmer/dashboard`
  - Buyer → `/buyer/browse`
  - LGU → `/lgu/dashboard`
  - Expert → `/expert/forum`
  - Admin → `/admin/dashboard`

#### 1.4 User Management (Admin)
- [x] Admin panel to view all users
- [x] Approve/reject LGU officer registrations
- [x] Suspend or deactivate accounts

---

### ✅ Phase 2 — Farmer Marketplace
**Timeline: Week 2–3 (Days 11–21)**

#### 2.1 Product Listing (Farmer Side)
- [x] Create "Add Product" form with fields:
  - Crop name (dropdown + custom), quantity, unit (kg/sack/piece), price
  - Description, available dates, pickup/delivery options
  - Upload up to 5 photos via Cloudinary
  - Location auto-filled from farmer profile (editable)
- [x] Product management dashboard (My Listings):
  - View, edit, mark as sold, delete listings
  - Show view count and inquiry count per listing
- [x] Listing status: `active | sold | expired | draft`

#### 2.2 Marketplace Browse (Buyer Side)
- [x] Browse page with:
  - Search by crop name
  - Filter by: crop type, location (municipality/barangay), price range, availability
  - Sort by: newest, price (low-high), proximity
- [x] Product detail page:
  - Photo gallery, farmer info card, price, quantity, location map (Leaflet)
  - "Contact Farmer" button → opens messaging thread
  - "Place Order" button

#### 2.3 Order System
- [x] Order placement flow:
  - Select quantity → confirm price → add delivery notes → submit
- [x] Order status lifecycle: `pending → confirmed → ready → completed | cancelled`
- [x] Farmer order management view (accept/reject/complete orders)
- [x] Buyer order history and active orders view

#### 2.4 Direct Messaging
- [x] Firestore real-time chat per order thread
- [x] Farmer ↔ Buyer messaging interface
- [x] Unread message badge/indicator
- [x] Message notifications

#### 2.5 Map View
- [x] Leaflet.js map showing product pins per barangay
- [x] Clicking a pin shows product preview card
- [x] Filter map by crop type

---

### ✅ Phase 3 — Government Aid & Programs Module
**Timeline: Week 4 (Days 22–28)**

#### 3.1 Aid Program Listings (LGU/Admin Side)
- [x] LGU officers can create aid programs with:
  - Title, description, type (subsidy/loan/seed/training)
  - Eligibility criteria, required documents list
  - Application deadline, slots available
  - Contact person
- [x] Admin can approve/publish programs

#### 3.2 Aid Application (Farmer Side)
- [x] Browse available aid programs page
- [x] Program detail view with eligibility check
- [x] Application form:
  - Auto-fill farmer data from profile
  - Upload required documents (Cloudinary):
    - Land title, farm registration, valid ID, etc.
  - Certification/declaration checkbox
- [x] Submission confirmation with reference number

#### 3.3 Application Tracking
- [x] Farmer "My Applications" dashboard:
  - Status timeline: `Submitted → Under Review → Approved / Rejected`
  - View reviewer comments/notes
  - Re-submit if documents are incomplete
- [x] LGU application review panel:
  - View all applications per program
  - Filter by status, municipality, date
  - Approve/reject with notes
  - Download application documents

#### 3.4 Notifications for Aid
- [x] Auto-notify farmer when application status changes
- [x] Remind farmers of upcoming deadlines

---

### ✅ Phase 4 — Farm Financial Tracker
**Timeline: Week 5 (Days 29–35)**

#### 4.1 Harvest Log
- [x] Add harvest entry form:
  - Crop, quantity, unit, harvest date, field notes
- [x] Harvest history table with filter by date/crop
- [x] Monthly harvest summary card

#### 4.2 Financial Records
- [x] Add income/expense entry:
  - Type (income/expense), amount, category, date, notes
  - Income categories: crop sale, aid received, other
  - Expense categories: seeds, fertilizer, labor, equipment, transport, other
- [x] Financial records table with date range filter

#### 4.3 Reports & Analytics
- [x] Income vs Expense summary card (monthly/yearly)
- [x] Profit/Loss calculation
- [x] Bar chart: Monthly income vs expenses (Recharts)
- [x] Pie chart: Expense breakdown by category
- [x] Crop revenue ranking (which crop earned most)

#### 4.4 Export
- [x] Export financial records as **PDF** (using `jspdf`)
- [x] Export as **Excel/CSV** (using `xlsx`)
- [x] Include farm name, date range, and summary in export header

---

### ✅ Phase 5 — Market Price Monitor & Knowledge Hub
**Timeline: Week 6 (Days 36–42)**

#### 5.1 Market Price Monitor
- [x] Price listing page showing current prices per crop:
  - Crop name, price per kg, date updated, source
  - Color-coded trend indicator (↑ red, ↓ green, → gray)
- [x] Price trend chart per crop (line chart, last 30 days — Recharts)
- [x] Admin/LGU can manually input or update prices
- [x] Price alert system: notify farmers when their crop's price changes >10%

#### 5.2 Weather Forecast Widget
- [x] Integrate PAGASA or Open-Meteo API (free)
- [x] Display on farmer dashboard: temperature, rain, humidity, 5-day forecast
- [x] Location-based (uses farmer's municipality from profile)

#### 5.3 Knowledge Hub — Articles
- [x] Article list page with category filter (pest control, soil, irrigation, etc.)
- [x] Article detail page with rich text (markdown renderer)
- [x] Admin/Expert can create and publish articles
- [x] Search articles by keyword or tag

#### 5.4 Community Q&A Forum
- [x] Post a question form (title, body, tags)
- [x] Forum list page with filters: unanswered, trending, by tag
- [x] Question detail page with threaded answers
- [x] Upvote answers (Firestore atomic increment)
- [x] Mark answer as "Best Answer" (question author only)
- [x] Expert badge shown on expert answers

#### 5.5 Pest & Disease Guide
- [x] Static or Firestore-backed guide entries
- [x] Each entry: crop affected, symptoms, photos, treatment
- [x] Searchable by crop name or symptom keyword

---

### ✅ Phase 6 — LGU Monitoring Dashboard & Polish
**Timeline: Week 7–8 (Days 43–56)**

#### 6.1 LGU Monitoring Dashboard
- [x] Overview statistics cards:
  - Total registered farmers, active listings, pending aid applications
  - Crop production volume (from harvest logs)
- [x] Farmer directory table:
  - Name, barangay, crops grown, registration date, aid applications
  - Click to view full farmer profile
- [x] Map view of all farmers in municipality (Leaflet pins)
- [x] Aid application status overview (pie chart)
- [x] Crop production bar chart per barangay

#### 6.2 LGU Report Generation
- [x] Generate compliance report: farmers by barangay with aid status
- [x] Generate crop distribution report
- [x] Export as PDF or Excel

#### 6.3 Admin Dashboard
- [x] Platform-wide statistics (users, products, orders, applications)
- [x] User management table (view, suspend, approve)
- [x] Content moderation (remove inappropriate forum posts/products)
- [x] Market price management
- [x] Audit log of admin actions

#### 6.4 Notification System (Full)
- [x] Notification bell with unread count in navbar
- [x] Notification types:
  - Order placed / confirmed / cancelled
  - Aid application status changed
  - New message received
  - Price alert triggered
  - Forum answer on your question
- [x] Mark all as read, mark individual as read
- [x] Firebase Cloud Functions trigger for server-side notifications

#### 6.5 Mobile Responsiveness
- [x] Audit all pages for mobile breakpoints
- [x] Implement mobile-first navigation (hamburger menu / bottom nav for farmers)
- [x] Ensure map, charts, and tables are scrollable/responsive
- [x] Touch-friendly buttons and form inputs

#### 6.6 Performance & Polish
- [x] Add loading skeletons for all data-fetching states
- [x] Add empty states with helpful CTA messages
- [x] Error boundary components for graceful failures
- [x] Image lazy loading and optimization (Next.js `<Image />`)
- [x] Firestore query optimization (composite indexes, pagination)
- [x] SEO meta tags for all public pages

---

### ✅ Phase 7 — Deployment
**Timeline: Days 57–60**

#### 7.1 Pre-Deployment Checklist
- [ ] Finalize Firestore security rules (test with Firebase Emulator)
- [ ] Set all environment variables in Vercel project settings
- [ ] Enable Cloudinary signed uploads (remove unsigned upload presets)
- [ ] Configure Firebase App Check (optional, anti-abuse)
- [ ] Review CORS settings on Cloud Functions

#### 7.2 Deployment Steps
- [ ] Connect GitHub repo to **Vercel**
- [ ] Set `NEXT_PUBLIC_*` environment variables in Vercel dashboard
- [ ] Deploy Firebase Cloud Functions: `firebase deploy --only functions`
- [ ] Configure custom domain (if available)
- [ ] Enable Vercel Analytics

#### 7.3 Post-Deployment
- [ ] Seed initial data: sample crop prices, sample aid programs
- [ ] Create initial admin account via Firebase Console
- [ ] Run end-to-end smoke test across all user roles
- [ ] Monitor Firebase usage quota (Spark plan limits)

---

## 📊 Phase Summary Timeline

| Phase | Title | Status |
|---|---|---|
| Phase 0 | Project Setup & Infrastructure | ✅ COMPLETE |
| Phase 1 | Authentication & User Management | ✅ COMPLETE |
| Phase 2 | Farmer Marketplace | ✅ COMPLETE |
| Phase 3 | Government Aid & Programs | ✅ COMPLETE |
| Phase 4 | Farm Financial Tracker | ✅ COMPLETE |
| Phase 5 | Market Price Monitor & Knowledge Hub | ✅ COMPLETE |
| Phase 6 | LGU Monitoring Dashboard & Polish | ✅ COMPLETE |
| Phase 7 | Deployment | 🔲 NEXT |

> **Estimated Total Duration: ~2 months (60 days)**

---

## ✅ Infrastructure Layer (Added June 6, 2026)

All Firestore helpers, custom hooks, and shared UI components built as a shared layer:

### `lib/firestore/` — Firestore CRUD Helpers
- `products.ts` — Create, paginated browse, farmer listings, view-count increment, delete
- `orders.ts` — Create orders, buyer/farmer views, status update, message append  
- `users.ts` — Profile CRUD, role queries, municipality filter, approval toggle
- `financial.ts` — Income/expense records, harvest logs, chart aggregation helpers
- `aid.ts` — Aid programs + application submit + LGU review workflow
- `forum.ts` — Posts, answers, view increment, unanswered filter
- `notifications.ts` — Real-time `onSnapshot` subscription
- `market-prices.ts` — Price list + trend history

### `hooks/` — Custom React Hooks
- `useProducts.ts` — Farmer listings + buyer browse with filters
- `useOrders.ts` — Buyer and farmer order management
- `useNotifications.ts` — Real-time notification badge

### `components/` — Shared UI Components
- `ui/Badge.tsx`, `ui/Modal.tsx`, `ui/Skeleton.tsx`, `ui/EmptyState.tsx`
- `dashboard/NotificationList.tsx` — Real-time notification list
- `dashboard/NavBar.tsx` — Role-aware navbar with mobile hamburger + notification badge
- `marketplace/ProductCard.tsx` — Dual-mode (buyer browse / farmer management)

### `types/index.ts` — TypeScript Interfaces
All 12 Firestore collection types defined: `UserProfile`, `Product`, `Order`, `FinancialRecord`, `HarvestLog`, `AidProgram`, `AidApplication`, `MarketPrice`, `ForumPost`, `ForumAnswer`, `Notification`, `PriceTrendEntry`

### `lib/utils.ts` — Shared Utilities
`formatPHP`, `formatDate`, `formatRelativeTime`, `generateRef`, `getPriceTrend`, `getOrderStatusMeta`, `getApplicationStatusMeta`, `cn()`

---

## ⚠️ Key Technical Notes

### Why Firebase over a custom Go backend?
Firebase provides real-time listeners (essential for messaging and notifications), built-in auth, and serverless scalability — ideal for an MVP with limited infrastructure resources.

### Firestore Pagination
Always use `startAfter()` cursor-based pagination for collections like `products` and `forum_posts` to avoid loading entire collections.

### Firebase Free Tier Limits
The Spark (free) plan allows 1 GiB storage, 50K reads/day, 20K writes/day. Plan to upgrade to Blaze (pay-as-you-go) before public launch.

### Security Rules are Critical
Every collection must have explicit read/write rules based on `request.auth` and user role from the `users` collection. Never use `allow read, write: if true` in production.

---

## 🔗 Phase 2+ Integrations (Post-MVP)

| Integration | Purpose | API/Service |
|---|---|---|
| PAGASA / Open-Meteo | Weather forecast | `api.open-meteo.com` (free) |
| DA Price Feed | Automated crop prices | DA OpenData or web scraping |
| GCash / PayMaya | In-platform payments | PayMongo (PH payment gateway) |
| SMS Alerts | Notify farmers without smartphones | Semaphore PH |
| PhilSys | Farmer identity verification | eGov API |

---

## 👥 User Role Access Matrix

| Feature | Farmer | Buyer | LGU Officer | Expert | Admin |
|---|---|---|---|---|---|
| List Products | ✅ | ❌ | ❌ | ❌ | ✅ |
| Buy Products | ❌ | ✅ | ❌ | ❌ | ✅ |
| Apply for Aid | ✅ | ❌ | ❌ | ❌ | ✅ |
| Approve Aid | ❌ | ❌ | ✅ | ❌ | ✅ |
| Financial Tracker | ✅ | ❌ | ❌ | ❌ | ✅ |
| Monitor Farmers | ❌ | ❌ | ✅ | ❌ | ✅ |
| Answer Forum | ✅ | ❌ | ✅ | ✅ | ✅ |
| Manage Prices | ❌ | ❌ | ✅ | ❌ | ✅ |

---

*Plan generated: May 16, 2026 | Project: farm-system | Stack: Next.js + Firebase + Vercel*
