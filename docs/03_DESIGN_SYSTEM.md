# 03 · Design System — OWNED Ideal Prototype

Джерела: Opus 02 + живий рендер + frontend-design skill.  
Принцип: **акцент OWNED — світло, не заливка.**

---

## 1. Brand thesis

High-fashion editorial × real hair craft × measurable proof × calm booking.  
Не spa-terracotta template. Не purple SaaS. Не broadsheet.

**Signature:** Neon Reveal — монограма / wordmark лінія загоряється на dark.

---

## 2. Color tokens

```css
:root {
  --ink: #16181A;
  --ink-2: #1E2124;
  --moss: #414A38;
  --moss-dk: #333B2C;
  --bone: #E9E8E0;
  --paper: #F6F5F1;

  --tx-hi: #16181A;
  --tx-lo: #4F5449;
  --tx-inv: #F2F1EC;
  --tx-inv-lo: #B9BAB2;

  --neon: #F4C46A;       /* тільки на dark */
  --neon-glow: #F4C46A33;

  --line: #16181A1F;
  --line-inv: #F2F1EC1F;
  --focus: #7A8F5C;
}
```

### Rules
- `--neon` never as large fill; never on `--bone`/`--paper` text.  
- Eyebrows on light = `--moss`.  
- Primary button fill = `--moss` or `--ink`.  
- Sections alternate ink ↔ bone ↔ paper for rhythm.

---

## 3. Typography

| Role | Face | Notes |
|------|------|-------|
| Display | **Prata** | Cyrillic serif; not Playfair |
| Body / UI | **Manrope** | Variable weight |
| Data | **IBM Plex Mono** | rating, prices, hours |

```css
--fs-display: clamp(2.75rem, 1.55rem + 5.4vw, 5.25rem);
--fs-h2: clamp(1.9rem, 1.35rem + 2.5vw, 3rem);
--fs-h3: clamp(1.25rem, 1.08rem + 0.8vw, 1.5rem);
--fs-lead: clamp(1.06rem, 0.99rem + 0.35vw, 1.25rem);
--fs-body: clamp(1rem, 0.97rem + 0.15vw, 1.0625rem);
--fs-cap: 0.8125rem;
--fs-eyebrow: 0.75rem; /* .18em tracking, uppercase */
```

Line-heights: display 1.02 · h2 1.12 · body 1.55.

**CDN note for prototype:** Google Fonts допустимий у прототипі; prod — self-host woff2.

---

## 4. Spacing & radii

- Space scale: 4 / 8 / 12 / 16 / 24 / 32 / 48 / 64 / 96  
- Section py mobile: 64–80 · desktop: 96–128  
- Radius: **0–2px** (editorial sharp; no rounded-xl cards)  
- Hairline dividers: 1px `--line`  

---

## 5. Motion (max 3 intentional)

| # | Motion | Spec |
|---|--------|------|
| 1 | Neon Reveal | 600ms stroke + glow on load; static if reduced-motion |
| 2 | BA affordance | 46%→56%→50% once on enter (~1.4s); stop on interact |
| 3 | Section fade-rise | 450–700ms, `translateY(12px)`, only when in view |

UI hovers: 160–220ms opacity/color.  
No scroll-jacking. No continuous pendulum.

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 6. Photography rules

| Type | Rule |
|------|------|
| Results | Matched framing, same light; label visits/technique |
| Process | Hands + hair texture, not random selfies |
| Interior | Show depth / neon / mirrors — crop dead wall |
| Founder | Strong portrait retained |
| Hero | First frame must read finished without waiting video |

**Honesty:** temp media in prototype must be labeled; never claim fake client results.

---

## 7. Components (visual)

- **Button primary:** moss fill, inv text, 52–56px height mobile  
- **Button secondary:** 1px inv/ink outline or text link with arrow  
- **Eyebrow:** moss / neon (on dark), mono or tracked caps  
- **Trust cell:** mono number + cap label  
- **BA:** full-bleed media, neon handle line on dark overlays  

---

## 8. Do / Don’t

**Do:** brand-first hero · proof early · mono for data · one signature light  
**Don’t:** hero cards · purple gradient · floating FABs · gold fills · Inter/Roboto/Arial · awards wallpaper
