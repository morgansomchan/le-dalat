@AGENTS.md
# Le Dalat — Public Website (le-dalat-web)

## What this project is
The public website for Le Dalat, a Vietnamese fine dining restaurant in Bangkok (Sukhumvit Soi 23, est. 1983, family run, wooden villa behind green gates). This app is the guest-facing site: story homepage, menu page, reservation flow, contact. A separate app (le-dalat-dashboard, not yet created) will be the staff dashboard. They will share one Supabase backend.

Read `../docs/design-brief.md` and `../docs/project-context.md` before doing any design or layout work.

## Current phase: HOMEPAGE PROTOTYPE ONLY
We are in the design/prototype phase. Right now this project builds the homepage as a static, scrollable prototype.

**Do NOT build yet (hard rule):**
- No booking logic, no availability logic, no forms that submit anywhere
- No Supabase clients, no env files, no schema, no auth. Supabase packages are installed but intentionally dormant until instructed.
- No dashboard code of any kind
- No email sending (resend is installed but dormant)

**Do build:**
- The homepage scroll narrative (6 scenes, see design brief)
- Scene 1 (Arrival) and Scene 3 (The house remembers / timeline) FIRST — they set the design language
- GSAP + Lenis scroll experience, mobile first
- The reservation widget in the finale is visual only for now; its button can link to `/reservation` with query params (`?date=...&guests=...`) but `/reservation` can be a stub page

## Stack
- Next.js (App Router, TypeScript, Tailwind), deployed to Vercel eventually
- Fonts via next/font/google: an elegant high-contrast serif for headlines (Fraunces or Cormorant Garamond), quiet sans for UI/body
- Animation: gsap (ScrollTrigger) + lenis smooth scroll

## Design system (summary — full detail in ../docs/design-brief.md)
- The page travels from deep navy (act one: arrival, threshold) through a gradient melt into dark warm brown (act two: dishes, people, finale)
- Core tokens: medallion navy #16335C, dark navy surface base #060E1C, imperial jade #2C8F5C (sparing), aged gold #C8A86B (details only, never large fills), terracotta clay #B5542F, teak #6B4A2E, parchment light surfaces (warm cream, never pure white)
- Logo SVG ground-truth colors: #2E2F86, #00377B, #F7BC60. Never recolor the logo medallion.
- Voice: short declarative sentence + one poetic twist, often italic in an accent color. Reference lines: "Madame Hoa Ly set a table in 1983. It has never been cleared." / "Three generations will say good evening." / "Your table is already lit."
- Eyebrows: roman numeral + letterspaced uppercase label, gold (e.g. "II · THE HOUSE REMEMBERS")
- Scenes 1 and 2 are single full-viewport images with minimal text. Layout complexity begins at scene 3.
- No template energy. No bouncy motion. Slow, weighted, unhurried scroll reveals.

## Content rules
- ALL story content (names, dates, dish stories, staff role labels) is PLACEHOLDER until family approval. Mark placeholders visibly in code comments.
- English only. No language switcher.
- Real text in the page for SEO — never bake copy into images.
- Images: treat every image slot as swappable; photos are cast from a photo bank later.