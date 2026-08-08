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

  /* Reveal + neon brand light */
  const brand = document.querySelector("[data-neon-reveal]");
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
      { threshold: 0.18 }
    );
    els.forEach((el) => io.observe(el));

    if (brand) {
      window.setTimeout(() => brand.classList.add("is-lit"), 420);
      window.setTimeout(() => brand.classList.remove("is-lit"), 1800);
    }
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
      dock.classList.remove("is-visible");
      body.classList.remove("has-dock");
      return;
    }
    const heroGone = heroCta
      ? heroCta.getBoundingClientRect().bottom < 8
      : window.scrollY > window.innerHeight * 0.65;
    const bookingVisible = booking
      ? (() => {
          const r = booking.getBoundingClientRect();
          return r.top < window.innerHeight * 0.85 && r.bottom > 64;
        })()
      : false;
    const show = Boolean(heroGone && !bookingVisible);
    dock.hidden = !show;
    dock.classList.toggle("is-visible", show);
    body.classList.toggle("has-dock", show);
  };

  syncDock();
  window.addEventListener("scroll", syncDock, { passive: true });
  window.addEventListener("resize", syncDock);
  mqDesktop.addEventListener?.("change", syncDock);

  /* Pause ambient video when offscreen / reduced */
  const video = document.querySelector(".space__video");
  if (video) {
    if (reduced) {
      video.removeAttribute("autoplay");
      video.pause();
    } else {
      const vio = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              video.play().catch(() => {});
            } else {
              video.pause();
            }
          });
        },
        { threshold: 0.2 }
      );
      vio.observe(video);
    }
  }

  /* Before / After from cases.json */
  const fallbackCases = [
    {
      id: "curls",
      title: "Форма і гладкість",
      desc: "Текстура до/після · полірування",
      before: "media/ba/web/curls-before.jpg",
      after: "media/ba/web/curls-after.jpg",
      thumb: "media/ba/web/curls-after.jpg",
    },
  ];

  const initBa = (cases) => {
    const ba = document.querySelector("[data-ba]");
    if (!ba || !cases.length) return;

    const range = ba.querySelector("[data-ba-range]");
    const before = ba.querySelector("[data-ba-before]");
    const after = ba.querySelector("[data-ba-after]");
    const handle = ba.querySelector("[data-ba-handle]");
    const title = ba.querySelector("[data-ba-title]");
    const desc = ba.querySelector("[data-ba-desc]");
    const indexEl = ba.querySelector("[data-ba-index]");
    const totalEl = ba.querySelector("[data-ba-total]");
    const thumbsWrap = ba.querySelector("[data-ba-thumbs]");

    if (totalEl) totalEl.textContent = String(cases.length).padStart(2, "0");

    thumbsWrap.innerHTML = "";
    cases.forEach((c, i) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "ba__thumb" + (i === 0 ? " is-active" : "");
      btn.setAttribute("role", "tab");
      btn.setAttribute("aria-selected", String(i === 0));
      btn.dataset.case = String(i);
      btn.style.backgroundImage = `url("${c.thumb || c.after}")`;
      btn.innerHTML = `<span>${String(i + 1).padStart(2, "0")}</span>`;
      btn.setAttribute("aria-label", `${c.title}`);
      thumbsWrap.appendChild(btn);
    });

    const thumbs = [...thumbsWrap.querySelectorAll("[data-case]")];
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
      if (after) after.style.backgroundImage = `url("${c.after}")`;
      if (before) before.style.backgroundImage = `url("${c.before}")`;
      if (title) title.textContent = c.title;
      if (desc) desc.textContent = c.desc;
      if (indexEl) indexEl.textContent = String(i + 1).padStart(2, "0");
      thumbs.forEach((btn, idx) => {
        const on = idx === i;
        btn.classList.toggle("is-active", on);
        btn.setAttribute("aria-selected", String(on));
      });
      setPos(52);
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
            const seq = [38, 64, 52];
            let step = 0;
            const tick = () => {
              if (userTouched) return;
              setPos(seq[step]);
              step += 1;
              if (step < seq.length) window.setTimeout(tick, 420);
            };
            window.setTimeout(tick, 500);
          });
        },
        { threshold: 0.4 }
      );
      io.observe(ba);
    }
  };

  fetch("media/cases.json")
    .then((r) => r.json())
    .then((data) => initBa(Array.isArray(data) ? data : fallbackCases))
    .catch(() => initBa(fallbackCases));

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
      status.textContent = "Заявку прийнято. Адміністратор підтвердить час у відповіді.";
    }
    form.reset();
  });
})();
