# 🧶 Yarn — Flight Savings Engine

**Yarn** is a specialised flight-metasearch platform that looks beyond base fares. For every itinerary we pull live results from leading OTAs, airlines, and meta partners, stack all public coupons, issuer-specific card perks, and loyalty credits, then return the true out-of-pocket price for the traveller.

The goal: deliver the cheapest bookable flight price **after** fees, coupons, statement credits, and convenience charges so users always know the final charge that will hit their card.

---

## Why Yarn exists

- Travellers lose money because coupon portals, card-linked offers, and meta promos live in silos.
- Providers change promo logic frequently; static spreadsheets go stale in hours.
- Credit card stacks differ by issuer, cabin, route, and booking channel.

Yarn gives a single search box, evaluates every eligible stack in real time (or near real time with cached delta refreshes), and explains how to book it.

---

## Core capabilities

- **Provider aggregation**: Amadeus, Skyscanner, Sabre, TravelFusion, Google Flights partner feeds, direct airline APIs.
- **Discount graph**: Coupons, OTA hidden deals, issuer portals (Amex, Chase, Citi), bank category bonuses, OTA wallet credits, loyalty miles top-ups.
- **Price normalisation**: Currency conversion, convenience fees, GST/VAT, service fees, FX markups.
- **Stack optimiser**: Determines valid combinations per provider, screens stackability rules, applies opportunity cost scoring for point valuations.
- **Explained pricing**: Transparent breakdown showing base fare, taxes, fees, discount contributions, effective total.

---

## Architecture

```
┌───────────────────────────┐
│ Next.js Client (client/)  │
│ • Flight search UI        │
│ • Offer explainability    │
│ • Saved searches          │
└───────────────▲───────────┘
                │ REST / SSE
┌───────────────┴───────────┐
│ Express API (server/)     │
│ • Request validation      │
│ • Rate limiting           │
│ • Session + auth (future) │
│ • Offer orchestration     │
└───────▲───────────▲───────┘
        │           │
 ┌──────┴──────┐ ┌──┴────────┐
 │Provider Hub │ │Discount    │
 │(adapters)   │ │Engine      │
 │• Live APIs   │ │• Coupon    │
 │• Cache store │ │  stacker   │
 │• Webhooks    │ │• Card graph│
 └─────▲────────┘ └────▲──────┘
       │               │
 ┌─────┴────────┐ ┌────┴──────┐
 │Redis Cache   │ │Supabase   │
 │• Response    │ │Core data  │
 │  memoization │ │• Users    │
 │• Offer TTL   │ │• Saved    │
 └──────────────┘ │  searches │
                   └──────────┘
```

All workspaces share strict TypeScript contracts via `shared/`.

---

## Repository layout

```
yarn/
├─ client/           # Next.js 14 app directory project
│  └─ src/
│     ├─ app/        # Routing, layouts, pages
│     ├─ components/ # Shared UI + feature widgets
│     └─ lib/        # API hooks, pricing helpers
├─ server/           # Express + orchestrator services
│  └─ src/
│     ├─ config/     # Env parsing, constants
│     ├─ routes/     # REST endpoints
│     ├─ controllers/# Request handlers
│     ├─ services/   # Aggregation + providers + discounts
│     └─ utils/      # Logger, error helpers
├─ shared/           # Types, constants, utils shared everywhere
│  └─ src/
│     ├─ types/      # Flight + discount domain models
│     ├─ constants/  # Provider catalogues, currency data
│     └─ utils/      # Money math, validation helpers
├─ docker/           # Client + server Dockerfiles
├─ docker-compose.yml
├─ package.json      # npm workspace root
└─ tsconfig.base.json
```

---

## Data flow summary

1. **Client** collects itinerary, passenger mix, preferred cards, coupon hints.
2. **Server** validates payload with Zod, fingerprints request for cache, and spins provider fetches concurrently.
3. **Provider adapters** hit each partner, ingest real-time offer graphs, or fall back to cached fares when provider rate limits.
4. **Discount engine** enumerates coupon/card combos per provider, prunes invalid stacks, and calculates effective total using shared money utils.
5. **Response** returns sorted offers (cheapest, fastest, best overall) plus justification text and booking actions.

---

## Provider refresh strategy

- **Hot routes** (high search volume) keep a 5-minute TTL cache with webhook invalidate triggers.
- **Long tail** queries call providers on-demand and optionally store a short-lived snapshot for dedupe.
- **Discount catalogues** update via scheduled jobs per issuer/OTA and web scraped feeds when APIs are absent.

---

## Environment variables

`server/.env` sample:

```
PORT=5000
NODE_ENV=development

# External providers
AMADEUS_API_KEY=
AMADEUS_API_SECRET=
SABRE_CLIENT_ID=
SABRE_CLIENT_SECRET=
RAPIDAPI_KEY=

# Discount + loyalty data
CARD_OFFER_FEED_URL=
LOYALTY_POINT_VALUATION_USD=0.014

# Observability
LOG_LEVEL=debug
```

`client/.env.local` sample:

```
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_DEFAULT_CURRENCY=USD
```

---

## Getting started

```powershell
cd yarn
npm install

# run shared types in watch mode (first terminal)
npm run dev:shared

# run backend (second terminal)
npm run dev:server

# run frontend (third terminal)
npm run dev:client
```

Visit `http://localhost:3000` for the UI. API base lives at `http://localhost:5000/api`.

To run everything through Docker:

```powershell
docker-compose up --build
```

---

## Testing and quality

- `npm run lint` checks all workspaces.
- `npm run test` executes each package test suite.
- `npm run type-check` verifies TypeScript across the monorepo.

Additions should include unit coverage for discount rules and provider adapters; integration tests should mock partner APIs and assert stack ordering.

---

## Roadmap highlights

1. Provider adapters for Amadeus, Kiwi, Ryanair, AirAsia, and MakeMyTrip.
2. Discount ingestion pipeline with issuer scraping and OTP-based portals.
3. Real-time event stream (Server-Sent Events) for long-running multi-provider searches.
4. User accounts with saved payment stacks and multi-currency wallets.
5. Auto-booking assistant to prefill provider checkout pages.

---

## Contributing & Automation

- Continuous integration runs via GitHub Actions (`.github/workflows/ci.yml`). New changes must pass lint, type checks, build, and tests.
- AI assistants or automation tools should follow the guidelines in `.github/AI_INSTRUCTIONS.md` before proposing changes.

---

**Built by the Yarn team — helping travellers spend smarter on every flight.**

For questions or support, please open an issue or contact [your-email@example.com](mailto:your-email@example.com).

---

**Built with ❤️ by the Yarn team** | Making affordable shopping accessible to everyone
