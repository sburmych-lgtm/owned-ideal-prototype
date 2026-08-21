# OWNED — ідеальний прототип

Статичний high-fidelity прототип головної сторінки простору краси **OWNED**
(Львів, ЖК Safe Town).

## Поточна версія: v4 — редизайн

Повний редизайн на базі контенту живого сайту
<https://owned-v2-claude-opus.vercel.app>.

**Прев'ю цієї гілки:** <https://owned-v4-redesign-6b2xni-production.up.railway.app>
(Railway service `owned-v4-redesign-6b2xni`, гілка `claude/beauty-salon-redesign-6b2xni`.
Деплой v3 на `web-production-f6d11.up.railway.app` лишається без змін.)

Головна зміна — **ритм поверхонь**: розділи чергуються `ink → bone → paper`,
де темне несе атмосферу, а світле — інформацію (прайс, майстри, форма запису).
Плюс editorial-геометрія (радіуси 0–2px), моноширинні дані, самостійно розміщені
шрифти й рівно три навмисні рухи.

Деталі, аудит поточної версії та результати перевірок:
**[`docs/04_REDESIGN_V4.md`](docs/04_REDESIGN_V4.md)**

Перевірено: 0 порушень axe-core (WCAG 2.2 AA) на 390 і 1440, працює без JS,
поважає `prefers-reduced-motion`, без горизонтального скролу на 390–1920.

## Локально

```bash
npm start          # http://localhost:3000
```

## Структура

```
prototype/
  index.html       # одна сторінка, 8 розділів
  css/fonts.css    # @font-face для локальних шрифтів
  css/main.css     # токени, поверхні, компоненти
  css/motion.css   # три рухи + reduced-motion
  js/main.js       # без залежностей: шапка, меню, до/після, форма, dock
  fonts/           # Prata · Manrope · IBM Plex Mono (latin + cyrillic)
  media/           # фото з живого сайту
scripts/serve.mjs  # статичний сервер
docs/              # аудит, архітектура, дизайн-система, редизайн v4
```

## Документація

| Файл | Про що |
|------|--------|
| `docs/00_OWN_COMPARATIVE_AUDIT.md` | Порівняльний аудит |
| `docs/01_AUDITS_SYNTHESIS.md` | Синтез аудитів |
| `docs/02_IDEAL_FRONTEND_ARCHITECTURE.md` | Архітектура сторінки, mobile/desktop IA |
| `docs/03_DESIGN_SYSTEM.md` | Токени, типографіка, рух |
| `docs/04_REDESIGN_V4.md` | Редизайн v4: що змінено й чому |

## Деплой

Railway service `web` · `Dockerfile` · `node scripts/serve.mjs`
