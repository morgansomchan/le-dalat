# Le Dalat — Public Website (le-dalat-web)

## What this project is
The public website for Le Dalat, a Vietnamese fine dining restaurant in Bangkok
(Sukhumvit Soi 23, est. 1983, family run, wooden villa behind green gates). This app
is the guest-facing site: story homepage, menu, and a working reservation flow.

A separate staff dashboard app (`le-dalat-dashboard`) is **planned but does not exist
yet**. It will share this Supabase backend when it is built.

## Current phase: LIVE IN PRODUCTION
This is no longer a prototype. Real guests book real tables through it.

- `www.ledalat.com` is canonical. `ledalat.com` and both `ledalatbkk.com` spellings
  redirect there (308, path-preserving — see `next.config.ts`).
- Hosted on Vercel, auto-deploying from `main`. A push to `main` ships to the public.
- Treat the reservation flow as load-bearing: a broken `/reservation` is lost covers.

## The reservation engine lives in Supabase, NOT in this repo
This is the single most important thing to know before debugging a booking problem.

The booking logic is Postgres functions behind these anon-callable RPCs, reached only
through `lib/reserve-engine.ts`:

| RPC | Purpose |
| --- | --- |
| `list_service_slots` | THE slot lists, derived from the `service_windows` setting |
| `check_availability` | can this party sit at this date/time; returns assigned tables |
| `create_reservation` | the atomic write; refuses rather than double-book |
| `get_reservation_by_token` | the guest's own booking, by manage token |
| `cancel_reservation_by_token` | the guest releases the table |

Consequences:
- **Availability, table assignment and turn times are not debuggable from this repo.**
  Changes to that SQL are not in git history. If bookings misbehave, probe the RPCs
  directly before reading TypeScript.
- The anon/publishable key holds **no table permissions** — direct REST reads of
  `reservations`, `tables`, `settings` all return 401. Verified. Keep it that way.
- `lib/reserve-mock.ts` is not dead code: its hardcoded slot lists and the house phone
  number are the offline fallback when the engine cannot be reached.

## Environment variables
Set in Vercel, not committed. `NEXT_PUBLIC_*` are inlined at **build** time, so
changing one requires a fresh build — saving it alone changes nothing.

| Variable | Scope | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | public | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | public | anon/publishable key (`ANON_KEY` also accepted) |
| `RESEND_API_KEY` | **secret, server only** | confirmation letters; never `NEXT_PUBLIC_` |
| `RESEND_FROM` | server | sender, e.g. `Le Dalat <reservations@ledalat.com>` |
| `NEXT_PUBLIC_SITE_URL` | public | absolute base for links in email; defaults to `https://www.ledalat.com` |

**Never construct a client at module scope from an env var.** Doing so once took the
whole `/reservation` route down with a 500 before anything rendered, because a missing
key threw during module evaluation. Both `lib/reserve-engine.ts` and the confirm route
build lazily on first use. Keep that pattern.

## Stack
- Next.js 16 (App Router, TypeScript, Turbopack), React 19, Tailwind v4
- Fonts via `next/font/google`: Fraunces / Cormorant Garamond serif, Jost sans
- Animation: GSAP (ScrollTrigger) + Lenis smooth scroll
- Supabase (`@supabase/supabase-js`) for the engine; Resend for guest email

## Layout
```
app/
  page.tsx                        homepage — six scrolling scenes
  menu/page.tsx
  reservation/page.tsx            the flow (accepts ?date= & ?guests=)
  reservation/[token]/page.tsx    the guest's own booking, by manage token
  reserve/page.tsx                legacy path → redirects to /reservation
  api/reservation/confirm/        server-only: sends the confirmation letter
components/home/                  the six scenes + site header
components/reserve/               ReserveFlow (the whole journey), ManageReservation
lib/reserve-engine.ts             the ONLY data access; every RPC call lives here
lib/reserve-mock.ts               slot/phone fallbacks + date & number prose helpers
```

## Design system (summary — full detail in ../docs/design-brief.md)
- The page travels from deep navy (act one: arrival, threshold) through a gradient melt
  into dark warm brown (act two: dishes, people, finale)
- Core tokens: medallion navy `#16335C`, dark navy surface `#060E1C`, imperial jade
  `#2C8F5C` (sparing), aged gold `#C8A86B` (details only, never large fills), terracotta
  clay `#B5542F`, teak `#6B4A2E`, parchment light surfaces (warm cream, never pure white)
- Logo SVG ground-truth colors: `#2E2F86`, `#00377B`, `#F7BC60`. **Never recolor the
  medallion.** Assets: `LD-logo.svg`, `LD-logo-crop.svg` (square, for UI),
  `LD-logo-email.png` (256px transparent, for email and the favicon)
- Voice: short declarative sentence + one poetic twist, often italic in an accent color.
  Reference lines: "Madame Hoa Ly set a table in 1983. It has never been cleared." /
  "Three generations will say good evening." / "Your table is already lit."
- Eyebrows: roman numeral + letterspaced uppercase label, gold ("II · THE HOUSE REMEMBERS")
- Commit messages follow the same voice — a declarative line about what the house now does.
- No template energy. No bouncy motion. Slow, weighted, unhurried scroll reveals.

## Content rules
- ALL story content (names, dates, dish stories, staff role labels) is PLACEHOLDER until
  family approval. Mark placeholders visibly in code comments.
- The house line `+66 2 259 9593` and the service hours ARE confirmed — do not treat
  those as placeholder. Bookable windows end at 13:30 and 21:30.
- English only. No language switcher.
- Real text in the page for SEO — never bake copy into images.
- Images: treat every image slot as swappable; photos are cast from a photo bank later.

## Known gaps
- No staff dashboard, so a booking can only be managed by the guest's own token link.
- `get_reservation_by_token` does not return the guest's email, so the confirm route
  takes the address from the caller and verifies the token names a real booking before
  sending. If the RPC ever returns the address, stop trusting the caller.
- The done screen shows `LD-####` derived from the reservation id, while the manage page
  and the letter show the engine's own `reference`. These can differ; the engine's is
  authoritative.
