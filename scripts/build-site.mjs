/**
 * Builds site/index.html from site/data/site.json.
 *
 * The generated file is committed, so the deploy stays a plain static server
 * with no build step. Re-run `npm run build` after editing the content file.
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const SITE = path.join(ROOT, "site");

const data = JSON.parse(fs.readFileSync(path.join(SITE, "data", "site.json"), "utf8"));

/* ------------------------------------------------------------------ utils */

const esc = (s = "") =>
  String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

/** Reads intrinsic width/height out of a .webp without pulling in a decoder. */
function webpSize(file) {
  const b = fs.readFileSync(file);
  const fourcc = b.toString("ascii", 12, 16);
  if (fourcc === "VP8X") {
    return {
      w: 1 + (b[24] | (b[25] << 8) | (b[26] << 16)),
      h: 1 + (b[27] | (b[28] << 8) | (b[29] << 16)),
    };
  }
  if (fourcc === "VP8L") {
    const bits = b[21] | (b[22] << 8) | (b[23] << 16) | (b[24] << 24);
    return { w: 1 + (bits & 0x3fff), h: 1 + ((bits >> 14) & 0x3fff) };
  }
  // "VP8 " — lossy
  return { w: b.readUInt16LE(26) & 0x3fff, h: b.readUInt16LE(28) & 0x3fff };
}

const sizeCache = new Map();
const measure = (rel) => {
  if (!sizeCache.has(rel)) sizeCache.set(rel, webpSize(path.join(SITE, rel)));
  return sizeCache.get(rel);
};

/**
 * <img> with a srcset built from the base (1x) and @2x derivatives. Widths are
 * read off the files so the descriptors never drift from what is on disk.
 */
function img(base, { alt = "", sizes, loading = "lazy", priority = false, className = "" } = {}) {
  const one = `${base}.webp`;
  const two = `${base}@2x.webp`;
  const hasTwo = fs.existsSync(path.join(SITE, two));
  const a = measure(one);
  const b = hasTwo ? measure(two) : null;
  const set = [`${one} ${a.w}w`];
  if (b && b.w > a.w) set.push(`${two} ${b.w}w`);

  const attrs = [
    `src="${esc(hasTwo && b.w > a.w ? two : one)}"`,
    set.length > 1 ? `srcset="${esc(set.join(", "))}"` : "",
    sizes && set.length > 1 ? `sizes="${esc(sizes)}"` : "",
    `width="${(b || a).w}"`,
    `height="${(b || a).h}"`,
    `alt="${esc(alt)}"`,
    className ? `class="${esc(className)}"` : "",
    priority ? 'fetchpriority="high" decoding="async"' : `loading="${loading}" decoding="async"`,
  ].filter(Boolean);

  return `<img ${attrs.join(" ")} />`;
}

/** Preloads only the cyrillic faces the first screen actually paints with. */
const preloadFonts = fs
  .readdirSync(path.join(SITE, "fonts"))
  .filter((f) => /^(prata|manrope)-cyrillic-\d+\.woff2$/.test(f))
  .sort()
  .map((f) => `  <link rel="preload" href="fonts/${f}" as="font" type="font/woff2" crossorigin />`)
  .join("\n");

const monogram = fs
  .readFileSync(path.join(SITE, "media", "brand", "monogram.svg"), "utf8")
  .replace(/<\?xml[^>]*\?>/, "")
  .replace(/<defs>[\s\S]*?<\/defs>/, "")
  .replace(/ class="cls-1"/g, "")
  .replace(/<svg /, '<svg aria-hidden="true" focusable="false" ')
  .trim();

const brandmark = (extra = "") => `
      <a class="brandmark ${extra}" href="#top" aria-label="OWNED — на початок">
        <span class="brandmark__mark">${monogram}</span>
        <span class="brandmark__word">OWNED</span>
      </a>`;

const icon = {
  phone: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6.5 3h3l1.5 4-2 1.5a12 12 0 0 0 5.5 5.5l1.5-2 4 1.5v3a2 2 0 0 1-2.2 2A17 17 0 0 1 4.5 5.2 2 2 0 0 1 6.5 3Z" stroke-linejoin="round"/></svg>',
  calendar:
    '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3.5" y="5" width="17" height="15.5" rx="1.5"/><path d="M3.5 9.5h17M8 3v4M16 3v4"/></svg>',
  chat: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.5 12.2c0 4.1-3.8 7.4-8.5 7.4-1 0-2-.2-2.9-.4L4 21l1.4-3.6A7 7 0 0 1 3.5 12.2c0-4.1 3.8-7.4 8.5-7.4s8.5 3.3 8.5 7.4Z" stroke-linejoin="round"/></svg>',
  pin: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s7-5.6 7-11a7 7 0 1 0-14 0c0 5.4 7 11 7 11Z" stroke-linejoin="round"/><circle cx="12" cy="10" r="2.6"/></svg>',
};

const stars = (n) => "★".repeat(n) + "☆".repeat(5 - n);

/* ----------------------------------------------------------------- blocks */

const navLinks = data.nav
  .map((n) => `<li><a href="${esc(n.href)}">${esc(n.label)}</a></li>`)
  .join("\n            ");

const heroBlock = `
    <section class="hero" id="top">
      <div class="wrap hero__grid">
        <div class="hero__copy">
          <p class="eyebrow">${esc(data.hero.eyebrow)}</p>
          <h1 class="hero__title">
            <span>${esc(data.hero.title[0])}</span>
            <span>${esc(data.hero.title[1])}</span>
            <span><em>${esc(data.hero.title[2])}</em></span>
          </h1>
          <p class="hero__lead">${esc(data.hero.lead)}</p>
          <div class="hero__cta">
            <a class="btn btn--lg" href="${esc(data.brand.bookingUrl)}" target="_blank" rel="noopener">${esc(data.hero.ctaPrimary)}</a>
            <a class="btn btn--lg btn--ghost-inv" href="#results">${esc(data.hero.ctaSecondary)}</a>
          </div>
          <p class="hero__note">Безкоштовна консультація перед кожною складною роботою · ${esc(data.brand.hours)}</p>
        </div>

        <div class="hero__media">
          <figure class="hero__shot hero__shot--main">
            ${img("media/results/airtouch-after", {
              alt: "Результат складного фарбування Airtouch — рельєфний блонд, знятий у салоні OWNED",
              sizes: "(min-width: 62rem) 26rem, (min-width: 48rem) 40vw, 92vw",
              priority: true,
            })}
            <figcaption class="hero__caption">Airtouch · робота команди OWNED</figcaption>
          </figure>
          <figure class="hero__shot hero__shot--inset">
            ${img("media/space/hero-wide", {
              alt: "Зал салону OWNED з неоновою вивіскою у ЖК Safe Town, Львів",
              sizes: "(min-width: 62rem) 16rem, 26vw",
            })}
          </figure>
        </div>
      </div>
    </section>

    <section class="stats" aria-label="Показники довіри">
      <div class="wrap">
        <ul class="stats__grid">
          ${data.stats
            .map(
              (s) => `<li class="stats__item">
            <span class="stats__value">${esc(s.value)}${s.unit ? `<span class="stats__unit">${esc(s.unit)}</span>` : ""}</span>
            <span class="stats__label">${esc(s.label)}</span>
          </li>`
            )
            .join("\n          ")}
        </ul>
      </div>
    </section>`;

const expertiseBlock = `
    <section class="section" id="expertise">
      <div class="wrap">
        <header class="section-head">
          <p class="eyebrow">Ключова експертиза</p>
          <h2>Чотири напрямки,<br />у яких ми сильні</h2>
          <p class="section-lead">Ми не робимо «все як у всіх». Фокус — на складних техніках, де потрібні точність, знання хімії процесів і чесна оцінка стану волосся.</p>
        </header>

        <div class="expertise">
          ${data.expertise
            .map(
              (d, i) => `<article class="direction" data-reveal style="--i:${i}">
            <p class="direction__num">${esc(d.num)}</p>
            <div class="direction__body">
              <p class="direction__kicker">${esc(d.kicker)}</p>
              <h3 class="direction__title">${esc(d.title)}</h3>
              <p class="direction__text">${esc(d.text)}</p>
              <ul class="direction__tags">
                ${d.tags.map((t) => `<li class="tag">${esc(t)}</li>`).join("\n                ")}
              </ul>
              <p class="direction__cta"><a class="link-arrow" href="#results" data-filter-jump="${esc(d.filter)}">Дивитись роботи напрямку</a></p>
            </div>
            <figure class="direction__media">
              ${img(d.image, {
                alt: `${d.title} — приклад роботи майстрів OWNED`,
                sizes: "(min-width: 62rem) 19rem, (min-width: 48rem) 15rem, 92vw",
              })}
            </figure>
          </article>`
            )
            .join("\n          ")}
        </div>
      </div>
    </section>`;

const resultsBlock = `
    <section class="section section--ink" id="results">
      <div class="wrap">
        <header class="section-head">
          <p class="eyebrow">Студія трансформацій</p>
          <h2>Реальні результати<br />до та після</h2>
          <p class="section-lead">Жодних ретушей і фільтрів — кейси, зняті в салоні OWNED. Потягніть смугу, щоб порівняти.</p>
        </header>

        <div class="filters js-only" role="group" aria-label="Фільтр робіт за напрямком">
          ${data.filters
            .map(
              (f, i) =>
                `<button type="button" data-filter="${esc(f.id)}" aria-pressed="${i === 0 ? "true" : "false"}">${esc(f.label)}</button>`
            )
            .join("\n          ")}
        </div>

        <div class="gallery">
          <div class="gallery__stage">
            <p class="gallery__counter js-only" data-counter aria-live="polite"></p>
            ${data.cases
              .map(
                (c, i) => `<article class="case" data-case="${esc(c.id)}" data-category="${esc(c.category)}" data-active="${i === 0 ? "true" : "false"}">
              <div class="compare" data-compare${i === 0 ? ' data-hint="true"' : ""} style="--pos:50%">
                <div class="compare__layer compare__layer--after">
                  ${img(`media/results/${c.slug}-after`, {
                    alt: `${c.title} — після роботи`,
                    sizes: "(min-width: 62rem) 44rem, 92vw",
                    loading: i === 0 ? "eager" : "lazy",
                  })}
                </div>
                <div class="compare__layer compare__layer--before">
                  ${img(`media/results/${c.slug}-before`, {
                    alt: `${c.title} — до роботи`,
                    sizes: "(min-width: 62rem) 44rem, 92vw",
                    loading: i === 0 ? "eager" : "lazy",
                  })}
                </div>
                <span class="compare__tag compare__tag--before">До</span>
                <span class="compare__tag compare__tag--after">Після</span>
                <span class="compare__divider" aria-hidden="true"><span class="compare__knob">↔</span></span>
                <input class="compare__range" type="range" min="0" max="100" value="50" step="1"
                       aria-label="Порівняти фото до і після: ${esc(c.title)}" data-range />
              </div>
              <div class="case__body">
                <p class="case__label">${esc(c.categoryLabel)}</p>
                <h3 class="case__title">${esc(c.title)}</h3>
                <p class="case__meta">${esc(c.meta)}</p>
                <p class="case__desc">${esc(c.description)}</p>
                <div class="case__foot">
                  <ul class="direction__tags" style="margin-top:0">
                    ${c.tags.map((t) => `<li class="tag">${esc(t)}</li>`).join("\n                    ")}
                  </ul>
                </div>
                <p><a class="link-arrow" href="#booking">Хочу схожий результат</a></p>
              </div>
            </article>`
              )
              .join("\n            ")}
            <p class="gallery__empty js-only" data-empty hidden>У цьому напрямку поки немає опублікованих кейсів.</p>
          </div>

          <div class="rail js-only" role="group" aria-label="Обрати кейс">
            ${data.cases
              .map(
                (c, i) => `<button type="button" data-thumb="${esc(c.id)}" data-category="${esc(c.category)}" aria-pressed="${i === 0 ? "true" : "false"}">
              ${img(`media/results/thumb/${c.slug}`, { alt: c.title })}
              <span class="rail__index">${String(i + 1).padStart(2, "0")}</span>
            </button>`
              )
              .join("\n            ")}
          </div>
        </div>
      </div>
    </section>`;

const priceBlock = `
    <section class="section section--bone" id="prices">
      <div class="wrap">
        <header class="section-head">
          <p class="eyebrow">Послуги та прайс</p>
          <h2>Прозорий прайс простору</h2>
          <p class="section-lead">Ціни «від» — фінальну вартість майстер називає на консультації, після оцінки довжини, густоти та стану волосся.</p>
        </header>

        <div class="price-grid">
          <div>
            ${data.price
              .map(
                (cat, i) => `<details class="price-cat"${i === 0 ? " open" : ""}>
              <summary>
                <span>
                  <span class="price-cat__title">${esc(cat.title)}</span>
                  <span class="price-cat__sub">${esc(cat.subtitle)}</span>
                </span>
                <span class="price-cat__sign" aria-hidden="true">+</span>
              </summary>
              <div class="price-list">
                ${cat.items
                  .map(
                    (it) => `<div class="price-row">
                  <span class="price-row__main">
                    <span class="price-row__name">${esc(it.name)}</span>
                    <span class="price-row__note">${esc(it.note)}</span>
                  </span>
                  <span class="price-row__value">
                    <span class="price-row__price">${esc(it.price)}</span>
                    <span class="price-row__dur">${esc(it.duration)}</span>
                  </span>
                </div>`
                  )
                  .join("\n                ")}
                <p class="price-cat__deposit">Завдаток: ${esc(cat.deposit)}</p>
              </div>
            </details>`
              )
              .join("\n            ")}
          </div>

          <aside class="aside-card" aria-label="Правила запису">
            <h3>Запис і завдаток</h3>
            <p>${esc(data.booking.consultation)}</p>
            <ul class="deposit-list">
              ${data.booking.deposits
                .map(
                  (d) => `<li><span>${esc(d.service)}</span><span>${esc(d.amount)}</span></li>`
                )
                .join("\n              ")}
            </ul>
            <p class="notice">${esc(data.booking.rulesText)}</p>
            <p style="margin-top:1.25rem"><a class="btn btn--block" href="#booking">Записатися</a></p>
          </aside>
        </div>
      </div>
    </section>`;

const mastersBlock = `
    <section class="section" id="masters">
      <div class="wrap">
        <header class="section-head">
          <p class="eyebrow">Команда</p>
          <h2>Майстри простору OWNED</h2>
          <p class="section-lead">Вузька спеціалізація, підтверджений досвід і єдиний стандарт безпеки та стерильності для всіх.</p>
        </header>

        <div class="masters">
          ${data.masters
            .filter((m) => m.category !== "founder")
            .map(
              (m, i) => `<article class="master" data-reveal style="--i:${i % 4}">
            <div class="master__photo">
              ${img(m.image, {
                alt: `${m.name} — ${m.role}`,
                sizes: "(min-width: 62rem) 15rem, (min-width: 40rem) 30vw, 46vw",
              })}
              <span class="master__years">${esc(m.experience)}</span>
            </div>
            <h3 class="master__name">${esc(m.name)}</h3>
            <p class="master__role">${esc(m.role)}</p>
            <ul class="master__specs">
              ${m.specialties.slice(0, 3).map((s) => `<li class="tag">${esc(s)}</li>`).join("\n              ")}
            </ul>
            <details class="master__more">
              <summary>Досьє</summary>
              <p class="master__bio">${esc(m.bio)}</p>
              <p class="master__bio"><strong>Улюблене в роботі:</strong> ${esc(m.favorite)}</p>
            </details>
          </article>`
            )
            .join("\n          ")}
        </div>
      </div>
    </section>`;

const spaceBlock = `
    <section class="section section--ink" id="space">
      <div class="wrap">
        <header class="section-head">
          <p class="eyebrow">Простір і процес</p>
          <h2>Атмосфера, ремесло, турбота</h2>
          <p class="section-lead">Три розділи одного візиту — від роботи із завитком до догляду в дрібницях.</p>
        </header>

        <div class="space-grid">
          ${data.space
            .map(
              (s, i) => `<figure class="space-card" data-reveal style="--i:${i}">
            ${img(s.image, {
              alt: s.caption,
              sizes: "(min-width: 48rem) 31vw, 92vw",
            })}
            <figcaption class="space-card__body">
              <span class="space-card__num">${esc(s.num)}</span>
              <span class="space-card__title">${esc(s.title)}</span>
              <span class="space-card__caption">${esc(s.caption)}</span>
            </figcaption>
          </figure>`
            )
            .join("\n          ")}
        </div>
      </div>
    </section>`;

const trustBlock = `
    <section class="section section--bone" id="trust">
      <div class="wrap">
        <div class="trust-grid">
          <figure class="award-photo" data-reveal>
            ${img(data.award.image, {
              alt: "Диплом номінанта «ТОП 100 кращих салонів краси»",
              sizes: "(min-width: 62rem) 24rem, 80vw",
            })}
          </figure>

          <div>
            <p class="eyebrow">${esc(data.award.eyebrow)}</p>
            <h2>${esc(data.award.title)}</h2>
            <p class="section-lead">${esc(data.award.text)}</p>

            <div class="rating-block">
              <div>
                <p class="rating-block__score">${esc(data.brand.rating)}</p>
                <p class="rating-block__stars" aria-hidden="true">★★★★★</p>
              </div>
              <dl class="rating-block__facts">
                <div><dt>Усього відгуків</dt> <dd><b>${esc(data.brand.reviews)}</b></dd></div>
                <div><dt>З них пʼятизіркових</dt> <dd><b>${esc(data.brand.fiveStar)}</b></dd></div>
                <div><dt>Джерело</dt> <dd>${esc(data.brand.reviewNote)}</dd></div>
              </dl>
            </div>
          </div>
        </div>

        <h3 class="visually-hidden">Відгуки клієнток</h3>
        <div class="reviews">
          ${data.reviews
            .map(
              (r, i) => `<figure class="review" data-reveal style="--i:${i % 3}">
            <p class="review__stars" aria-label="Оцінка ${r.rating} з 5">${stars(r.rating)}</p>
            <p class="review__service">${esc(r.service)}</p>
            <blockquote class="review__text">${esc(r.text)}</blockquote>
            <figcaption>
              <p class="review__author">${esc(r.name)}</p>
              <p class="review__meta">${esc(r.meta)}</p>
            </figcaption>
          </figure>`
            )
            .join("\n          ")}
        </div>
      </div>
    </section>`;

const founderBlock = `
    <section class="section section--ink" id="founder">
      <div class="wrap founder-grid">
        <figure class="founder__photo" data-reveal>
          ${img("media/founder/halyna", {
            alt: `${data.founder.name} — ${data.founder.role}`,
            sizes: "(min-width: 55rem) 26rem, 85vw",
          })}
        </figure>
        <div>
          <p class="eyebrow">Слово засновниці</p>
          <blockquote class="founder__quote">«${esc(data.founder.thesis)}»</blockquote>
          <p class="founder__name">${esc(data.founder.name)}</p>
          <p class="founder__role">${esc(data.founder.role)} · ${esc(data.founder.experience)}</p>
          <ul class="principles">
            ${data.founder.principles.map((p) => `<li><span>${esc(p)}</span></li>`).join("\n            ")}
          </ul>
        </div>
      </div>
    </section>`;

const serviceOptions = data.price
  .flatMap((cat) => cat.items.map((it) => `${cat.title} — ${it.name}`))
  .map((v) => `<option value="${esc(v)}">${esc(v)}</option>`)
  .join("\n              ");

const bookingBlock = `
    <section class="section" id="booking">
      <div class="wrap">
        <header class="section-head">
          <p class="eyebrow">Запис</p>
          <h2>Три способи потрапити<br />до майстра</h2>
          <p class="section-lead">Не знаєте, яка послуга потрібна — беріть безкоштовну консультацію. Майстер оцінить волосся й запропонує реалістичний план.</p>
        </header>

        <div class="booking-grid">
          <div class="routes">
            <a class="route" href="${esc(data.brand.bookingUrl)}" target="_blank" rel="noopener">
              <span class="route__icon">${icon.calendar}</span>
              <span>
                <span class="route__title">Онлайн-запис</span>
                <span class="route__sub">Обрати майстра, послугу та вільний час — цілодобово</span>
              </span>
              <span class="route__go" aria-hidden="true">→</span>
            </a>
            <a class="route" href="tel:${esc(data.brand.phone)}">
              <span class="route__icon">${icon.phone}</span>
              <span>
                <span class="route__title">${esc(data.brand.phoneDisplay)}</span>
                <span class="route__sub">Адміністратор підбере майстра та прорахує час візиту</span>
              </span>
              <span class="route__go" aria-hidden="true">→</span>
            </a>
            <a class="route" href="${esc(data.brand.instagram)}" target="_blank" rel="noopener">
              <span class="route__icon">${icon.chat}</span>
              <span>
                <span class="route__title">Instagram Direct ${esc(data.brand.instagramHandle)}</span>
                <span class="route__sub">Надішліть фото волосся — відповімо з планом і вартістю</span>
              </span>
              <span class="route__go" aria-hidden="true">→</span>
            </a>

            <p class="notice">${esc(data.booking.consultation)}. ${esc(data.booking.rulesText)}</p>
          </div>

          <form class="form" data-form novalidate>
            <h3 class="form__title">Підготувати заявку</h3>
            <p class="form__hint">Заповніть поля — ми складемо готове повідомлення, яке залишиться надіслати в Direct або продиктувати по телефону.</p>

            <div class="field-row">
              <p class="field">
                <label for="f-name">Імʼя</label>
                <input id="f-name" name="name" type="text" autocomplete="given-name" placeholder="Олена" />
              </p>
              <p class="field">
                <label for="f-phone">Телефон</label>
                <input id="f-phone" name="phone" type="tel" inputmode="tel" autocomplete="tel" placeholder="097 000 00 00" />
              </p>
            </div>

            <p class="field">
              <label for="f-service">Послуга</label>
              <select id="f-service" name="service">
                <option value="Безкоштовна консультація">Безкоштовна консультація (0 ₴)</option>
                ${serviceOptions}
              </select>
            </p>

            <p class="field">
              <label for="f-when">Зручний час</label>
              <select id="f-when" name="when">
                <option value="будь-коли">Будь-коли</option>
                <option value="ранок (10:00–13:00)">Ранок · 10:00–13:00</option>
                <option value="день (13:00–17:00)">День · 13:00–17:00</option>
                <option value="вечір (17:00–20:00)">Вечір · 17:00–20:00</option>
                <option value="вихідні">Вихідні</option>
              </select>
            </p>

            <p class="field">
              <label for="f-note">Коротко про волосся</label>
              <textarea id="f-note" name="note" placeholder="Довжина, попередні фарбування, що хочеться змінити"></textarea>
            </p>

            <div class="form__actions">
              <button class="btn js-only" type="submit">Скласти повідомлення</button>
              <a class="btn btn--ghost" href="${esc(data.brand.instagram)}" target="_blank" rel="noopener">Відкрити Direct</a>
              <a class="btn btn--ghost" href="tel:${esc(data.brand.phone)}">Подзвонити</a>
            </div>

            <p class="form__status" data-form-status role="status"></p>
            <pre class="form__out" data-form-out hidden></pre>
            <p class="form__hint no-js">Форма складає текст у браузері й нікуди його не надсилає — жодні дані не залишають ваш пристрій.</p>
          </form>
        </div>
      </div>
    </section>`;

const contactsBlock = `
    <section class="section section--bone" id="contacts">
      <div class="wrap contacts-grid">
        <div>
          <p class="eyebrow">Як нас знайти</p>
          <h2>${esc(data.brand.city)}, ${esc(data.brand.place)}</h2>
          <dl class="contact-list">
            <div>
              <dt>Адреса</dt>
              <dd>${esc(data.brand.address)} · ЖК ${esc(data.brand.place)}</dd>
            </div>
            <div>
              <dt>Графік</dt>
              <dd>${esc(data.brand.hours)}</dd>
            </div>
            <div>
              <dt>Телефон</dt>
              <dd><a href="tel:${esc(data.brand.phone)}">${esc(data.brand.phoneDisplay)}</a></dd>
            </div>
            <div>
              <dt>Instagram</dt>
              <dd><a href="${esc(data.brand.instagram)}" target="_blank" rel="noopener">${esc(data.brand.instagramHandle)}</a></dd>
            </div>
          </dl>
          <p style="margin-top:1.75rem">
            <a class="btn" href="${esc(data.brand.mapsDirectionsUrl)}" target="_blank" rel="noopener">Прокласти маршрут</a>
          </p>
        </div>

        <a class="map-frame" href="${esc(data.brand.mapsUrl)}" target="_blank" rel="noopener" aria-label="Відкрити OWNED на Google Maps">
          ${img("media/space/hero-tall", {
            alt: "Вхідна зона салону OWNED",
            sizes: "(min-width: 55rem) 34rem, 92vw",
          })}
          <span class="map-frame__overlay">
            <span>${esc(data.brand.address)}</span>
            <span class="mono">Google Maps →</span>
          </span>
        </a>
      </div>
    </section>`;

const footerBlock = `
    <footer class="footer">
      <div class="wrap footer__grid">
        <div class="footer__brand">
          ${brandmark()}
          <p class="footer__about">Бʼюті-простір у Львові: кучері, сивина, складний колір, відновлення, нігті та брови.</p>
          <p style="margin-top:1.25rem"><a class="btn btn--ghost-inv btn--sm" href="${esc(data.brand.bookingUrl)}" target="_blank" rel="noopener">Записатися онлайн</a></p>
        </div>
        <div>
          <h3>Навігація</h3>
          <ul>
            ${data.nav.map((n) => `<li><a href="${esc(n.href)}">${esc(n.label)}</a></li>`).join("\n            ")}
          </ul>
        </div>
        <div>
          <h3>Контакти</h3>
          <ul>
            <li>${esc(data.brand.address)}</li>
            <li><a href="tel:${esc(data.brand.phone)}">${esc(data.brand.phoneDisplay)}</a></li>
            <li>${esc(data.brand.hours)}</li>
            <li><a href="${esc(data.brand.instagram)}" target="_blank" rel="noopener">${esc(data.brand.instagramHandle)}</a></li>
          </ul>
        </div>
      </div>
      <div class="wrap footer__bottom">
        <span>© 2026 ${esc(data.brand.name)} · ${esc(data.brand.city)}</span>
        <span>${esc(data.brand.rating)} ★ · ${esc(data.brand.reviews)} відгуків Google</span>
      </div>
    </footer>`;

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "HairSalon",
  name: data.brand.name,
  description: data.meta.description,
  image: data.meta.ogImage,
  telephone: data.brand.phone,
  priceRange: "₴₴",
  address: {
    "@type": "PostalAddress",
    streetAddress: data.brand.address,
    addressLocality: data.brand.city,
    addressCountry: "UA",
  },
  openingHours: "Mo-Su 10:00-20:00",
  sameAs: [data.brand.instagram, data.brand.bookingUrl],
  hasMap: data.brand.mapsUrl,
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: data.brand.rating,
    reviewCount: data.brand.reviews,
    bestRating: "5",
  },
  makesOffer: data.price.flatMap((cat) =>
    cat.items.map((it) => ({
      "@type": "Offer",
      itemOffered: { "@type": "Service", name: it.name, category: cat.title },
      description: it.note,
    }))
  ),
};

/* ------------------------------------------------------------------- page */

const html = `<!DOCTYPE html>
<html lang="uk">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
  <title>${esc(data.meta.title)}</title>
  <meta name="description" content="${esc(data.meta.description)}" />
  <meta name="theme-color" content="#15171a" />

  <meta property="og:type" content="website" />
  <meta property="og:locale" content="uk_UA" />
  <meta property="og:title" content="${esc(data.meta.title)}" />
  <meta property="og:description" content="${esc(data.meta.description)}" />
  <meta property="og:image" content="${esc(data.meta.ogImage)}" />
  <meta name="twitter:card" content="summary_large_image" />

  <link rel="icon" href="media/brand/favicon.svg" type="image/svg+xml" />
${preloadFonts}
  <link rel="stylesheet" href="css/fonts.css" />
  <link rel="stylesheet" href="css/main.css" />
  <link rel="stylesheet" href="css/motion.css" />

  <script>document.documentElement.classList.add('js');</script>
  <script type="application/ld+json">${JSON.stringify(jsonLd)}</script>
</head>
<body>
  <a class="skip-link" href="#main">Перейти до змісту</a>

  <header class="header" data-header>
    <div class="wrap header__inner">
      ${brandmark()}
      <span class="brandmark__place">${esc(data.brand.place)}</span>

      <nav class="nav" aria-label="Основна навігація">
        <ul>
            ${navLinks}
        </ul>
      </nav>

      <div class="header__actions">
        <a class="header__phone mono" href="tel:${esc(data.brand.phone)}">${esc(data.brand.phoneDisplay)}</a>
        <a class="btn btn--sm" href="${esc(data.brand.bookingUrl)}" target="_blank" rel="noopener">Записатися</a>
        <details class="menu" data-menu>
          <summary aria-label="Меню"><span class="menu__bars"></span></summary>
          <nav class="menu__panel" aria-label="Мобільна навігація">
            ${data.nav.map((n) => `<a href="${esc(n.href)}">${esc(n.label)}</a>`).join("\n            ")}
            <a href="tel:${esc(data.brand.phone)}">${esc(data.brand.phoneDisplay)}</a>
          </nav>
        </details>
      </div>
    </div>
  </header>

  <main id="main">
${heroBlock}
${expertiseBlock}
${resultsBlock}
${priceBlock}
${mastersBlock}
${spaceBlock}
${trustBlock}
${founderBlock}
${bookingBlock}
${contactsBlock}
  </main>

${footerBlock}

  <nav class="dock" aria-label="Швидкі дії">
    <a class="btn" href="${esc(data.brand.bookingUrl)}" target="_blank" rel="noopener">Записатися онлайн</a>
    <a class="dock__call" href="tel:${esc(data.brand.phone)}" aria-label="Подзвонити ${esc(data.brand.phoneDisplay)}">${icon.phone}</a>
  </nav>

  <script src="js/app.js" defer></script>
</body>
</html>
`;

fs.writeFileSync(path.join(SITE, "index.html"), html);
console.log(`site/index.html · ${(html.length / 1024).toFixed(1)} KB · ${data.cases.length} cases · ${data.masters.length} masters`);
