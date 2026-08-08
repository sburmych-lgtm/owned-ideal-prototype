# 02 · Ideal Frontend Architecture

**Продукт:** OWNED — салон експертизи волосся, Safe Town, Львів  
**Job homepage:** довіра → експертиза → запис  
**Стек прототипу:** статичний HTML/CSS/JS (без backend). Production later: SSR/SPA + CRM.

---

## 1. Site map (фаза прототипу → продакшн)

| Route | Прототип | Prod priority |
|-------|----------|---------------|
| `/` | ✓ high-fi | P0 |
| `/#results` | anchor | → `/gallery` P0 |
| `/#services` | anchor | → `/services` P1 |
| `/#booking` | form UI | → `/booking` + CRM P1 |
| `/prices` | stub link | P0 after homepage |
| `/about` | founder+space on home | P2 page |

Прототип — один responsive codebase з **різними композиціями** на breakpoints `max-width: 899px` (mobile) і `min-width: 900px` (desktop).

---

## 2. Homepage chapter order (canonical)

1. Compact nav  
2. Immersive hero (brand-first)  
3. Trust strip  
4. Signature results (BA)  
5. Expertise / service families  
6. Visit flow (4 steps — numbering OK)  
7. Space (one)  
8. Reviews  
9. Founder  
10. Location + hours  
11. Booking  
12. Footer  

**Принцип:** спершу доказ, атмосфера — один раз, у середині decision path.

---

## 3. Mobile IA (≈390)

```
┌─────────────────────────┐
│ logo          ≡  Запис  │  64–72 scrolled
├─────────────────────────┤
│████ FULL-BLEED STILL ███│
│ OWNED (wordmark)        │  78–88svh
│ H1 конкретика           │
│ lead + [Записатися]     │
│        Дивитись роботи →│
├─────────────────────────┤
│ 4.9 · 480+ · Safe Town  │  trust strip
├─────────────────────────┤
│ РЕЗУЛЬТАТ               │
│ [====BA SLIDER====]     │  full width
│ thumbs 01–06            │
├─────────────────────────┤
│ НАПРЯМИ (stack)         │
│ Волосся від …           │
│ …                       │
├─────────────────────────┤
│ ВІЗИТ 01–04             │
├─────────────────────────┤
│ ПРОСТІР (bento 1+2)     │
├─────────────────────────┤
│ ВІДГУКИ (snap)          │
├─────────────────────────┤
│ ЗАСНОВНИЦЯ              │
├─────────────────────────┤
│ ЛОКАЦІЯ + ГОДИНИ        │
├─────────────────────────┤
│ ЗАПИС (форма)           │
├─────────────────────────┤
│ FOOTER                  │
└─────────────────────────┘
│     [ Записатися ]      │  dock: після hero, hide in booking
└─────────────────────────┘
```

**Mobile rules**
- Gutter 20–24px  
- Один primary CTA в зоні великого пальця  
- Не більше одного autoplay media (hero poster; video optional after LCP)  
- BA handle ≥44px  

---

## 4. Desktop IA (≈1440)

```
┌──────────────────────────────────────────────────┐
│ OWNED   Напрями  Результати  Простір  Записатися │
├──────────────────────────────────────────────────┤
│████████████ FULL-BLEED HERO PLANE ███████████████│
│  brand                                    still  │
│  H1 (left 5/12)                                  │
│  lead + CTAs                                     │
├──────────────────────────────────────────────────┤
│  ★4.9     480+      майстри     консультація     │
├─────────────────────────────┬────────────────────┤
│  BA slider (7 cols)         │ meta + thumbs      │
├─────────────────────────────┴────────────────────┤
│  Service families — 4 equal editorial columns    │
├──────────────────────────────────────────────────┤
│  Visit steps horizontal 01——02——03——04           │
├──────────────────┬───────────────────────────────┤
│  Space bento     │ copy                          │
├──────────────────┴───────────────────────────────┤
│  Review · Review · Review                        │
├──────────────────┬───────────────────────────────┤
│  Founder portrait│ thesis                        │
├──────────────────┴───────────────────────────────┤
│  Map/address block  |  Booking form              │
└──────────────────────────────────────────────────┘
```

**Desktop rules**
- Max content 1280–1440; 12-col mental grid  
- **No bottom sticky dock**  
- Nav links visible; burger only ≤899  
- Asymmetry ок; avoid stretching mobile stack to full width  

---

## 5. Component contracts

### Hero
- Brand-level OWNED wordmark visible without nav  
- Full-bleed media plane (edge-to-edge)  
- No floating badges / promo chips  
- Primary: Записатися · Secondary text: Дивитись роботи  

### Trust strip
- Mono numerals  
- Source label «Google»  
- No inventing counts  

### Before/After
- Start 50%  
- One affordance wiggle on first intersection  
- Stop after user input  
- Labels ДО / ПІСЛЯ  
- Homepage: 5–6 cases  

### Services
- Macro: Волосся · Нігті · Брови & вії · Образ  
- Hair is visually primary (larger / first)  
- Show `від N ₴` + short descriptor  

### Booking
- Fields: ім’я, телефон, напрям (select), коментар  
- Microcopy: «Адміністратор підтвердить запис»  
- Fallback CTA: Instagram / tel:  

---

## 6. State design (CRM-ready later)

| Entity | Fields (design now) |
|--------|---------------------|
| Service | title, group, duration, priceFrom, masters[] |
| Master | name, role, portrait, nextSlot |
| Review | author, text, service, date, source |
| Case | beforeUrl, afterUrl, visits, technique |

Empty / loading / error: не показувати мертві стіни — form fallback.

---

## 7. Perf & a11y gates

- LCP ≤ 2.5s (hero still, not video)  
- CLS ≤ 0.1 (width/height on media)  
- WCAG 2.2 AA contrast  
- `prefers-reduced-motion: reduce` → no reveal animation, static BA  
- `scroll-padding-top` = header height  
- Focus rings visible  

---

## 8. Prototype vs production

| Now | Later |
|-----|-------|
| Static form (no submit backend) | Bookon / custom CRM |
| Placeholder / licensed temp media | OWNED shoot (see photo brief Opus 05) |
| Single page | /gallery /prices /services |
| Hardcoded trust line | Google Places API cache 24h |
