# PartyGrid

Oceania-friendly gamer profiles, LFG, clip shares, squads and server-side badges.

**Find a party. Show your skill.** Discord stays the chat — PartyGrid is the lobby.

Dogfood audience: Sleep Twinz (AU YouTube gaming) / Oceania. UI copy uses Australian English where it matters. Default region is Oceania; clocks display in `Australia/Melbourne`.

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

Seeded demo accounts (password `partygrid`):

- `ash@partygrid.local`
- `kiwi@partygrid.local`
- `twinz@partygrid.local`

## What is implemented

| Feature | Status |
| --- | --- |
| Email signup / sign-in + session-gated writes | Implemented |
| 13+ age gate (signup + OAuth onboarding) + ToS / age pages | Implemented |
| Gamer profile (name, avatar URL, bio, region, timezone, game tags + curated autocomplete) | Implemented |
| Linked accounts: Discord OAuth, Steam OpenID / URL, manual Xbox/PSN/Riot/Epic | Implemented (OAuth needs keys) |
| Verified vs claimed badges | Implemented |
| LFG CRUD, 2–24h expiry, filters, expired hidden by default | Implemented |
| Clips (YouTube / Twitch / TikTok URL), profile + discover | Implemented |
| Squads: create/join/leave, members, Discord link, member feed | Implemented |
| Achievements (server-side unlocks) | Implemented |
| Home feed: active LFG + newest clips | Implemented |
| Report + block | Implemented |

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
- **On the Grid** — 7-day Melbourne activity streak

## Postgres swap (production)

1. Change `provider = "sqlite"` to `provider = "postgresql"` in `prisma/schema.prisma`.
2. Set `DATABASE_URL` to your Postgres URL (Neon, Supabase, Vercel Postgres).
3. Run `npx prisma migrate deploy` (or `migrate dev` locally against Postgres).

SQLite is for local/dev. Vercel’s filesystem is ephemeral — do not use the SQLite file in production.

## Deploy on Vercel

1. Import the GitHub repo.
2. Set env vars from `.env.example` (`AUTH_SECRET`, `AUTH_URL` = your production URL, `DATABASE_URL` for Postgres, optional OAuth keys).
3. Build command can stay `prisma generate && next build` (see `package.json`). Run `prisma migrate deploy` as a release / build step once Postgres is wired.
4. Add the same OAuth redirect URLs for the production domain.

## Scripts

- `npm run dev` — Next.js dev server
- `npm run build` / `npm start`
- `npm run db:migrate` — Prisma migrate
- `npm run db:seed` — demo LFG, clips, squad
