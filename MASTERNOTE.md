# Deccan Harvest — Master Note (SIH 2026 PS 26132)

## Project Overview
**Deccan Harvest** is an AI-driven digital marketplace and live bidding platform for APMC (Agricultural Produce Market Committee) ecosystems. It enables farmers to list crops, dealers to bid in real-time, officers to verify and manage auctions, and government agencies to monitor analytics — all with localization (English + Marathi) and mock payments.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19 + Vite + Tailwind CSS + Framer Motion + Recharts + Lucide Icons |
| Backend | Python FastAPI + SQLAlchemy + PostgreSQL |
| ML | scikit-learn (LinearRegression, DecisionTreeClassifier) |
| Auth | Mock localStorage-based (no real API calls) |
| Payments | Mock DeccanWallet (no third-party SDK) |
| Localization | English + Marathi (LanguageContext) |

---

## Directory Structure

```
Deccan-Harvest-SIH2026-26132/
├── frontend/                    # React + Vite app
│   └── src/
│       ├── App.jsx              # Router + AuthProvider + LanguageProvider
│       ├── context/
│       │   ├── AuthContext.jsx   # Mock auth (mockLogin, mockRegister, updateWallet)
│       │   └── LanguageContext.jsx # EN/Marathi toggle
│       ├── i18n.js              # Full EN + Marathi translations
│       ├── data.js              # States, UTs, Maharashtra districts, crops, timeSlots, warehouses
│       ├── api.js               # Axios client (auth now mock-only)
│       ├── components/
│       │   ├── Navbar.jsx       # Nav with language toggle, wallet, logout
│       │   ├── DeccanWallet.jsx # Wallet with deposit modal
│       │   ├── MarketTicker.jsx # Live APMC price ticker with sparklines
│       │   └── LogisticsTracker.jsx # 5-step gamified progress tracker
│       └── pages/
│           ├── Landing.jsx      # Hero + pitch (Impact/Versatility/Feasibility)
│           ├── Login.jsx        # Quick demo login buttons
│           ├── Register.jsx     # State/district selector
│           ├── FarmerDashboard.jsx  # Market prediction, ML quality, time slots
│           ├── DealerDashboard.jsx  # OLX feed, lot system, auto-bid, settlement
│           ├── OfficerDashboard.jsx # Verify crops, manage auctions
│           ├── GovDashboard.jsx     # Charts + AI recommendation
│           ├── TransportPage.jsx    # Hub & spoke logistics
│           └── WarehousePage.jsx    # Warehouse booking
├── python_backend/              # FastAPI backend
│   └── app/
│       ├── main.py              # FastAPI app with CORS
│       ├── config.py            # Settings
│       ├── database.py          # SQLAlchemy engine
│       ├── auth.py              # JWT auth
│       ├── models/models.py     # SQLAlchemy models
│       ├── schemas/schemas.py   # Pydantic schemas
│       ├── routers/             # API routers (auth, crops, auctions, etc.)
│       └── ml/ml_service.py     # Price prediction + crop recommendation
├── .gitignore
└── README.md
```

---

## Auth System (Mock)

No backend API calls for auth. Everything is localStorage-based.

### Demo Accounts
| Email | Password | Role |
|---|---|---|
| farmer@demo.com | demo | Farmer |
| dealer@demo.com | demo | Dealer |
| officer@demo.com | demo | APMC Officer |
| admin@demo.com | demo | Government |

### Key Functions
- `mockLogin(email, password)` — validates against demo accounts, stores in localStorage
- `mockRegister(data)` — creates new mock user in localStorage
- `updateWallet(amount)` — updates user.wallet in context + localStorage
- `logout()` — clears localStorage

---

## Dealer Dashboard — Bidding System

### Architecture
The Dealer Dashboard has 5 tabs: **Feed**, **Live Bids**, **Won**, **Wallet**, **Logistics**.

### Feed Tab
- Grid of crop cards with real Unsplash images
- Each card shows: crop name, lot ID (e.g., `LOT-8492A`), grade badge (A/B/C/D), current bid, location, lot info (total kg, lot size, number of lots)
- "Place Bid" button opens bid modal

### Live Bids Tab
- 2-column layout with live countdown timers
- Auto-bid simulator runs every 3-6 seconds
- Cards show "Your Bid is Highest" badge when user is winning
- Circuit limits displayed on each card

### Bid Modal (Price Discovery Only)
- **No lot selection** — modal only accepts price per unit
- Circuit Limits banner: `Lower: ₹X | Upper: ₹X × 1.20`
- Input validation: bid must be within circuit, must be higher than current
- Confirm button disabled if invalid

### Auto-Bid Simulator (Ghost Bidding)
- Runs every 3-6 seconds on random active crops
- When user places manual bid:
  1. Auto-simulator pauses for that item
  2. After **5 seconds**, simulator attempts to outbid by +₹2 to +₹10
  3. Simulator **never** exceeds Upper Circuit
  4. If user bids at Upper Circuit, simulator stops permanently for that item
- Visual feedback:
  - Card border turns **red** when outbid
  - "Outbid!" text flashes
  - Button changes to "Bid Again"
  - Green flash animation when simulator bids

### Circuit Limits
- `Lower Circuit = basePrice`
- `Upper Circuit = basePrice × 1.20`
- Strict validation: input throws error and disables confirm if outside range

### 60-Second Auction Timer
- All auctions start with 60-second countdown
- `CountdownTimer` component calls `onExpire` when timer hits 00:00
- If user is highest bidder at expiry → item auto-moves to Won tab
- Timer shows `MM:SS` format, turns red and pulses when < 15 seconds

### Won Tab (Settlement)
- Shows items user won at final discovered price
- "Claim & Pay" opens Settlement Modal:
  - Shows "You won at ₹X/unit"
  - Lot stepper `[-] [N] [+]` for quantity selection
  - Dynamic total: `price × lots`
  - "Confirm & Pay" button
- After claiming: "Pay Escrow" button (mock payment)
  - Click → "Processing..." with CSS spinner for 1.5s
  - Deducts total from DeccanWallet
  - Button changes to green "Track Logistics"

### Payment Flow (No BHK SDK)
- Pure UI simulation, no third-party payment SDK
- "Pay Escrow" → 1.5s spinner → wallet deduction → "Track Logistics"
- 5% platform fee noted in UI

---

## Farmer Dashboard

### Features
1. **Market Prediction Engine** — ML-based price prediction with 30-day forecast
2. **ML Quality Check** — Upload crop photo simulation, returns Grade A-D
3. **Time Slot Scheduler** — 3 auction slots: 10-11 AM, 2-3 PM, 5-6 PM
4. **DeccanWallet** — Compact wallet display
5. **MarketTicker** — Live APMC prices

### Crop Listing
- Form with: crop name, quantity (min 0), base price (min 0), grade, time slot
- Input guards: negative numbers blocked, `e` key blocked

---

## Other Dashboards

### Officer Dashboard
- Verify/reject farmer crops
- Schedule auctions to time slots
- Manage active auctions

### Government Dashboard
- Bar/pie charts (Recharts)
- AI crop recommendation
- Supply forecast
- Recent activity feed

### Transport Page
- Hub & spoke AI logistics
- Split booking: Farmer→Warehouse, Warehouse→Buyer

### Warehouse Page
- Book/confirm/store/release flow
- Input guards on numeric fields

---

## Localization (English + Marathi)

- Default language: **English** (toggle available on every page)
- `LanguageContext` provides `lang` state and `toggleLang()` function
- All user-facing strings in `i18n.js` under `en` and `mr` keys
- Components access via `const { t } = useLang()`

---

## Components

### MarketTicker
- 10 APMC commodities with real base prices
- Price fluctuates every 2-4 seconds (±2-4%)
- Sparkline charts for price history
- Pulsing green indicators
- "Data.gov.in Trust Badge"

### DeccanWallet
- Display balance, deposit modal
- 4 preset amounts: ₹1,000 / ₹2,000 / ₹5,000 / ₹10,000
- Active preset: `text-green-900 font-bold`
- Inactive preset: `text-gray-800`
- Negative number blocking

### LogisticsTracker
- 5-step gamified progress: Farm → Pickup → Warehouse → In Transit → Delivered
- Animated green line connecting steps
- Pulsing current step
- Vehicle info, ETA, cost breakdown

### Navbar
- Logo + tagline
- Language toggle (EN/MR)
- Wallet balance display
- Logout button

---

## Backend API (FastAPI)

### Endpoints
- `POST /auth/register` — Register new user
- `POST /auth/login` — Login (returns JWT)
- `GET /crops/` — List crops
- `POST /crops/` — Create crop listing
- `GET /auctions/` — List auctions
- `POST /auctions/` — Create auction
- `POST /auctions/{id}/bid` — Place bid
- `POST /escrow/` — Create escrow
- `POST /transport/` — Book transport
- `POST /warehouse/` — Book warehouse
- `GET /dashboard/` — Dashboard stats
- `POST /ml/predict` — Price prediction
- `POST /ml/recommend` — Crop recommendation
- `POST /upload/` — File upload

### ML Models
- **Price Prediction**: LinearRegression on crop, quantity, grade, season
- **Crop Recommendation**: DecisionTreeClassifier on N, P, K, pH, rainfall, temperature

---

## Running the App

### Frontend
```bash
cd frontend
npm install
npx vite --host 0.0.0.0
# Runs on http://localhost:5173
```

### Backend
```bash
cd python_backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
# Runs on http://localhost:8000
```

---

## Demo Flow (Hackathon Presentation)

1. **Landing Page** — Show hero with Impact/Versatility/Feasibility
2. **Register** — Create farmer account with state/district
3. **Login** — Quick demo login as farmer
4. **Farmer Dashboard** — List crop, run ML quality check, predict price
5. **Login as Dealer** — Quick demo login
6. **Dealer Feed** — Browse crops with real images, see circuit limits
7. **Live Bids** — Watch auto-bid simulator, place manual bid
8. **Ghost Bidding** — Simulator challenges after 5s, card turns red
9. **Win Auction** — 60s timer expires, item moves to Won tab
10. **Settlement** — Select lots, confirm payment
11. **Escrow** — Mock payment with spinner, wallet deduction
12. **Logistics** — Track delivery progress
13. **Officer Dashboard** — Verify crops, manage auctions
14. **Government Dashboard** — View charts and analytics

---

## Key Design Decisions

1. **No real auth API** — Mock localStorage for hackathon speed
2. **No payment SDK** — Pure UI simulation avoids crashes
3. **60-second auctions** — Fast demo, not real-time
4. **Unsplash images** — Real crop photos, not emojis
5. **Circuit limits** — Stock-market-style price bands
6. **Ghost bidding** — Competitive auto-bidder for excitement
7. **Lot selection at settlement** — Clean bid→win→claim flow
8. **Marathi localization** — Regional relevance for Maharashtra APMCs
