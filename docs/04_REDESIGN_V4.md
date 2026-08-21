# 04 · Redesign v4 — OWNED marketing site

Redesign of the live OWNED site
(`owned-final-qwen-recovery-production.up.railway.app`), rebuilt as a static
site under `site/`. Content is the salon's own — every price, master, case,
review and contact detail was carried across unchanged; nothing about the
business was invented for this pass.

Serving: `node scripts/serve.mjs` puts the redesign at `/` and keeps the
previous v3 prototype at `/v3/`.

---

## 1 · What the audit found

| # | Problem on the live site | Effect |
|---|---|---|
| 1 | Hero is an autoplaying 6.8 MB video; three more salon videos of ~6 MB each sit further down | Very expensive first paint on mobile data, which is most of the audience |
| 2 | Hero headline, section copy and reveal states are painted by client JS (~600 KB of bundles) | Nothing readable before hydration; a slow connection sees an empty dark screen |
| 3 | Two competing header CTAs ("Консультація 0 ₴" and "Запис") | Splits the one action that matters |
| 4 | Body/caption type down to 12–13 px, eyebrows at 11 px | Hard work for a client base that skews 30+ |
| 5 | Price catalogue behind four tabs; three of four categories never render server-side | The most-asked question — "скільки це коштує" — is three interactions deep |
| 6 | Masters in a dark horizontal carousel; five of eight off-screen | The team is the product; most of it is hidden |
| 7 | Six Google reviews duplicated into a twelve-card marquee | Reads as padding, weakens real social proof |
| 8 | Contact block ends in an empty map container | Dead space where the address should land |
| 9 | Booking exists only as an outbound link to bookon.ua | No on-page path for someone who is not ready to pick a slot |

## 2 · What the redesign does

**Information architecture.** Ten sections in one narrative order: hero →
proof → expertise → results → price → masters → space → recognition and
reviews → founder → booking → contacts. Each answers the next question a
client actually asks.

**Hero.** Leads with the work rather than the room: a full-height result
photograph with the salon interior inset over it. Headline, lead, both CTAs
and the opening hours are in the HTML, so the first screen is complete before
any script runs. LCP is a single 90 KB WebP.

**Results.** The centrepiece. A large before/after comparison driven by a range
input — draggable anywhere on the image, keyboard-operable, announced to
assistive tech — plus category filters and a thumbnail rail over all ten cases.
With JS off it degrades to all ten cases as a readable list.

**Price.** Native `<details>` per category, first one open, mono figures right
aligned with duration underneath. Deposits and the 24-hour cancellation rule
sit beside the table instead of in a footnote.

**Masters.** A real grid — two up on a phone, four up on desktop — with
portrait, years, specialisms and a `<details>` dossier. Nobody is hidden behind
a scroll affordance.

**Booking.** Three explicit routes (online, phone, Direct) plus a helper that
composes a ready-to-send message from name / service / preferred time. The
composer runs entirely in the browser and sends nothing anywhere; there is no
backend and the copy says so.

**Type and colour.** The tokens from `03_DESIGN_SYSTEM.md` — Prata, Manrope,
IBM Plex Mono, ink / moss / bone / paper with the neon used only as light on
dark. Minimum body size raised to 16 px, captions to 14 px, eyebrows to
12.5 px, and every text pair verified against its own background.

## 3 · Measurements

Taken with Playwright against the built site.

| | Redesign |
|---|---|
| First load, mobile 390 px | **515 KB** across 19 requests |
| First load, desktop 1440 px | **754 KB** across 29 requests |
| JavaScript | **9 KB**, deferred, non-blocking |
| Fonts | 224 KB self-hosted, cyrillic + latin subsets only, zero third-party requests |
| LCP (local) | ~230 ms |
| axe-core (wcag2a/aa, wcag21a/aa, best-practice) | **0 violations** at 1440 px and 390 px |

For contrast: the live site's hero video alone is 6.8 MB, and the three space
videos add ~6 MB each on top of ~600 KB of JavaScript bundles.

## 4 · Accessibility and resilience

- Every section renders and every action works with JavaScript disabled —
  verified in a JS-off browser context (10/10 cases, 8/8 masters, prices,
  booking routes all present).
- Comparison slider is a real `<input type="range">` with an accessible name;
  arrow keys move it.
- Accordions and the mobile menu are native `<details>`; no ARIA needed to make
  them work.
- `prefers-reduced-motion` removes all three motions and the hover scale.
- Skip link, landmark regions, visible focus ring, ≥44 px touch targets.
- Scroll-reveal fails open: an element that a fast scroll carried past the
  viewport is revealed rather than stranded at `opacity: 0`.

## 5 · Files

```
site/
  index.html          generated — do not hand-edit
  data/site.json      all copy, prices, masters, cases, reviews
  css/fonts.css       self-hosted @font-face (generated)
  css/main.css        tokens, primitives, components
  css/motion.css      three motions + reduced-motion
  js/app.js           progressive enhancement only
  fonts/              woff2 subsets
  media/              WebP derivatives at 1x/2x
scripts/
  build-site.mjs      site.json -> site/index.html   (npm run build)
  fetch-fonts.mjs     refresh site/fonts + css/fonts.css
  serve.mjs           static server; / = v4, /v3/ = previous prototype
```

Editing content means editing `site/data/site.json` and running
`npm run build`. The generated `index.html` is committed so deploys need no
build step.

## 6 · Known gaps

- The booking composer has no backend. Wiring it to a real endpoint (or to the
  bookon.ua API) is the obvious next step; the submit handler is the single
  place to change.
- The contacts card links out to Google Maps instead of embedding it, to avoid
  a third-party script on every page load. An embed is a one-line change if the
  salon prefers it.
- The salon's video footage is not used. If it should return, load it on
  interaction behind the existing poster stills rather than on autoplay.

## 7 · Screenshots

| | |
|---|---|
| Hero | `screenshots/redesign-v4-hero.webp` |
| Full page, desktop | `screenshots/redesign-v4-desktop.webp` |
| Full page, tablet | `screenshots/redesign-v4-tablet.jpg` |
| Full page, mobile | `screenshots/redesign-v4-mobile.jpg` |
| Masters, mobile | `screenshots/redesign-v4-mobile-masters.webp` |
| Space triptych | `screenshots/redesign-v4-space.webp` |
