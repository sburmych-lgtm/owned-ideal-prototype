(() => {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const mqDesktop = window.matchMedia("(min-width: 900px)");

  /* Mobile menu */
  const toggle = document.querySelector("[data-nav-toggle]");
  const menu = document.querySelector("[data-mobile-menu]");
  if (toggle && menu) {
    toggle.addEventListener("click", () => {
      const open = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", String(!open));
      menu.hidden = open;
    });
    menu.querySelectorAll("a").forEach((a) => {
      a.addEventListener("click", () => {
        toggle.setAttribute("aria-expanded", "false");
        menu.hidden = true;
      });
    });
  }

  /* Reveal */
  if (!reduced) {
    const els = document.querySelectorAll("[data-reveal]");
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("is-in");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.2 }
    );
    els.forEach((el) => io.observe(el));
  } else {
    document.querySelectorAll("[data-reveal]").forEach((el) => el.classList.add("is-in"));
  }

  /* Sticky dock (mobile only) */
  const dock = document.querySelector("[data-dock]");
  const heroCta = document.querySelector("[data-hero-cta]");
  const booking = document.querySelector("[data-booking]");
  const body = document.body;

  const syncDock = () => {
    if (!dock) return;
    if (mqDesktop.matches) {
      dock.hidden = true;
      body.classList.remove("has-dock");
      return;
    }
    const heroGone = heroCta
      ? heroCta.getBoundingClientRect().bottom < 0
      : window.scrollY > window.innerHeight * 0.55;
    const bookingVisible = booking
      ? (() => {
          const r = booking.getBoundingClientRect();
          return r.top < window.innerHeight * 0.75 && r.bottom > 80;
        })()
      : false;
    const show = heroGone && !bookingVisible;
    dock.hidden = !show;
    body.classList.toggle("has-dock", show);
  };

  syncDock();
  window.addEventListener("scroll", syncDock, { passive: true });
  window.addEventListener("resize", syncDock);
  mqDesktop.addEventListener?.("change", syncDock);

  /* Before / After */
  const cases = [
    {
      title: "Кучерява форма",
      desc: "Стрижка під текстуру · орієнтовно 1 візит",
    },
    {
      title: "Grey blending",
      desc: "Інтеграція сивини · зазвичай 1–2 візити",
    },
    {
      title: "Складний колір",
      desc: "Airtouch / balayage · план візитів індивідуальний",
    },
    {
      title: "Вихід із темного",
      desc: "Поетапне освітлення · чесний прогноз тону",
    },
    {
      title: "Манікюр",
      desc: "Форма + покриття · secondary beauty",
    },
    {
      title: "Брови / вії",
      desc: "Ламінування та форма · secondary beauty",
    },
  ];

  const ba = document.querySelector("[data-ba]");
  if (ba) {
    const range = ba.querySelector("[data-ba-range]");
    const before = ba.querySelector("[data-ba-before]");
    const handle = ba.querySelector("[data-ba-handle]");
    const title = ba.querySelector("[data-ba-title]");
    const desc = ba.querySelector("[data-ba-desc]");
    const indexEl = ba.querySelector("[data-ba-index]");
    const thumbs = [...ba.querySelectorAll("[data-case]")];
    let userTouched = false;
    let demoPlayed = false;

    const setPos = (value) => {
      const v = Math.max(0, Math.min(100, Number(value)));
      if (before) before.style.setProperty("--pos", `${v}%`);
      if (handle) handle.style.setProperty("--pos", `${v}%`);
      if (range && Number(range.value) !== v) range.value = String(v);
    };

    const selectCase = (i) => {
      const c = cases[i];
      if (!c) return;
      ba.dataset.caseId = String(i);
      if (title) title.textContent = c.title;
      if (desc) desc.textContent = c.desc;
      if (indexEl) indexEl.textContent = String(i + 1).padStart(2, "0");
      thumbs.forEach((btn, idx) => {
        const on = idx === i;
        btn.classList.toggle("is-active", on);
        btn.setAttribute("aria-selected", String(on));
      });
      setPos(50);
    };

    thumbs.forEach((btn) => {
      btn.addEventListener("click", () => {
        userTouched = true;
        selectCase(Number(btn.dataset.case));
      });
    });

    range?.addEventListener("input", () => {
      userTouched = true;
      setPos(range.value);
    });

    selectCase(0);

    if (!reduced && range) {
      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting || demoPlayed || userTouched) return;
            demoPlayed = true;
            const seq = [46, 56, 50];
            let step = 0;
            const tick = () => {
              if (userTouched) return;
              setPos(seq[step]);
              step += 1;
              if (step < seq.length) window.setTimeout(tick, 450);
            };
            window.setTimeout(tick, 800);
          });
        },
        { threshold: 0.45 }
      );
      io.observe(ba);
    }
  }

  /* Form demo */
  const form = document.querySelector("[data-form]");
  const status = document.querySelector("[data-form-status]");
  form?.addEventListener("submit", (e) => {
    e.preventDefault();
    const data = new FormData(form);
    const name = String(data.get("name") || "").trim();
    const phone = String(data.get("phone") || "").trim();
    const service = String(data.get("service") || "").trim();
    if (!name || !phone || !service) {
      if (status) status.textContent = "Заповніть ім’я, телефон і напрям.";
      return;
    }
    if (status) {
      status.textContent =
        "Дякуємо. У повному сайті заявка піде адміністратору; тут — демо-стан.";
    }
    form.reset();
  });
})();
