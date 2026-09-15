# SquadStack

Find your squad. Prove you play. Keep the party together — without replacing Discord.

Gamer profiles, LFG, clip shares, squads and server-side badges. Discord stays the chat; SquadStack is the lobby.

The GitHub repo may still be named `partygrid`. The product name is **SquadStack**.

## Stack

- Next.js (App Router) + TypeScript + Tailwind CSS
- Auth.js / NextAuth — email + password, plus Google and Discord when env vars are set
- SQLite via Prisma for clone-and-run (swap to Postgres for production)

## Run locally

```bash
cp .env.example .env
# set AUTH_SECRET / NEXTAUTH_SECRET (openssl rand -base64 32)
npm install
npx prisma migrate dev
npx prisma db seed
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Seeded demo accounts (password `squadstack`):

- `ash@squadstack.local` — Americas
- `riko@squadstack.local` — Asia
- `nia@squadstack.local` — Europe

## What is implemented

| Feature | Status |
| --- | --- |
| Email signup / sign-in + session-gated writes | Implemented |
| 13+ age gate (signup + OAuth onboarding) + ToS / age pages | Implemented |
| Gamer profile (name, avatar URL, bio, optional region/timezone, game tags + curated autocomplete) | Implemented |
| Linked accounts: Discord OAuth, Steam OpenID / URL, manual Xbox/PSN/Riot/Epic | Implemented (OAuth needs keys) |
| Verified vs claimed badges | Implemented |
| LFG CRUD, 2–24h expiry, filters, expired hidden by default | Implemented |
| Clips (YouTube / Twitch / TikTok URL), profile + discover | Implemented |
| Squads: create/join/leave, members, Discord link, member feed | Implemented |
| Achievements (server-side unlocks) | Implemented |
| Home feed: active LFG + newest clips | Implemented |
| Report + block | Implemented |

Region is optional on profiles (Americas, Europe, Asia, Oceania, Africa, Global). LFG posts still carry a region for filtering. Timezone is optional; timestamps fall back to UTC.

## Stubbed / needs keys

Leave Google, Discord and Steam vars empty and the app still runs.

- **Google sign-in** — shown only when `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are set. Redirect: `{AUTH_URL}/api/auth/callback/google`.
- **Discord sign-in** — Auth.js Discord provider when `DISCORD_CLIENT_ID` / `DISCORD_CLIENT_SECRET` are set. Redirect: `{AUTH_URL}/api/auth/callback/discord`.
- **Discord link-while-signed-in** — `{AUTH_URL}/api/discord/callback`. UI stays visible if keys are missing; users can claim a tag (unverified).
- **Steam** — OpenID at `/api/steam` verifies SteamID without a key. `STEAM_API_KEY` adds persona lookup and can verify a pasted profile URL. Otherwise URL/handle is **claimed**.

Xbox, PSN, Riot and Epic are **claimed** only in v1. No card collecting, game APIs, chat/DMs, voice, For You algo, streaming, native apps or payments.

## Achievements

Unlocked on the server after writes (not OAuth-only):

- **Linked Up** — any linked account
- **Party Starter** — first LFG
- **Clipped** — first clip
- **Squad Up** — create or join a squad
- **Highlight Reel** — 10 clips
- **Matchmaker** — 10 LFG posts
- **On the Stack** — 7-day activity streak (UTC calendar days)

## Postgres swap (production)

1. Change `provider = "sqlite"` to `provider = "postgresql"` in `prisma/schema.prisma`.
2. Set `DATABASE_URL` to your Postgres URL (Neon, Supabase, Vercel Postgres).
3. Run `npx prisma migrate deploy` (or `migrate dev` locally against Postgres).

SQLite is for local/dev. Vercel’s filesystem is ephemeral — do not use the SQLite file in production.

## Deploy on Vercel

`npm run build` (`scripts/build.mjs`) keeps **SQLite** when `DATABASE_URL` starts with `file:`. If `DATABASE_URL` is a `postgres://` / `postgresql://` URL, the script flips Prisma to `postgresql`, runs `prisma db push`, then `next build`.

### Required env vars

| Name | Notes |
| --- | --- |
| `DATABASE_URL` | **Postgres** connection string (Neon, Supabase, or Vercel Postgres). Do not use the local `file:./dev.db` URL on Vercel. |
| `AUTH_SECRET` | `openssl rand -base64 32` |
| `NEXTAUTH_SECRET` | Same value as `AUTH_SECRET` |
| `AUTH_URL` | Production origin, e.g. `https://your-app.vercel.app` |
| `NEXTAUTH_URL` | Same as `AUTH_URL` |

### Optional env vars

| Name | Notes |
| --- | --- |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Google sign-in. Redirect `{AUTH_URL}/api/auth/callback/google` |
| `DISCORD_CLIENT_ID` / `DISCORD_CLIENT_SECRET` | Discord sign-in + link. Redirects `{AUTH_URL}/api/auth/callback/discord` and `{AUTH_URL}/api/discord/callback` |
| `STEAM_API_KEY` | Persona lookup + URL claim verification |
| `STEAM_REALM` | Defaults to `AUTH_URL` |

After the first deploy, add those OAuth redirect URLs for the Vercel domain. Run `npx prisma db seed` against production only if you want demo posts.

## Scripts

- `npm run dev` — Next.js dev server
- `npm run build` / `npm start`
- `npm run db:migrate` — Prisma migrate
- `npm run db:seed` — demo LFG, clips, squad
