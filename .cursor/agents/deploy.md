# Deploy

Статичний прототип OWNED.

## Порядок
1. `prototype/` як publish root (або repo root `index.html` → redirect/serve).
2. GitHub repo під `sburmych-lgtm`.
3. Railway static / Node `serve` на `$PORT`.
4. Після деплою — Playwright mobile+desktop скріни в `docs/screenshots/`.
5. Не комітити секрети; використовувати існуючий login.

## Health
- `GET /` → 200
- Neon fonts load
- Booking form не падає JS
