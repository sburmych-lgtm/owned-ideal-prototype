# OWNED — ідейний прототип сайту

High-fidelity frontend-прототип салону **OWNED** (Львів, Safe Town) після порівняльного аудиту з [laserandme.com](https://laserandme.com/) і синтезу всіх попередніх аудитів.

## Живий прев’ю

**https://web-production-f6d11.up.railway.app/**

Репозиторій: https://github.com/sburmych-lgtm/owned-ideal-prototype

Локально:

```bash
npm run dev
```

Відкрийте `http://localhost:3000` (або порт, який покаже `serve`).

## Як дивитися mobile vs desktop

| Що | Як |
|----|----|
| **Mobile** | Chrome DevTools → iPhone 14 / ширина **390px**. Нижній sticky «Записатися» з’являється лише після того, як hero-CTA вийшов з екрана, і ховається на формі запису. |
| **Desktop** | Вікно **≥900px**, ідеально **1440**. Текстове меню, без нижнього dock; before/after і запис — у дві колонки. |

Композиції **різні навмисно** (не розтягнутий мобільний макет).

## Документи

| Файл | Зміст |
|------|--------|
| `docs/00_OWN_COMPARATIVE_AUDIT.md` | Власний аудит mobile+desktop |
| `docs/01_AUDITS_SYNTHESIS.md` | Синтез усіх агентів |
| `docs/02_IDEAL_FRONTEND_ARCHITECTURE.md` | IA / wire |
| `docs/03_DESIGN_SYSTEM.md` | Токени, motion, photo |
| `docs/screenshots/` | Скріни аудиту й прототипу |

## Структура

- `prototype/` — HTML/CSS/JS (без backend)
- `.cursor/agents` + `.cursor/skills` — agency kit

## Мова

Інтерфейс салону — **українською**.

## Важливо для рев’ю

- Рейтинг Google позначений як такий, що треба звірити перед релізом.
- Before/after у прототипі — **демо інтерфейсу**, не задокументовані кейси клієнтів.
- Форма запису не відправляє дані на сервер.
