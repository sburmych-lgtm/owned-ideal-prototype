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

  /* ------------------------------------------------------ salon video ----- */

  /**
   * Upgrades a poster to its salon clip, but only once the page has finished
   * its critical render and only when the surface is actually on screen. The
   * markup carries no <video> and no <source>, so nothing here is discoverable
   * by the preload scanner and nothing competes with LCP.
   *
   * Held back entirely under reduced motion or a metered connection — the
   * poster is the finished picture in those cases, not a placeholder.
   */
  const videoSurfaces = $$("[data-video]");

  const metered = () => {
    const c = navigator.connection;
    if (!c) return false;
    return Boolean(c.saveData) || /(^|-)2g$/.test(c.effectiveType || "");
  };

  const PAUSE_ICON =
    '<svg viewBox="0 0 12 12" aria-hidden="true" class="icon-pause"><rect x="1.5" y="1" width="3" height="10" rx="0.5"/><rect x="7.5" y="1" width="3" height="10" rx="0.5"/></svg>' +
    '<svg viewBox="0 0 12 12" aria-hidden="true" class="icon-play"><path d="M2.5 1.2 10.5 6l-8 4.8Z"/></svg>';

  if (videoSurfaces.length && !reduced.matches && !metered()) {
    const start = () => {
      videoSurfaces.forEach((surface) => {
        const base = surface.dataset.video;
        const loop = surface.dataset.videoMode === "loop";
        const poster = $(".media__poster", surface);
        let video = null;
        let failed = false;

        const build = () => {
          video = document.createElement("video");
          video.className = "media__video";
          video.muted = true;
          video.defaultMuted = true;
          video.playsInline = true;
          video.setAttribute("playsinline", "");
          video.setAttribute("aria-hidden", "true");
          video.setAttribute("tabindex", "-1");
          video.loop = loop;
          video.preload = "auto";
          if (poster) video.poster = poster.currentSrc || poster.src;

          [["webm", "video/webm"], ["mp4", "video/mp4"]].forEach(([ext, type]) => {
            const source = document.createElement("source");
            source.src = `${base}.${ext}`;
            source.type = type;
            video.appendChild(source);
          });

          video.addEventListener("playing", () => video.classList.add("is-ready"), { once: true });
          video.addEventListener("error", () => {
            failed = true;
            video.remove();
            video = null;
          });

          // Ahead of the caption so the clip never paints over the words.
          surface.insertBefore(video, poster ? poster.nextSibling : null);

          if (loop) addToggle();
        };

        const addToggle = () => {
          const button = document.createElement("button");
          button.type = "button";
          button.className = "media__toggle";
          button.setAttribute("aria-pressed", "false");
          const label = surface.dataset.videoLabel || "відео";
          button.setAttribute("aria-label", `Зупинити ${label}`);
          button.innerHTML = PAUSE_ICON;
          button.addEventListener("click", () => {
            if (!video) return;
            const paused = !video.paused;
            if (paused) video.pause();
            else video.play().catch(() => {});
            button.setAttribute("aria-pressed", String(paused));
            button.setAttribute("aria-label", `${paused ? "Відтворити" : "Зупинити"} ${label}`);
            surface.dataset.videoPaused = String(paused);
          });
          surface.appendChild(button);
        };

        if (!("IntersectionObserver" in window)) return;

        let spent = false;
        const io = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (!entry.isIntersecting) {
                if (video && !video.paused) video.pause();
                return;
              }
              if (failed || spent || surface.dataset.videoPaused === "true") return;
              if (!video) {
                build();
                // A reveal runs once per visit; scrolling back must not re-trigger it.
                if (!loop && video) {
                  video.addEventListener("ended", () => {
                    spent = true;
                    io.unobserve(surface);
                  });
                }
              }
              if (!video) return;
              const attempt = video.play();
              if (attempt && attempt.catch) attempt.catch(() => {});
            });
          },
          { threshold: 0.25 }
        );
        io.observe(surface);
      });

      // A user who turns reduced motion on mid-visit gets the stills back.
      const stop = () => {
        $$(".media__video").forEach((v) => {
          v.pause();
          v.classList.remove("is-ready");
        });
        $$(".media__toggle").forEach((b) => b.remove());
      };
      if (reduced.addEventListener) {
        reduced.addEventListener("change", (e) => e.matches && stop());
      }
    };

    // Only after load, and then only when the main thread is free.
    const schedule = () =>
      window.requestIdleCallback
        ? window.requestIdleCallback(start, { timeout: 2500 })
        : window.setTimeout(start, 400);

    if (document.readyState === "complete") schedule();
    else window.addEventListener("load", schedule, { once: true });
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
