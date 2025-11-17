<!-- GitHub Copilot instructions for AI coding agents -->

# Copilot Instructions — NEGORA (price-comparison)

These notes help an AI coding agent be immediately productive in this repository.

**Big Picture**
- **Purpose:** Real-time price comparison across multiple verticals (ECOMMERCE, FLIGHT, HOTEL). See `README.md` for features and test data.
- **High-level flow:** user query -> `app/api/search` (classifies vertical via `nlp/classifier.ts`) -> scraping modules in `scrapers/` produce `ScrapedResult` -> engines in `engine/` (`offerEngine.ts`, `priceCompare.ts`) compute final prices and best deals -> UI pages in `app/` render results and call `app/api/*` routes.

**Key files & directories** (reference these when making changes)
- `app/` — Next.js App Router routes and client pages (UI, forms, tracking). Example: `app/page.tsx` (client search UI).
- `app/api/*/route.ts` — server route handlers (API surface). Use these for backend entry points.
- `scrapers/` — site-specific scrapers (e.g., `scrapers/ecommerce/amazon.ts`, `flipkart.ts`) and `scrapers/base.ts` with Playwright/cheerio patterns.
- `engine/offerEngine.ts` — offer extraction + final-price calculation. Note the simplified logic: highest single offer is applied.
- `engine/priceCompare.ts` — sorts and selects best deal by `finalPrice` and computes stats.
- `nlp/classifier.ts` — lightweight keyword classifier that detects verticals and extracts simple params.
- `lib/supabase.ts` — Supabase client. Reads `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` from env.
- `database/*.sql` — canonical schema and bulk test data (run `schema.sql` in Supabase SQL editor).
- `types/` — TypeScript shapes used across scrapers, engines, and API responses.

**Project-specific conventions & patterns**
- TypeScript + Next 16 App Router; UI files in `app/` often use `'use client'` and call `/api/*` with `fetch`.
- Server logic lives in `app/api/*/route.ts` (Next route handlers). Avoid moving server logic into `pages/api`.
- Scrapers return `ScrapedResult` objects (see `types`) and must include `finalPrice` for downstream sorting.
- Offer objects use a numeric `value` property; `OfferEngine.calculateFinalPrice` expects that.
- `nlp/classifier.ts` favors simple keyword matching — do not assume complex NER or date parsing beyond the functions there.
- The codebase applies ONE best offer by default (see `offerEngine.calculateFinalPrice`). If you change this policy, update `engine/priceCompare.ts` and UI text accordingly.

**Build / Run / Debug**
- Install: `npm install` (project uses Node >= 20.9.0 per `README.md`).
- Dev: `npm run dev` — launches Next dev server on `http://localhost:3000`.
- Build: `npm run build` and `npm run start` for production.
- Lint: `npm run lint`.
- DB: Run `database/schema.sql` and the provided insert data on Supabase. The repo expects Supabase credentials in `.env.local` (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`).

**External integrations & runtime notes**
- Supabase: `lib/supabase.ts` creates the client from env vars. Many API routes query Supabase — ensure keys have correct permissions.
- Scraping: Playwright, `cheerio`, and `jsdom` are used (note `next.config.ts` lists `serverExternalPackages: ['cheerio', 'jsdom']`). Tests that touch scrapers may require headless browser dependencies.

**Testing & common troubleshooting**
- A sample test user exists in `README.md` (`User ID for Testing: 1`). Use this when exercising offers and cards.
- If API returns empty results: verify Supabase data (`SELECT COUNT(*) FROM Products;`, `Offers`) and `.env.local` credentials.

**When editing or adding features**
- Update `types/` whenever response shapes change (search responses, offers, scraped results).
- If you change offer-application logic, update both `engine/offerEngine.ts` and `engine/priceCompare.ts` and adjust UI in `app/` that shows savings and breakdowns.
- Preserve `nlp/classifier.ts` backward compatibility: clients expect `vertical` and `extractedParams` shape.

If anything is unclear or you'd like more examples (e.g., a detailed walkthrough of a specific API route or scraper), tell me which area and I'll expand the instructions.
