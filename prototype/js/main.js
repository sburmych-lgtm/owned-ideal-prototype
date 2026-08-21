/* ==========================================================================
   OWNED — редизайн v4 · поведінка
   Без залежностей. Усе прогресивно: без JS сторінка лишається читабельною
   і придатною для запису (телефон, Instagram, онлайн-запис).
   ========================================================================== */
(function () {
  'use strict';

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $  = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* ---------- 1. Шапка: суцільний фон після героя ---------- */
  var bar = $('[data-bar]');
  var hero = $('.hero');

  function syncBar() {
    if (!bar) return;
    var past = window.scrollY > (hero ? Math.min(hero.offsetHeight - 120, 420) : 80);
    bar.classList.toggle('is-solid', past);
  }

  /* ---------- 2. Мобільне меню ---------- */
  var burger = $('[data-burger]');
  var drawer = $('[data-drawer]');

  function setDrawer(open) {
    if (!burger || !drawer) return;
    burger.setAttribute('aria-expanded', String(open));
    drawer.hidden = !open;
    document.body.style.overflow = open ? 'hidden' : '';
    if (open) bar.classList.add('is-solid'); else syncBar();
  }

  if (burger && drawer) {
    burger.addEventListener('click', function () {
      setDrawer(burger.getAttribute('aria-expanded') !== 'true');
    });
    drawer.addEventListener('click', function (e) {
      if (e.target.closest('a')) setDrawer(false);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && burger.getAttribute('aria-expanded') === 'true') {
        setDrawer(false);
        burger.focus();
      }
    });
    window.addEventListener('resize', function () {
      if (window.innerWidth >= 1024) setDrawer(false);
    });
  }

  /* ---------- 3. Поява секцій (motion 3) ---------- */
  var revealables = $$('.reveal');
  if (reduced || !('IntersectionObserver' in window)) {
    revealables.forEach(function (el) { el.classList.add('is-in'); });
  } else {
    var revealIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          revealIO.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    revealables.forEach(function (el) { revealIO.observe(el); });
  }

  /* ---------- 4. Порівняння «до / після» ---------- */
  var baFrame  = $('[data-compare]');
  var baRange  = $('[data-ba-range]');
  var baClip   = $('[data-ba-clip]');
  var baLine   = $('[data-ba-line]');
  var baBefore = $('[data-ba-before]');
  var baAfter  = $('[data-ba-after]');
  var baCap    = $('[data-ba-caption]');
  var touched  = false;

  function setSplit(pct) {
    var v = Math.max(0, Math.min(100, pct));
    if (baClip) baClip.style.clipPath = 'inset(0 0 0 ' + v + '%)';
    if (baLine) baLine.style.left = v + '%';
  }

  if (baRange && baFrame) {
    setSplit(Number(baRange.value));

    baRange.addEventListener('input', function () {
      setSplit(Number(baRange.value));
      if (!touched) {
        touched = true;
        baFrame.classList.remove('is-hinting');
      }
    });

    /* підказка-помах один раз, коли блок уперше видно */
    if (!reduced && 'IntersectionObserver' in window) {
      var hintIO = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting && !touched) {
            baFrame.classList.add('is-hinting');
            setTimeout(function () { baFrame.classList.remove('is-hinting'); }, 1600);
          }
          hintIO.unobserve(entry.target);
        });
      }, { threshold: 0.55 });
      hintIO.observe(baFrame);
    }
  }

  /* ---------- 5. Перемикач робіт ---------- */
  var caseBtns = $$('[data-case]');
  var meta = {
    cat:   $('[data-ba-cat]'),
    title: $('[data-ba-title]'),
    note:  $('[data-ba-note]'),
    dur:   $('[data-ba-dur]'),
    price: $('[data-ba-price]'),
    count: $('[data-ba-count]')
  };

  function pickCase(btn, index) {
    if (!btn) return;
    caseBtns.forEach(function (b) {
      var on = b === btn;
      b.classList.toggle('is-on', on);
      b.setAttribute('aria-pressed', String(on));
    });

    var title = btn.dataset.title;
    if (baBefore) { baBefore.src = btn.dataset.before; baBefore.alt = title + ' — до'; }
    if (baAfter)  { baAfter.src  = btn.dataset.after;  baAfter.alt  = title + ' — після'; }

    if (meta.cat)   meta.cat.textContent   = btn.dataset.cat;
    if (meta.title) meta.title.textContent = title;
    if (meta.note)  meta.note.textContent  = btn.dataset.note;
    if (meta.dur)   meta.dur.textContent   = btn.dataset.dur;
    if (meta.price) meta.price.textContent = btn.dataset.price;
    if (meta.count) meta.count.textContent = (index + 1) + ' / ' + caseBtns.length;

    if (baRange) baRange.value = 50;
    setSplit(50);
    if (baCap) baCap.textContent = 'Перетягніть смугу або скористайтесь стрілками ← →';
  }

  caseBtns.forEach(function (btn, i) {
    btn.addEventListener('click', function () { pickCase(btn, i); });
    btn.addEventListener('keydown', function (e) {
      var next = null;
      if (e.key === 'ArrowRight') next = caseBtns[(i + 1) % caseBtns.length];
      if (e.key === 'ArrowLeft')  next = caseBtns[(i - 1 + caseBtns.length) % caseBtns.length];
      if (next) { e.preventDefault(); next.focus(); next.click(); }
    });
  });

  /* ---------- 6. Липка кнопка запису (мобільна) ---------- */
  var dock = $('[data-dock]');
  var booking = $('#booking');

  function syncDock() {
    if (!dock) return;
    var pastHero = window.scrollY > (hero ? hero.offsetHeight * 0.72 : 300);
    var inBooking = false;
    if (booking) {
      var r = booking.getBoundingClientRect();
      inBooking = r.top < window.innerHeight * 0.85 && r.bottom > 0;
    }
    dock.classList.toggle('is-up', pastHero && !inBooking);
  }

  /* ---------- 7. Активний пункт навігації ---------- */
  var navLinks = $$('.nav a');
  var sections = navLinks
    .map(function (a) { return document.querySelector(a.getAttribute('href')); })
    .filter(Boolean);

  if (sections.length && 'IntersectionObserver' in window) {
    var navIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        navLinks.forEach(function (a) {
          a.classList.toggle('is-here', a.getAttribute('href') === '#' + entry.target.id);
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach(function (s) { navIO.observe(s); });
  }

  /* ---------- 8. Форма запису (демо, без бекенду) ---------- */
  var form = $('[data-form]');
  if (form) {
    var status = $('[data-form-status]');

    var showError = function (input, show) {
      var field = input.closest('.field');
      var err = $('[data-err-for="' + input.id + '"]');
      if (field) field.classList.toggle('is-bad', show);
      if (err) err.hidden = !show;
      input.setAttribute('aria-invalid', String(show));
    };

    $$('input[required]', form).forEach(function (input) {
      input.addEventListener('input', function () {
        if (input.value.trim()) showError(input, false);
      });
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var bad = null;

      $$('input[required]', form).forEach(function (input) {
        var empty = !input.value.trim();
        var badTel = input.type === 'tel' && !empty &&
          (input.value.replace(/\D/g, '').length < 9);
        showError(input, empty || badTel);
        if ((empty || badTel) && !bad) bad = input;
      });

      if (bad) {
        if (status) { status.textContent = 'Перевірте, будь ласка, підсвічені поля.'; status.classList.remove('is-ok'); }
        bad.focus();
        return;
      }

      if (status) {
        status.textContent = 'Це демо-прототип: заявка не надсилається. Для реального запису — 097 148 45 96 або онлайн-запис.';
        status.classList.add('is-ok');
      }
    });
  }

  /* ---------- 9. Один слухач прокрутки на все ---------- */
  var ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(function () {
      syncBar();
      syncDock();
      ticking = false;
    });
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  syncBar();
  syncDock();
})();
