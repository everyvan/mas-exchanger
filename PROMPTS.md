# SingaRate - Conversation & Prompts History

This document records the user prompts and corresponding development milestones for building **SingaRate** — the Singapore Dollar (SGD) exchange rate and currency conversion application with Monetary Authority of Singapore (MAS) API Catalogue integration.

---

## Prompt 1: Initial App Creation

### User Prompt
> 1. build a singapore-based exchange rate tool that provides real-time currency conversions for the SGD against global currencies.
> 2. build just the front end for now. i will add the backend integration using MAS API keys later. use a clean UI with search, favorites and a simple calculator

### Delivered Features & Changes
- **SGD Real-Time Currency Calculator (`src/components/CurrencyCalculator.tsx`)**:
  - Bidirectional exchange rate conversions (SGD ⇄ Foreign Currencies).
  - Quick-add increments (+100, +500, +1,000, +5,000, Clear).
  - MAS benchmark quotation format display (e.g. S$ per 100 units for JPY, THB, IDR, KRW).
  - Singapore money market spread simulator (Multi-currency cards vs Money Changers vs Bank Credit Cards).
  - Multi-currency yield drawer for all starred favorites simultaneously.
- **Directory & Regional Filters (`src/components/CurrencyCard.tsx`, `src/components/RatesTable.tsx`)**:
  - Search by currency code (USD, MYR, JPY), country, or name.
  - Regional filters: ASEAN cross-border pairs, Asia-Pacific, Europe, Americas, Middle East.
  - Quoting modes: `1 SGD =`, `1 Unit = S$`, and `MAS Standard Quote`.
  - Card view and high-density financial table view.
- **Favorites System**:
  - Persistent localStorage-backed bookmarking.
- **Historical 30-Day Trend Chart Modal (`src/components/HistoricalChartModal.tsx`)**:
  - Interactive SVG line charts with 7D, 14D, and 30D views, hover crosshairs, and period statistics.
- **Singapore Cross-Border Travel Corridors (`src/components/TravelShortcuts.tsx`)**:
  - Quick presets for Causeway/Johor Bahru, Tokyo, Bangkok, Batam, US Tech, and Australia.

---

## Prompt 2: GitHub Repository Push

### User Prompt
> git push https://ghp_***@https://github.com/everyvan/mas-exchanger.git

### Delivered Features & Changes
- Initialized Git repository on `main` branch.
- Configured user credentials and staged codebase.
- Connected remote origin to `https://github.com/everyvan/mas-exchanger.git`.
- Pushed initial commit (`47159b9`) to remote GitHub repository.

---

## Prompt 3: MAS Serverless API Connection

### User Prompt
> 1. add a serveless api connection that pulls live data from MAS API catalogue using the following endpoint: 
> 
> GET https://eservices.mas.gov.sg/apimg-gw/server/monthly_statistical_bulletin_non610ora/exchange_rates_end_of_period_daily/views/exchange_rates_end_of_period_daily?end_of_day=2026-10-14
> # KeyId: <MAS_KEY_ID>
> 
> 2. store this in /api folder at the project root level not the src folder
> 
> 3. include a /health.ts and /exchangerates.ts within the same subfolder
> 
> 4. do not hardcode any API key, i will manually include them

### Delivered Features & Changes
- **`/api/health.ts`**:
  - Serverless health-check endpoint reporting status, uptime, and `MAS_KEY_ID` configuration state.
- **`/api/exchangerates.ts`**:
  - Serverless proxy endpoint querying MAS API Catalogue gateway:
    `GET https://eservices.mas.gov.sg/apimg-gw/server/monthly_statistical_bulletin_non610ora/exchange_rates_end_of_period_daily/views/exchange_rates_end_of_period_daily?end_of_day={end_of_day}`
  - Injects header: `KeyId: <MAS_KEY_ID>`.
  - Pulls `MAS_KEY_ID` securely from `process.env.MAS_KEY_ID` with zero hardcoding.
  - Safe fallback returning `{ status: "awaiting_key" }` if key is not yet set.
- **Vite Dev Integration (`vite.config.ts`)**:
  - Mounted serverless API middleware so both `/api/health` and `/api/exchangerates` work seamlessly during local development and in serverless environments.
- **Interactive UI Testing (`src/components/MasApiModal.tsx`)**:
  - Added live endpoint tester inside the "MAS API Guide" modal to test responses directly in the UI.
- Committed and pushed commit `f3a17f0` to GitHub `main` branch.

---

## Prompt 4: Documentation Export

### User Prompt
> export this chat as a .md file as a PROMPTS.md

### Action
- Generated `PROMPTS.md` containing the complete prompt sequence, architectural decisions, and repository history.
