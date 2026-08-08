(() => {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const mqDesktop = window.matchMedia("(min-width: 900px)");
  const body = document.body;
  const hero = document.querySelector("[data-hero]");

  /* ---------- Boot: authored hero entrance ---------- */
  let booted = false;
  const boot = () => {
    if (booted) return;
    booted = true;
    body.classList.remove("is-loading");
    body.classList.add("is-booted");
  };
  if (reduced) {
    boot();
  } else if (document.readyState === "complete") {
    requestAnimationFrame(() => requestAnimationFrame(boot));
  } else {
    window.addEventListener("load", () => requestAnimationFrame(boot), { once: true });
    window.setTimeout(boot, 900);
  }

  /* Subtle hero depth on scroll — transform only, desktop calm */
  if (!reduced && hero) {
    let ticking = false;
    const onScrollHero = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const y = window.scrollY;
        hero.classList.toggle("is-scrolled", y > 40 && y < window.innerHeight);
        ticking = false;
      });
    };
    window.addEventListener("scroll", onScrollHero, { passive: true });
  }

  /* ---------- Mobile menu ---------- */
  const toggle = document.querySelector("[data-nav-toggle]");
  const menu = document.querySelector("[data-mobile-menu]");
  const setMenu = (open) => {
    if (!toggle || !menu) return;
    toggle.setAttribute("aria-expanded", String(open));
    menu.classList.toggle("is-open", open);
    if (open) menu.removeAttribute("hidden");
    else {
      window.setTimeout(() => {
        if (!menu.classList.contains("is-open")) menu.setAttribute("hidden", "");
      }, reduced ? 0 : 280);
      if (reduced) menu.setAttribute("hidden", "");
    }
  };
  if (toggle && menu) {
    if (!menu.hasAttribute("hidden")) menu.setAttribute("hidden", "");
    toggle.addEventListener("click", () => {
      const open = toggle.getAttribute("aria-expanded") !== "true";
      setMenu(open);
    });
    menu.querySelectorAll("a").forEach((a) => {
      a.addEventListener("click", () => setMenu(false));
    });
  }

  /* ---------- Scroll reveals (Motion inView pattern via IO) ---------- */
  const revealEls = document.querySelectorAll("[data-reveal]");
  if (reduced) {
    revealEls.forEach((el) => el.classList.add("is-in"));
  } else {
    const io = new IntersectionObserver(
      (entries) => {
        for (let i = 0; i < entries.length; i += 1) {
          const entry = entries[i];
          if (!entry.isIntersecting) continue;
          entry.target.classList.add("is-in");
          io.unobserve(entry.target);
        }
      },
      { threshold: 0.16, rootMargin: "0px 0px -8% 0px" }
    );
    revealEls.forEach((el) => io.observe(el));
  }

  /* ---------- Sticky dock (mobile) ---------- */
  const dock = document.querySelector("[data-dock]");
  const heroCta = document.querySelector("[data-hero-cta]");
  const booking = document.querySelector("[data-booking]");

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

  /* ---------- Ambient video ---------- */
  const video = document.querySelector(".space__video");
  if (video) {
    if (reduced) {
      video.removeAttribute("autoplay");
      video.pause();
    } else {
      const vio = new IntersectionObserver(
        (entries) => {
          for (let i = 0; i < entries.length; i += 1) {
            if (entries[i].isIntersecting) video.play().catch(() => {});
            else video.pause();
          }
        },
        { threshold: 0.2 }
      );
      vio.observe(video);
    }
  }

  /* ---------- Before / After — signature interaction ---------- */
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

    const stage = ba.querySelector("[data-ba-stage]");
    const range = ba.querySelector("[data-ba-range]");
    const before = ba.querySelector("[data-ba-before]");
    const after = ba.querySelector("[data-ba-after]");
    const handle = ba.querySelector("[data-ba-handle]");
    const title = ba.querySelector("[data-ba-title]");
    const desc = ba.querySelector("[data-ba-desc]");
    const indexEl = ba.querySelector("[data-ba-index]");
    const totalEl = ba.querySelector("[data-ba-total]");
    const thumbsWrap = ba.querySelector("[data-ba-thumbs]");
    const meta = ba.querySelector(".ba__meta");

    if (totalEl) totalEl.textContent = String(cases.length).padStart(2, "0");

    thumbsWrap.innerHTML = "";
    for (let i = 0; i < cases.length; i += 1) {
      const c = cases[i];
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "ba__thumb" + (i === 0 ? " is-active" : "");
      btn.setAttribute("role", "tab");
      btn.setAttribute("aria-selected", String(i === 0));
      btn.dataset.case = String(i);
      btn.style.backgroundImage = `url("${c.thumb || c.after}")`;
      btn.innerHTML = `<span>${String(i + 1).padStart(2, "0")}</span>`;
      btn.setAttribute("aria-label", c.title);
      thumbsWrap.appendChild(btn);
    }

    const thumbs = thumbsWrap.querySelectorAll("[data-case]");
    let userTouched = false;
    let demoPlayed = false;
    let pos = 52;
    let raf = 0;

    const paint = () => {
      raf = 0;
      if (before) before.style.setProperty("--pos", `${pos}%`);
      if (handle) handle.style.setProperty("--pos", `${pos}%`);
      if (range && Number(range.value) !== Math.round(pos)) range.value = String(Math.round(pos));
    };

    const setPos = (value, immediate) => {
      pos = Math.max(0, Math.min(100, Number(value)));
      if (immediate || reduced) {
        paint();
        return;
      }
      if (!raf) raf = requestAnimationFrame(paint);
    };

    const preload = (src) =>
      new Promise((resolve) => {
        const img = new Image();
        img.onload = img.onerror = () => resolve();
        img.src = src;
      });

    const selectCase = async (i) => {
      const c = cases[i];
      if (!c) return;
      if (stage) stage.classList.add("is-switching");
      if (meta) meta.classList.add("is-swap");

      await Promise.all([preload(c.before), preload(c.after)]);

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
      setPos(52, true);

      window.setTimeout(() => {
        if (stage) stage.classList.remove("is-switching");
        if (meta) meta.classList.remove("is-swap");
      }, reduced ? 0 : 160);
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

    /* Pointer / touch drag directly on stage */
    if (stage) {
      let dragging = false;
      const posFromEvent = (clientX) => {
        const rect = stage.getBoundingClientRect();
        if (!rect.width) return pos;
        return ((clientX - rect.left) / rect.width) * 100;
      };
      const onDown = (e) => {
        if (e.target === range) return;
        dragging = true;
        userTouched = true;
        stage.classList.add("is-dragging");
        const x = e.touches ? e.touches[0].clientX : e.clientX;
        setPos(posFromEvent(x));
      };
      const onMove = (e) => {
        if (!dragging) return;
        const x = e.touches ? e.touches[0].clientX : e.clientX;
        setPos(posFromEvent(x));
        if (e.cancelable) e.preventDefault();
      };
      const onUp = () => {
        dragging = false;
        stage.classList.remove("is-dragging");
      };
      stage.addEventListener("pointerdown", onDown);
      window.addEventListener("pointermove", onMove, { passive: false });
      window.addEventListener("pointerup", onUp);
      stage.addEventListener("touchstart", onDown, { passive: true });
      stage.addEventListener("touchmove", onMove, { passive: false });
      window.addEventListener("touchend", onUp);
    }

    selectCase(0);

    if (!reduced && range) {
      const demoIo = new IntersectionObserver(
        (entries) => {
          for (let i = 0; i < entries.length; i += 1) {
            if (!entries[i].isIntersecting || demoPlayed || userTouched) continue;
            demoPlayed = true;
            const seq = [36, 68, 52];
            let step = 0;
            const tick = () => {
              if (userTouched) return;
              setPos(seq[step]);
              step += 1;
              if (step < seq.length) window.setTimeout(tick, 380);
            };
            window.setTimeout(tick, 420);
          }
        },
        { threshold: 0.42 }
      );
      demoIo.observe(ba);
    }
  };

  fetch("media/cases.json")
    .then((r) => r.json())
    .then((data) => initBa(Array.isArray(data) ? data : fallbackCases))
    .catch(() => initBa(fallbackCases));

  /* ---------- Form demo ---------- */
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
