# 01 · Синтез усіх аудитів + власного

**Джерела:** Незалежні (GPT1, GPT2, Claude1, Claude2, Gemini), Порівняльні (OWNED_* specs, master audits, Opus 00–05), власний аудит `00_OWN_COMPARATIVE_AUDIT.md`, семпл WDI kit (рекомендації, не канон).

---

## 1. Консенсус (усі / майже всі згодні)

| # | Узгодження | Джерела |
|---|------------|---------|
| 1 | Зберегти DNA OWNED (палітра ink/bone/moss, serif+sans, реальні фото, неон, founder) | Opus, Handoff, Master, Claude1, GPT |
| 2 | Переписати структуру під **proof-first**, не atmosphere-first | Opus, Master, Handoff, Spec, власний |
| 3 | Before/after — головний conversion engine, підняти високо | Усі comparative + GPT |
| 4 | Потрібен Google rating / відгуки (і це перевага vs еталон ~48) | Усі |
| 5 | Додати ціни «від» хоча б на рівні сімейств послуг | Opus, Claude, GPT, Handoff |
| 6 | Sticky header/dock: компактніше + не різати контент + IO-логіка | Claude1, Master, Spec |
| 7 | H1 зараз занадто generic | GPT1, Gemini, Opus, Claude2 |
| 8 | Одна секція простору замість трьох атмосферних | Opus, Master |
| 9 | Desktop потребує окремої композиції | Master, GPT2, **власний (підтверджено скріном 1440)** |
| 10 | Reduced-motion + pause video — залишити / посилити | GPT1, Opus, Spec |
| 11 | 3D лише як опційний signature, не hero-loader | Opus, Handoff, Master |
| 12 | Не копіювати floating social FABs і awards wall еталона | Opus, власний |

---

## 2. Суперечності (і як вирішуємо)

| Тема | Позиції | Рішення для прототипу |
|------|---------|------------------------|
| Hero: з відео/фото чи лише текст? | Opus (старий mobile еталона: text-only) vs live laserandme 2026-08-08 (full-bleed image) vs Own (cinematic) | **Full-bleed still/poster OWNED** + Neon Reveal. Відео не блокує LCP |
| KEEP&POLISH vs full structure rewrite | Claude1: YES AFTER P0 polish; Opus/Master/GPT: структура rewrite | **Візуальну мову KEEP, IA rewrite** (Opus вердикт) |
| Оцінка якості | Claude1 ~71; Master ~62–66 | Ближче до **середини**: арт сильний, CRO слабкий |
| Числа відгуків | «500+» у розмові vs «482 / 4.9» у Master Spec | У UI: **4.9 · 480+** + підпис «Google · звірити перед релізом» |
| Картки послуг | Opus пропонує 2×2 cards; frontend hard rules — мало карток | На homepage: **рядок сімейств** без card-stack у hero; легкі surface blocks ok для interactive pick |
| Amber neon vs green neon | Opus tokens = бурштин `#F4C46A`; live salon = зелений неон | Акцент-світло = **warm amber на dark** (Opus); environmental green лишається у фото |
| Що продаємо першим | Hair expertise wedge (GPT) vs full beauty (поточний сайт) | **Primary: волосся**; secondary strip: нігті / брови / образ |
| Hero H1 емоційний vs конкретний | Handoff дозволяє emotional H1 + concrete sub; GPT/Opus хочуть конкретний H1 | **Конкретний H1**, емоція в lead |

---

## 3. Унікальні сильні ідеї (і хто)

1. **Neon Reveal як signature** (Opus) — SVG stroke + glow ~600ms.  
2. **`--neon` лише як світло на dark** (Opus DS) — захист від «дешевого золота».  
3. **IBM Plex Mono для даних** (ціни, рейтинг, години) — credibility through type (Opus / Gemini mono idea).  
4. **Presentation taxonomy ≠ CRM taxonomy** (Handoff).  
5. **BA auto-demo один раз 46→56→50** потім stop (Handoff / Spec).  
6. **Acquisition wedge: hair** (GPT1) — не рівняти манікюр зі складним кольором у hero.  
7. **Власне спостереження 2026-08-08:** еталон уже з фото-hero; OWNED desktop = mobile column — gap №1 для агентства.  
8. **WDI kit:** evidence-grade browser, не вигадувати human gates; pilot ≠ production approval.

---

## 4. Top 10 findings, що керують дизайном прототипу

1. Proof у перших двох скролах після hero.  
2. Окрема desktop-композиція (не stretch).  
3. Конкретний український H1 про кучері / сивину / складний колір.  
4. Trust strip з верифікованим рейтингом.  
5. 5–6 signature before/after, не весь прайс.  
6. Сімейства послуг + «від ₴», повний прайс — окремо.  
7. Compact sticky mobile dock з розумним show/hide.  
8. Одна cinematic space-секція.  
9. Neon Reveal + restrained motion + `prefers-reduced-motion`.  
10. Booking поруч із годинами / адресою / мікродовір’ям.

---

## 5. Що свідомо відкидаємо

- WebGL intro / scroll-jacking.  
- Purple SaaS / cream-terracotta шаблон / broadsheet.  
- Card-hero і pill-stat clutter у першому viewport.  
- Hardcode «500+» без джерела.  
- Fake BA як «реальний результат клієнта» без дисклеймера.

---

## 6. Карта документів далі

| Файл | Роль |
|------|------|
| `02_IDEAL_FRONTEND_ARCHITECTURE.md` | IA mobile/desktop + маршрути |
| `03_DESIGN_SYSTEM.md` | Токени, тип, motion, photo |
| `prototype/` | High-fidelity HTML/CSS/JS |
