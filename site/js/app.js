/* ==========================================================================
   OWNED — progressive enhancement.
   Everything here is optional: with JS disabled the page still shows every
   case, every price row and every master, and every action stays reachable.
   ========================================================================== */

(() => {
  "use strict";

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");

  /* ------------------------------------------------------------- header -- */

  const header = $("[data-header]");
  if (header) {
    const onScroll = () => {
      header.dataset.stuck = window.scrollY > 8 ? "true" : "false";
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* --------------------------------------------------------------- menu -- */

  const menu = $("[data-menu]");
  if (menu) {
    const close = () => menu.removeAttribute("open");
    $$("a", menu).forEach((a) => a.addEventListener("click", close));
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && menu.hasAttribute("open")) {
        close();
        $("summary", menu).focus();
      }
    });
    document.addEventListener("click", (e) => {
      if (menu.hasAttribute("open") && !menu.contains(e.target)) close();
    });
  }

  /* ------------------------------------------------ nav current section -- */

  const navLinks = $$('.nav a[href^="#"]');
  const sections = navLinks
    .map((a) => document.getElementById(a.getAttribute("href").slice(1)))
    .filter(Boolean);

  if (sections.length && "IntersectionObserver" in window) {
    const spy = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          navLinks.forEach((a) =>
            a.setAttribute(
              "aria-current",
              a.getAttribute("href") === `#${entry.target.id}` ? "true" : "false"
            )
          );
        });
      },
      { rootMargin: "-45% 0px -50% 0px" }
    );
    sections.forEach((s) => spy.observe(s));
  }

  /* ------------------------------------------------------ reveal on view -- */

  const revealables = $$("[data-reveal]");
  if (revealables.length) {
    if (!("IntersectionObserver" in window) || reduced.matches) {
      revealables.forEach((el) => el.classList.add("is-in"));
    } else {
      const io = new IntersectionObserver(
        (entries, obs) => {
          entries.forEach((entry) => {
            // A fast scroll can carry an element past the viewport between two
            // observer ticks — reveal those too rather than stranding them at
            // opacity 0.
            const passed = entry.boundingClientRect.top <= 0;
            if (!entry.isIntersecting && !passed) return;
            entry.target.classList.add("is-in");
            obs.unobserve(entry.target);
          });
        },
        { rootMargin: "0px 0px -12% 0px", threshold: [0, 0.08] }
      );
      revealables.forEach((el) => io.observe(el));
    }
  }

  /* ------------------------------------------------- before / after slider */

  $$("[data-compare]").forEach((compare) => {
    const range = $("[data-range]", compare);
    if (!range) return;

    const apply = (value) => compare.style.setProperty("--pos", `${value}%`);
    apply(range.value);

    const stopHint = () => compare.removeAttribute("data-hint");

    range.addEventListener("input", () => {
      stopHint();
      apply(range.value);
    });
    range.addEventListener("pointerdown", stopHint);

    // The range input spans the whole frame but is pointer-transparent, so the
    // container drives dragging and the input stays a keyboard control.
    let dragging = false;
    const setFromPointer = (event) => {
      const rect = compare.getBoundingClientRect();
      const pct = Math.min(100, Math.max(0, ((event.clientX - rect.left) / rect.width) * 100));
      range.value = String(Math.round(pct));
      apply(range.value);
    };

    compare.addEventListener("pointerdown", (event) => {
      event.preventDefault();
      dragging = true;
      stopHint();
      range.focus({ preventScroll: true });
      setFromPointer(event);
    });
    window.addEventListener("pointermove", (event) => {
      if (dragging) setFromPointer(event);
    });
    window.addEventListener("pointerup", () => {
      dragging = false;
    });
  });

  /* ---------------------------------------------------- gallery switching -- */

  const cases = $$("[data-case]");
  const thumbs = $$("[data-thumb]");
  const filterButtons = $$("[data-filter]");
  const counter = $("[data-counter]");
  const empty = $("[data-empty]");

  if (cases.length) {
    let filter = "all";

    const visible = () =>
      cases.filter((c) => filter === "all" || c.dataset.category === filter);

    const show = (id, { focusStage = false } = {}) => {
      cases.forEach((c) => (c.dataset.active = c.dataset.case === id ? "true" : "false"));
      thumbs.forEach((t) =>
        t.setAttribute("aria-pressed", t.dataset.thumb === id ? "true" : "false")
      );

      const list = visible();
      const index = list.findIndex((c) => c.dataset.case === id);
      if (counter) {
        counter.textContent = list.length
          ? `${String(index + 1).padStart(2, "0")} / ${String(list.length).padStart(2, "0")}`
          : "";
      }
      if (focusStage) {
        const active = cases.find((c) => c.dataset.case === id);
        const range = active && $("[data-range]", active);
        if (range) range.focus({ preventScroll: true });
      }
    };

    const applyFilter = (next) => {
      filter = next;
      filterButtons.forEach((b) =>
        b.setAttribute("aria-pressed", b.dataset.filter === next ? "true" : "false")
      );
      thumbs.forEach((t) => {
        const match = next === "all" || t.dataset.category === next;
        t.hidden = !match;
      });

      const list = visible();
      if (empty) empty.hidden = list.length > 0;
      cases.forEach((c) => (c.dataset.active = "false"));
      if (list.length) show(list[0].dataset.case);
      else if (counter) counter.textContent = "";
    };

    thumbs.forEach((t) =>
      t.addEventListener("click", () => show(t.dataset.thumb, { focusStage: true }))
    );
    filterButtons.forEach((b) => b.addEventListener("click", () => applyFilter(b.dataset.filter)));

    // "Дивитись роботи напрямку" links pre-select the matching filter.
    $$("[data-filter-jump]").forEach((link) => {
      link.addEventListener("click", () => {
        const wanted = link.dataset.filterJump;
        if (filterButtons.some((b) => b.dataset.filter === wanted)) applyFilter(wanted);
      });
    });

    applyFilter("all");
  }

  /* ------------------------------------------------------- booking helper -- */

  const form = $("[data-form]");
  if (form) {
    const out = $("[data-form-out]", form);
    const status = $("[data-form-status]", form);

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const values = Object.fromEntries(new FormData(form).entries());
      const name = (values.name || "").trim();
      const phone = (values.phone || "").trim();

      if (!name || !phone) {
        status.textContent = "Додайте імʼя та телефон — інакше нам не буде куди відповісти.";
        (name ? $("#f-phone", form) : $("#f-name", form)).focus();
        return;
      }

      const lines = [
        `Вітаю! Мене звати ${name}.`,
        `Хочу записатися: ${values.service}.`,
        `Зручний час: ${values.when}.`,
        (values.note || "").trim() ? `Про волосся: ${values.note.trim()}` : "",
        `Телефон для звʼязку: ${phone}`,
      ].filter(Boolean);

      const message = lines.join("\n");
      out.hidden = false;
      out.textContent = message;

      const done = (note) => {
        status.textContent = note;
      };

      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard
          .writeText(message)
          .then(() => done("Повідомлення скопійовано — вставте його в Direct або продиктуйте по телефону."))
          .catch(() => done("Повідомлення готове — скопіюйте його та надішліть нам."));
      } else {
        done("Повідомлення готове — скопіюйте його та надішліть нам.");
      }
    });
  }
})();
