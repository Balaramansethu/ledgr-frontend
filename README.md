# Ledgr Frontend

Next.js 15 (App Router) frontend for **Ledgr**, a private expense tracker.
Reproduces the Ledgr look (warm paper, terracotta, Playfair serif hero amounts)
with a web-native navigation: sidebar + header on desktop, bottom nav + add
button on mobile. Installable PWA with offline read support.

Pairs with the backend repo **ledgr-api**.

## Shared code

Domain logic shared with the backend lives in `./shared` (the `@ledgr/shared`
package), wired in as a local `file:` dependency so this repo is self-contained.
Keep `./shared` in sync with the backend copy when it changes.

## Setup

```bash
npm install
cp .env.example .env    # API_PROXY_TARGET — where /api/* proxies (default http://localhost:4000)
```

## Run

```bash
npm run dev      # http://localhost:3000
npm run build && npm start
```

The dev server proxies `/api/*` to the backend (default `http://localhost:4000`),
so the browser sees same-origin requests and the httpOnly auth cookie works.
Start the **ledgr-api** server alongside it.

## Typecheck / build

```bash
npm run typecheck
npm run build
```

## Deploy

Vercel (or any Next host). Set `API_PROXY_TARGET=https://your-api-domain` so
`/api/*` proxies to the backend and cookies stay same-origin. Alternatively host
the frontend and API behind one domain with a path rewrite.
