# Bergenfox-GVC

## What to Build
A Story/ Lore building website that can animate ideas based on GVC characters. Animations can be graphic novel style or 3d animation short story style. 

## Starting Point
This project uses the **A website or landing page** pattern. Here's what Claude should build first:

Build a landing page with: hero section with gold shimmer title, about section, features grid (3 columns), CTA section, footer with social links. Use the GVC brand system throughout.

## Selected Power-ups
- **User accounts** -- sign up, log in, and protected pages
- **Sound and music** -- sound manager with mute/volume and reduced-motion awareness
- **Pop-up notifications** -- success, error, and info messages
- **NFT image loading** -- display NFT images with fallback handling
- **Save and store data** -- persistent storage for scores, votes, and settings

## GVC Brand System

### Colors
- **Gold (primary):** #FFE048
- **Black (background):** #050505
- **Dark (cards/panels):** #121212
- **Gray (borders/subtle):** #1F1F1F
- **Pink accent:** #FF6B9D
- **Orange accent:** #FF5F1F
- **Green (success):** #2EFF2E

### Typography
- **Headlines:** Brice font (display), bold/black weight -- make them feel premium
- **Body text:** Mundial font, clean and readable, generous spacing
- CSS variables: `--font-brice` for display, `--font-mundial` for body
- Tailwind: `font-display` for headlines, `font-body` for text

### Design Language
- Dark-first design (#050505 background)
- Gold accents (#FFE048) for CTAs, highlights, important elements
- Gold shimmer effect on key headlines (`.text-shimmer` class)
- Gold glow on hover for cards (`.card-glow` class)
- Floating ember particles for ambient effect (`.ember` class)
- Rounded corners (12-16px), soft shadows
- Generous whitespace -- let things breathe
- Micro-animations on hover/interaction (scale, glow, fade)
- Use Framer Motion for entry animations

### CSS Utilities
- `.text-shimmer` -- animated gold gradient text
- `.card-glow` -- gold glow box shadow with hover enhancement
- `.ember` -- floating gold particle dot
- `.rising-particle` -- gold particles that float up from the bottom
- `.font-display` -- Brice headline font
- `.font-body` -- Mundial body font
- Grid texture background and gold bottom gradient are already applied to body
- Shaka icon (/shaka.png) should wiggle on hover. It is already set as the site favicon.
- Site titles should be UPPERCASE (all caps)

## GVC API (no API key needed)
All GVC collection data is available from: https://api-hazel-pi-72.vercel.app/api
- GET /stats -- returns: { floorPrice, floorPriceUsd, volume24h, volume24hUsd, numOwners, totalSales, avgPrice, marketCap, marketCapUsd, totalVolume, totalVolumeUsd }
- GET /sales?limit=10 -- returns: [{ txHash, priceEth, priceUsd, paymentSymbol, imageUrl, timestamp }]
- GET /sales/history?limit=100 -- same shape as /sales, max 1000
- GET /activity -- 30-day buys/sells, accumulator leaderboard
- GET /vibestr -- VIBESTR token data
- GET /vibestr/history -- daily VIBESTR price snapshots
- GET /market-depth -- bid/offer depth, floor price, lowest listing
- GET /traders -- 30-day trade stats
- GET /wallet/[address] -- ENS name, Twitter handle for a wallet
- GET /mentions -- recent X/Twitter mentions
Do NOT use the OpenSea API directly. Use the GVC API above instead.

## Contracts & Tokens (only use these)
- **GVC NFT:** 0xB8Ea78fcaCEf50d41375E44E6814ebbA36Bb33c4 (ERC-721, 6969 tokens)
- **HighKey Moments:** 0x74fcb6eb2a2d02207b36e804d800687ce78d210c (ERC-1155)
- **VIBESTR Token:** 0xd0cC2b0eFb168bFe1f94a948D8df70FA10257196 (ERC-20, 18 decimals)
- **ETH** is the base currency for all GVC transactions
- ETH price: https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd
- VIBESTR price: https://api.dexscreener.com/latest/dex/tokens/0xd0cC2b0eFb168bFe1f94a948D8df70FA10257196
- Public RPC: https://ethereum-rpc.publicnode.com
Do NOT reference any other NFT collections, tokens, or contracts. This project is only about GVC.

## Code Patterns

### User Accounts Pattern

Username + password auth with bcrypt + iron-session cookies. No external services, works anywhere Postgres is wired.

Install:

```bash
npm install bcryptjs iron-session
npm install -D @types/bcryptjs
```

#### Schema

```sql
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_users_username_lower ON users (LOWER(username));
```

#### Session config (`lib/session.ts`)

```ts
import type { SessionOptions } from "iron-session";
export interface Session { userId?: string; username?: string; }
export const sessionOptions: SessionOptions = {
  password: process.env.SESSION_SECRET!,  // 32+ chars; set in Vercel env
  cookieName: "gvc_session",
  cookieOptions: { secure: process.env.NODE_ENV === "production", httpOnly: true, sameSite: "lax" },
};
```

#### `POST /api/auth/register`

```ts
const { username, password } = await req.json();
if (!/^[a-zA-Z0-9_]{3,20}$/.test(username)) return NextResponse.json({ error: "Invalid username" }, { status: 400 });
if (password.length < 8) return NextResponse.json({ error: "Password must be 8+ chars" }, { status: 400 });
const hash = await bcrypt.hash(password, 10);
try {
  const { rows } = await pool.query(
    "INSERT INTO users (username, password_hash) VALUES ($1, $2) RETURNING id, username",
    [username, hash]
  );
  const session = await getIronSession<Session>(cookies(), sessionOptions);
  session.userId = rows[0].id; session.username = rows[0].username;
  await session.save();
  return NextResponse.json({ username: rows[0].username });
} catch (e: any) {
  if (e.code === "23505") return NextResponse.json({ error: "Username taken" }, { status: 409 });
  throw e;
}
```

#### `POST /api/auth/login`

Look up by `LOWER(username) = LOWER($1)`, `bcrypt.compare`, set session on success.

#### `GET /api/auth/session`

Returns `{ userId, username }` or `{}` for anonymous.

#### `POST /api/auth/logout`

`session.destroy()` + empty JSON.

#### Rate limits

`/register` and `/login` rate-limit by IP (5/min) to stop brute-force. Reuse the `submission_rate_log` pattern from prompt submissions.

#### Protect API routes

```ts
const session = await getIronSession<Session>(cookies(), sessionOptions);
if (!session.userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
```

Don't allow username changes without a fresh password confirmation.

### Sound & Music Pattern

A minimal sound manager with mute + volume persistence and reduced-motion awareness.

Install:

```bash
npm install howler @types/howler
```

Place your files at `public/sounds/*.mp3`.

**`lib/sounds.ts`**

```ts
import { Howl } from "howler";

const catalog = {
  pop: () => new Howl({ src: ["/sounds/pop.mp3"], volume: 0.5 }),
  win: () => new Howl({ src: ["/sounds/win.mp3"], volume: 0.7 }),
  lose: () => new Howl({ src: ["/sounds/lose.mp3"], volume: 0.6 }),
} as const;
export type SoundName = keyof typeof catalog;

const cache = new Map<SoundName, Howl>();
function get(name: SoundName) {
  if (!cache.has(name)) cache.set(name, catalog[name]());
  return cache.get(name)!;
}

let muted = typeof window !== "undefined" && localStorage.getItem("sound-muted") === "1";
let volume = typeof window !== "undefined" ? Number(localStorage.getItem("sound-volume") ?? 1) : 1;

export function play(name: SoundName) {
  if (muted) return;
  const s = get(name);
  s.volume(volume);
  s.play();
}
export function setMuted(v: boolean) { muted = v; localStorage.setItem("sound-muted", v ? "1" : "0"); }
export function setVolume(v: number) { volume = Math.max(0, Math.min(1, v)); localStorage.setItem("sound-volume", String(volume)); }
export function isMuted() { return muted; }
export function preloadAll() { (Object.keys(catalog) as SoundName[]).forEach(get); }
```

**Usage** — call `preloadAll()` on game mount, then `play("pop")` on events. A mute toggle in the game header reads `isMuted()` / `setMuted()`.

**Respect `prefers-reduced-motion`** — don't auto-start looping background music if the OS-level preference is enabled. Gate BGM behind an explicit opt-in.

### Toast Notifications
Use **react-hot-toast** for feedback messages. Install with:
```bash
npm install react-hot-toast
```
Add `<Toaster position="bottom-center" />` in your layout, then call `toast.success("Saved!")` anywhere.

### NFT Image with IPFS Fallback

```tsx
export function NftImage({ tokenId, className }: { tokenId: number; className?: string }) {
  const gateways = [
    `https://ipfs.io/ipfs/`,
    `https://cloudflare-ipfs.com/ipfs/`,
    `https://gateway.pinata.cloud/ipfs/`,
  ];
  // Fetch metadata from OpenSea, extract image URL, try gateways in order
  // Replace ipfs:// prefix with gateway URL, use <img> with onError fallback
  return <img src={src} alt={`GVC #${tokenId}`} className={className} onError={handleFallback} />;
}
```

## Example Prompts to Try
- "Add a team member grid with photos and role titles"
- "Create a timeline section showing GVC milestones"
- "Add a newsletter signup form at the bottom"
- "Set up lib/sounds.ts with a Howler manager and a mute toggle in the header"
- "Add username/password auth with iron-session cookies and rate-limited /register and /login routes"
- "Make everything responsive and look great on mobile"
- "Add smooth page transitions with Framer Motion"

## Token Metadata (`public/gvc-metadata.json`)

Complete metadata for all 6,969 GVC tokens. Keyed by token ID (0-6968).

```ts
const metadata = await fetch('/gvc-metadata.json').then(r => r.json());

const token = metadata["142"];
// token.name    -> "Citizen of Vibetown #142"
// token.traits  -> { Type: "Robot", Face: "Laser Eyes", Hair: "Mohawk Gold", Body: "Hoodie Black", Background: "BG Mint" }
// token.image   -> "ipfs://QmY6JpwTYx6zZHgfJb3gPJRh1U897NX4RudtK5jhJ3sNDS/142.jpg"

// Trait types: Type, Face, Hair, Body, Background
// To display image: replace "ipfs://" with "https://ipfs.io/ipfs/"
```

Use cases: rarity checker, token lookup, trait filtering, collection search, trait-based galleries.

## Assets
- Fonts: /public/fonts/ (Brice for headlines, Mundial for body)
- Shaka icon: /public/shaka.png
- GVC logotype: /public/gvc-logotype.svg
- Background grid: /public/grid.svg (already applied via body::before in globals.css — do NOT add background-size or opacity overrides on top; the SVG ships with its own 10% white stroke, and extra opacity stacks to invisible)
- Token metadata: /public/gvc-metadata.json (all 6,969 tokens with traits + images)

## Brand Asset Library
Official GVC brand images (backgrounds, GIFs, characters, scenes, T-poses) hosted and available via API.
- Browse gallery: https://goodvibesclub.ai/library
- API: GET https://goodvibesclub.ai/api/brand (returns all assets)
- Filter by category: GET https://goodvibesclub.ai/api/brand?category=backgrounds
- Response shape: { assets: [{ id, filename, image_url, category }], categories: [...] }
- Use image_url values directly as src in <img> or next/image components

## Tech Stack
- Next.js (App Router), React, TypeScript, Tailwind CSS, Framer Motion

## Important: Dev Server
The dev server is already running (the user started it before opening Claude Code). Do NOT run `npm run dev` -just edit the files and the browser will hot-reload automatically. If you need to install a new package, use `npm install <package>` and the dev server will pick it up.

## Project Structure
app/ -> Pages and layouts
components/ -> Reusable UI components
public/ -> Static assets
CLAUDE.md -> This file
README.md -> Human-readable docs
