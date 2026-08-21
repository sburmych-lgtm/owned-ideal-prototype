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
| 1 | Hero autoplays a 6.8 MB video during page load; four more salon clips of 2.4–6.4 MB sit further down, all `preload="metadata"` | Very expensive first paint on mobile data, which is most of the audience |
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
any script runs. LCP is a single 90 KB WebP. The inset is a live surface — see
§3 — but its poster is the finished picture, not a placeholder.

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

## 3 · Media architecture

Video was not dropped from the design — the original *delivery* was the
problem, not the medium. The footage is re-cut, re-encoded and deferred.

### What is used

Both clips are cut from the same continuous dolly shot past the neon sign, so
the two moving surfaces on the page share one art direction. The other three
masters (`salon-1/2/3`) are watermarked promo montages with hard cuts; they
would fight a calm editorial page, so they are not used.

| | A · hero inset | B · space card 02 |
|---|---|---|
| Where | Hero, inset over the result photo | "Простір і вивіска", the section about the room |
| Breakpoints | ≥ 48 rem only | all |
| Crop | 4:3, `crop=1440:1080:240:0` of the 1920×1080 master | 3:4, `crop=810:1080:483:0` of the same master |
| Codec | VP9 / WebM, H.264 / MP4 fallback | VP9 / WebM, H.264 / MP4 fallback |
| Dimensions | 720 × 540 | 720 × 960 |
| Duration | 5.5 s, plays once then rests on its last frame | 8.0 s ping-pong loop (4.0 s forward + reverse) |
| Frame rate | 25 fps (masters are 120 fps) | 25 fps |
| Audio | none — no audio stream in the file | none |
| WebM | 313 208 B · **306 KB** | 310 743 B · **303 KB** |
| MP4 fallback | 392 596 B · 383 KB | 512 496 B · 500 KB |
| Poster | 35 004 B · **34 KB** WebP | 26 210 B · **26 KB** WebP |

Encoding is reproducible via `scripts/build-video.mjs`; the outputs are
committed so no build or deploy needs ffmpeg.

Quality was chosen by measurement, not by picking a byte target. Against a
lossless reference of the same crop, VP9 CRF 44 scores SSIM 0.975 at 306 KB
where H.264 CRF 26 scores 0.971 at 470 KB — so VP9 is primary and H.264 is
only a fallback. The ping-pong turnaround measures SSIM 0.997 between the two
frames either side of the fold, so the loop has no visible seam.

### How it loads

- The HTML contains **no `<video>` and no `<source>`** — verified, zero
  matches in the built file. There is nothing for the preload scanner to find,
  so a clip can never bid against the critical render.
- Each surface ships as a `<figure class="media">` holding only its poster.
  Script builds the `<video>` after the `load` event, inside
  `requestIdleCallback`, and only when the surface is at least 25 % on screen.
- The poster is the clip's **own first frame** — SSIM 0.985 (space) and 0.982
  (hero) between poster and frame 0 — so activation cannot shift the
  composition. The clip fades in over 400 ms purely to hide any decode delay.
- The poster `<img>` stays in normal flow and carries `width`/`height`; the
  clip is an absolutely-positioned overlay. Measured CLS from activation:
  **0.0033**.
- The poster is `loading="lazy"`, which also means the hero inset costs a
  phone nothing: it is `display:none` below 48 rem, and a lazy image in a
  hidden box is never fetched.
- Clips pause when scrolled out of view. The hero reveal plays once per visit
  and is then unobserved; scrolling back does not re-trigger it.
- `MP4` carries `+faststart`; both files are muted, `playsinline`,
  `aria-hidden` and not focusable.

### When it does not load at all

The poster is the complete, finished visual in every one of these cases — no
degraded state, no spinner, no broken frame:

- JavaScript disabled.
- `prefers-reduced-motion: reduce` — verified: zero `<video>` elements created
  and **0 KB** of video requested. A user who turns the setting on mid-visit
  gets the stills back.
- `navigator.connection.saveData`, or an `effectiveType` of `2g`/`slow-2g` —
  verified: zero `<video>` elements, **0 KB** of video.
- No `IntersectionObserver`, or `play()` rejected by autoplay policy.

The looping surface carries a visible pause/play control (keyboard reachable,
`aria-pressed`, Ukrainian label). The hero reveal needs none because it stops
by itself.

## 4 · Measurements

**These are local figures**, from Playwright against `node scripts/serve.mjs`
over loopback. They are transfer sizes, so they carry across to the deployed
build — the same server and the same files run there — but real network
conditions do not. No production LCP or Core Web Vitals figure is claimed
anywhere in this document; measure the deployed candidate separately if you
need one.

### Payload, split as it actually arrives

Wire bytes, measured through the Chrome DevTools Protocol
(`encodedDataLength`) against `node scripts/serve.mjs`, which now negotiates
brotli/gzip for HTML, CSS, JS, JSON and SVG and leaves already-compressed media
and fonts alone. Median of three runs.

| | mobile 390 px | desktop 1440 px |
|---|---|---|
| **First screen, excluding video** | **380 KB** · 19 requests | **616 KB** · 30 requests |
| Video bytes at the `load` event | **0 KB** | **0 KB** |
| Video fetched for the first screen | **0 KB** | 306 KB (hero clip, after `load`) |
| First screen as delivered | **380 KB** | 922 KB |
| Deferred video, whole page scrolled | 304 KB · 1 file | 610 KB · 2 files |
| Whole page, every section scrolled, video included | 1 049 KB | 1 551 KB |

A phone downloads **no video at all** for the first screen, and 304 KB only if
the visitor scrolls as far as the space section. The desktop hero clip is
306 KB and starts strictly after `load`.

Deferred media is listed separately above on purpose: it is not part of the
initial page weight and is not presented as if it were.

Individual text assets, raw → brotli:

| | raw | gzip | brotli |
|---|---|---|---|
| `index.html` | 114 600 B | 18 625 B | **15 382 B** |
| `css/main.css` | 37 917 B | 8 069 B | **7 822 B** |
| `css/fonts.css` | 9 439 B | 833 B | **724 B** |
| `js/app.js` | 14 196 B | 4 557 B | **4 314 B** |

Fonts stay 224 KB self-hosted across cyrillic + latin subsets, with zero
third-party requests. JavaScript is 14 KB raw / 4 KB on the wire, deferred and
non-blocking.

For contrast, the live site autoplays a 6.8 MB hero video during page load and
carries four more clips of 2.4–6.4 MB, on top of ~600 KB of JavaScript
bundles.

### Verification

Every suite re-run after the media revision:

| Suite | Result |
|---|---|
| Functional Playwright checks (desktop) | 17 / 17 |
| Media behaviour checks | 19 / 19 |
| Keyboard, focus order and broken-source checks | 10 / 10 |
| JavaScript disabled | 10/10 cases, 8/8 masters, prices, booking routes present |
| axe-core, reduced motion (no video in DOM) | **0 violations** at 1440 px and 390 px |
| axe-core, video active (2 clips + pause control) | **0 violations** at 1440 px and 390 px |
| Console and page errors | none |
| Layout shift from video activation | CLS 0.0033 |

axe-core reporting zero violations is an automated result over the rules it
covers. It is not a conformance claim, and no WCAG conformance is claimed
anywhere in this document.

## 5 · Accessibility and resilience

- Every section renders and every action works with JavaScript disabled —
  verified in a JS-off browser context (10/10 cases, 8/8 masters, prices,
  booking routes all present).
- Comparison slider is a real `<input type="range">` with an accessible name;
  arrow keys move it.
- Accordions and the mobile menu are native `<details>`; no ARIA needed to make
  them work.
- `prefers-reduced-motion` removes all three motions and the hover scale, and
  suppresses both salon clips entirely — the posters stand in as finished
  images, not as placeholders waiting for something.
- The looping clip has a keyboard-reachable pause/play control; the hero clip
  stops on its own after 5.5 s and does not restart on scroll-back.
- Clips are `aria-hidden` and removed from the tab order: they are decoration,
  and their meaning is already carried by the poster's `alt` text.
- Skip link, landmark regions, visible focus ring, ≥44 px touch targets.
- Scroll-reveal fails open: an element that a fast scroll carried past the
  viewport is revealed rather than stranded at `opacity: 0`.

## 6 · Files

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
  media/video/        two salon clips: VP9 webm + H.264 mp4 + WebP poster
scripts/
  build-site.mjs      site.json -> site/index.html   (npm run build)
  build-video.mjs     salon masters -> site/media/video  (needs ffmpeg)
  fetch-fonts.mjs     refresh site/fonts + css/fonts.css
  serve.mjs           static server, brotli/gzip for text; / = v4, /v3/ = v3
```

Editing content means editing `site/data/site.json` and running
`npm run build`. The generated `index.html` is committed so deploys need no
build step.

## 7 · Known gaps

- The booking composer has no backend. Wiring it to a real endpoint (or to the
  bookon.ua API) is the obvious next step; the submit handler is the single
  place to change.
- The contacts card links out to Google Maps instead of embedding it, to avoid
  a third-party script on every page load. An embed is a one-line change if the
  salon prefers it.
- The hero clip is desktop and tablet only, because the inset it lives in is
  `display:none` below 48 rem. On a phone the hero stays a still, deliberately:
  no available crop of this footage beats the result photograph on a 390 px
  screen, and the first screen stays cheap. Mobile still gets a full video
  moment in the space section.
- Only one of the five masters is used. `salon-1/2/3` are watermarked promo
  montages with hard cuts; re-shooting a second calm continuous take would give
  the space section a genuine second moving surface.
- `scripts/build-video.mjs` needs an ffmpeg with libvpx-vp9 and libx264, and
  the masters, neither of which is in the repository. The encoded outputs are
  committed, so this only matters if the crops change.
- No production performance numbers are recorded here. The figures in §4 are
  transfer sizes measured locally against the same server that runs in
  production; latency, LCP and Core Web Vitals are not measured and not
  claimed.
- `scripts/serve.mjs` compresses per request rather than serving pre-compressed
  files. That is fine at this traffic level; a CDN or pre-built `.br` artefacts
  would be the next step if the salon ever needs it.

## 8 · Screenshots

| | |
|---|---|
| Hero | `screenshots/redesign-v4-hero.webp` |
| Full page, desktop | `screenshots/redesign-v4-desktop.webp` |
| Full page, tablet | `screenshots/redesign-v4-tablet.jpg` |
| Full page, mobile | `screenshots/redesign-v4-mobile.jpg` |
| Masters, mobile | `screenshots/redesign-v4-mobile-masters.webp` |
| Space triptych | `screenshots/redesign-v4-space.webp` |
| Hero with the clip active | `screenshots/redesign-v4b-hero-video.webp` |
| Space card 02 playing, with its pause control | `screenshots/redesign-v4b-space-video.webp` |
| Space card 02 on mobile | `screenshots/redesign-v4b-mobile-space-video.webp` |
