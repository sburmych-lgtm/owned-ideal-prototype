# OWNED — сайт салону краси (v4)

Статичний сайт бʼюті-простору OWNED (Львів, ЖК Safe Town). Без збірки на
рантаймі: `site/index.html` згенеровано й закомічено, сервер лише роздає файли.

![OWNED v4 — головний екран](docs/screenshots/redesign-v4-hero.webp)

## Локально

```bash
npm start          # http://localhost:3000  — v4
                   # http://localhost:3000/v3/ — попередній прототип
```

## Редагування контенту

Увесь текст, прайс, майстри, кейси та відгуки лежать в одному файлі:

```bash
$EDITOR site/data/site.json
npm run build      # перезбирає site/index.html
```

`site/index.html` — згенерований файл, редагувати вручну не потрібно.

## Оновлення шрифтів

```bash
node scripts/fetch-fonts.mjs   # оновлює site/fonts + site/css/fonts.css
```

Шрифти self-hosted (Prata · Manrope · IBM Plex Mono, кириличні та латинські
підмножини) — сторінка не робить жодного стороннього запиту.

## Що це

Редизайн живого сайту: нова інформаційна архітектура, повне порівняння
до / після, відкритий прайс, реальна сітка майстрів і три явні шляхи запису.
515 КБ на мобільному, 9 КБ JS, 0 порушень axe-core.

Деталі аудиту, рішень і вимірювань — `docs/04_REDESIGN_V4.md`.
Дизайн-система — `docs/03_DESIGN_SYSTEM.md`.

## Деплой

Railway · Dockerfile · `node scripts/serve.mjs` (порт із `PORT`, типово 8080).
