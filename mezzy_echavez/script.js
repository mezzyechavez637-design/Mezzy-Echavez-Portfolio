/* Progressive enhancement. Every page keeps its core text and links when JavaScript is off. */
(() => {
  "use strict";
  const root = document.documentElement;
  const site = window.SITE || {};
  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];
  const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  let reduceMotion = motionQuery.matches;
  motionQuery.addEventListener?.("change", (event) => { reduceMotion = event.matches; });
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
  const EASE = "cubic-bezier(.2,.75,.25,1)";
  const THEME_KEY = "mezzy-portfolio-theme-v1";

  const safeRead = (key) => { try { return window.localStorage.getItem(key); } catch { return null; } };
  const safeWrite = (key, value) => { try { window.localStorage.setItem(key, value); } catch { /* storage may be blocked */ } };
  const safeRemove = (key) => { try { window.localStorage.removeItem(key); } catch { /* nothing to remove */ } };
  const debounce = (fn, wait) => { let id; return (...args) => { clearTimeout(id); id = setTimeout(() => fn(...args), wait); }; };

  // ───────── Toast ─────────
  let toastEl, toastTimer;
  const toast = (message) => {
    if (!toastEl) {
      toastEl = document.createElement("div");
      toastEl.className = "toast";
      toastEl.setAttribute("role", "status");
      toastEl.setAttribute("aria-live", "polite");
      document.body.append(toastEl);
    }
    toastEl.textContent = message;
    requestAnimationFrame(() => toastEl.classList.add("is-on"));
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove("is-on"), 2400);
  };

  // ───────── Theme (circular reveal where View Transitions exist, soft crossfade elsewhere) ─────────
  const themeButton = $(".theme-toggle");
  const paintTheme = (theme) => {
    root.dataset.theme = theme;
    const light = theme === "light";
    if (themeButton) {
      themeButton.setAttribute("aria-pressed", String(light));
      themeButton.setAttribute("aria-label", `Switch to ${light ? "dark" : "light"} mode`);
      const label = $("[data-theme-label]", themeButton);
      if (label) label.textContent = light ? "Dark" : "Light";
      const icon = $(".theme-icon", themeButton);
      if (icon) icon.textContent = light ? "☾" : "☼";
    }
    $('meta[name="theme-color"]')?.setAttribute("content", light ? "#fcfbfb" : "#09090b");
  };
  paintTheme(root.dataset.theme === "light" ? "light" : "dark");
  themeButton?.addEventListener("click", () => {
    const next = root.dataset.theme === "dark" ? "light" : "dark";
    safeWrite(THEME_KEY, next);
    if (!reduceMotion && typeof document.startViewTransition === "function") {
      const box = themeButton.getBoundingClientRect();
      const x = box.left + box.width / 2;
      const y = box.top + box.height / 2;
      const radius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
      root.classList.add("theme-vt");
      const transition = document.startViewTransition(() => paintTheme(next));
      transition.ready.then(() => {
        root.animate({ clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
          { duration: 650, easing: EASE, pseudoElement: "::view-transition-new(root)" });
      }).catch(() => {});
      transition.finished.finally(() => root.classList.remove("theme-vt"));
    } else {
      if (!reduceMotion) { root.classList.add("theme-fade"); setTimeout(() => root.classList.remove("theme-fade"), 450); }
      paintTheme(next);
    }
  });
  window.addEventListener("storage", (event) => { if (event.key === THEME_KEY) paintTheme(event.newValue === "light" ? "light" : "dark"); });

  // ───────── Header: solid bar + progress line on scroll ─────────
  const header = $("#site-header");
  if (header) {
    const bar = document.createElement("span");
    bar.className = "scroll-progress";
    bar.setAttribute("aria-hidden", "true");
    header.append(bar);
    let queued = false;
    const update = () => {
      queued = false;
      const y = window.scrollY;
      header.classList.toggle("is-scrolled", y > 8);
      const max = root.scrollHeight - window.innerHeight;
      header.style.setProperty("--progress", max > 0 ? Math.min(1, y / max).toFixed(4) : "0");
    };
    window.addEventListener("scroll", () => { if (!queued) { queued = true; requestAnimationFrame(update); } }, { passive: true });
    window.addEventListener("resize", update, { passive: true });
    window.addEventListener("pageshow", update);
    update();
  }

  // ───────── Navigation: sliding pill (desktop) and animated drawer (mobile) ─────────
  const navList = $("#primary-nav");
  const menuButton = $(".nav-toggle");
  const mobileQuery = window.matchMedia("(max-width: 760px)");
  if (navList) {
    const pill = document.createElement("span");
    pill.className = "nav-pill";
    pill.setAttribute("aria-hidden", "true");
    navList.prepend(pill);
    const links = $$("a:not(.nav-cta)", navList);
    const current = links.find((link) => link.getAttribute("aria-current") === "page") || null;
    const place = (link, instant = false) => {
      if (!link || mobileQuery.matches) { pill.classList.remove("is-on"); return; }
      const item = link.closest("li");
      if (instant) pill.style.transition = "none";
      pill.style.width = `${item.offsetWidth}px`;
      pill.style.height = `${item.offsetHeight}px`;
      pill.style.transform = `translate(${item.offsetLeft}px, ${item.offsetTop}px)`;
      pill.classList.add("is-on");
      if (instant) { void pill.offsetWidth; pill.style.transition = ""; }
    };
    links.forEach((link) => {
      link.addEventListener("pointerenter", () => place(link));
      link.addEventListener("focus", () => place(link));
    });
    navList.addEventListener("pointerleave", () => place(current));
    navList.addEventListener("focusout", (event) => { if (!navList.contains(event.relatedTarget)) place(current); });
    place(current, true);
    window.addEventListener("resize", debounce(() => place(current, true), 120));
    document.fonts?.ready.then(() => place(current, true));
  }
  if (menuButton && navList) {
    const setMenu = (open) => {
      navList.classList.toggle("is-open", open);
      menuButton.setAttribute("aria-expanded", String(open));
      menuButton.setAttribute("aria-label", open ? "Close navigation" : "Open navigation");
    };
    menuButton.addEventListener("click", () => setMenu(menuButton.getAttribute("aria-expanded") !== "true"));
    $$("a", navList).forEach((link) => link.addEventListener("click", () => setMenu(false)));
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && navList.classList.contains("is-open")) { setMenu(false); menuButton.focus(); }
    });
    document.addEventListener("click", (event) => {
      if (!navList.contains(event.target) && !menuButton.contains(event.target)) setMenu(false);
    });
    mobileQuery.addEventListener?.("change", () => setMenu(false));
  }

  // ───────── Instant-feeling page loads: prefetch a page when the pointer is about to use it ─────────
  if (/^https?:$/.test(location.protocol)) {
    const seen = new Set();
    const prefetch = (event) => {
      const link = event.target.closest?.("a[href]");
      if (!link || link.target || link.origin !== location.origin || !link.pathname.endsWith(".html") || link.pathname === location.pathname || seen.has(link.href)) return;
      seen.add(link.href);
      const tag = document.createElement("link");
      tag.rel = "prefetch";
      tag.href = link.href;
      document.head.append(tag);
    };
    document.addEventListener("pointerover", prefetch, { passive: true });
    document.addEventListener("touchstart", prefetch, { passive: true });
  }

  // ───────── Reveal on scroll (staggered per batch) ─────────
  const revealItems = $$(".reveal");
  const showNow = (item) => { item.classList.add("is-visible", "is-settled"); };
  if (reduceMotion || !("IntersectionObserver" in window)) {
    revealItems.forEach((item) => item.classList.add("is-visible"));
  } else {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      let order = 0;
      entries.filter((entry) => entry.isIntersecting).forEach((entry) => {
        entry.target.style.setProperty("--i", String(Math.min(order++, 7)));
        entry.target.classList.add("is-visible");
        entry.target.addEventListener("animationend", () => entry.target.classList.add("is-settled"), { once: true });
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.01, rootMargin: "0px 0px -6% 0px" });
    revealItems.forEach((item) => revealObserver.observe(item));
  }

  // ───────── Pointer spotlight on cards ─────────
  $$(".skill-card, .project-card, .story-card").forEach((card) => card.classList.add("spot"));
  document.addEventListener("pointermove", (event) => {
    if (event.pointerType === "touch") return;
    const card = event.target.closest?.(".spot");
    if (!card) return;
    const box = card.getBoundingClientRect();
    card.style.setProperty("--mx", `${event.clientX - box.left}px`);
    card.style.setProperty("--my", `${event.clientY - box.top}px`);
  }, { passive: true });

  // ───────── Shared FLIP helper: items glide to their new place, new ones fade up ─────────
  const flip = (items, mutate) => {
    if (reduceMotion) { mutate(); return; }
    const before = new Map(items.filter((item) => !item.hidden).map((item) => [item, item.getBoundingClientRect()]));
    mutate();
    let appear = 0;
    items.forEach((item) => {
      if (item.hidden) return;
      const last = item.getBoundingClientRect();
      const first = before.get(item);
      if (first) {
        const dx = first.left - last.left, dy = first.top - last.top;
        if (dx || dy) item.animate([{ transform: `translate(${dx}px, ${dy}px)` }, { transform: "none" }], { duration: 480, easing: EASE });
      } else {
        item.animate([{ opacity: 0, transform: "translateY(16px) scale(.97)" }, { opacity: 1, transform: "none" }],
          { duration: 460, delay: Math.min(appear++, 6) * 40, easing: EASE, fill: "backwards" });
      }
    });
  };

  // ───────── Home ─────────
  // Role rotation (whole phrases, cross-faded)
  const roleText = $("[data-role-text]");
  const roles = Array.isArray(site.roles) ? site.roles : [];
  if (roleText && roles.length > 1 && !reduceMotion) {
    let roleIndex = 0;
    const next = () => {
      if (!document.hidden) {
        roleText.classList.add("is-changing");
        setTimeout(() => {
          roleIndex = (roleIndex + 1) % roles.length;
          roleText.textContent = roles[roleIndex];
          roleText.classList.remove("is-changing");
        }, 260);
      }
      setTimeout(next, 3200);
    };
    setTimeout(next, 3200);
  }

  // Count the figures up once, when they scroll into view
  const counters = $$("[data-count]");
  if (counters.length && !reduceMotion && "IntersectionObserver" in window) {
    const countObserver = new IntersectionObserver((entries, observer) => {
      entries.filter((entry) => entry.isIntersecting).forEach((entry) => {
        observer.unobserve(entry.target);
        const counter = entry.target;
        const target = Number(counter.dataset.count);
        if (!Number.isFinite(target)) return;
        const start = performance.now();
        const tick = (now) => {
          const progress = Math.min(1, (now - start) / 900);
          counter.textContent = String(Math.round(target * (1 - Math.pow(1 - progress, 4))));
          if (progress < 1) requestAnimationFrame(tick);
        };
        counter.textContent = "0";
        requestAnimationFrame(tick);
      });
    }, { threshold: 0.6 });
    counters.forEach((counter) => countObserver.observe(counter));
  }

  // Portrait: FLIP swap between hero columns
  const portraitButton = $("[data-portrait-move]");
  const homeHero = portraitButton?.closest(".home-hero");
  if (portraitButton && homeHero) {
    portraitButton.addEventListener("click", () => {
      const movers = [$(".hero-visual", homeHero), $(".hero-copy", homeHero)].filter(Boolean);
      const before = movers.map((item) => item.getBoundingClientRect());
      const left = !homeHero.classList.contains("portrait-left");
      homeHero.classList.toggle("portrait-left", left);
      portraitButton.setAttribute("aria-pressed", String(left));
      const label = $("[data-portrait-label]", portraitButton);
      if (label) label.textContent = left ? "Move photo right" : "Move photo left";
      const arrow = $("[aria-hidden='true']", portraitButton);
      if (arrow) arrow.textContent = left ? "→" : "←";
      if (reduceMotion) return;
      movers.forEach((item, index) => {
        const after = item.getBoundingClientRect();
        const dx = before[index].left - after.left, dy = before[index].top - after.top;
        if (dx || dy) item.animate([{ transform: `translate(${dx}px, ${dy}px)` }, { transform: "translate(0, 0)" }], { duration: 800, easing: EASE });
      });
    });
  }

  // Portrait: gentle depth that follows the pointer (desktop only, eased, stops when settled)
  const visual = $(".hero-visual");
  if (visual && !reduceMotion && finePointer.matches) {
    let tx = 0, ty = 0, cx = 0, cy = 0, frame = 0;
    const step = () => {
      cx += (tx - cx) * 0.08;
      cy += (ty - cy) * 0.08;
      visual.style.setProperty("--px", cx.toFixed(3));
      visual.style.setProperty("--py", cy.toFixed(3));
      frame = Math.abs(tx - cx) > 0.002 || Math.abs(ty - cy) > 0.002 ? requestAnimationFrame(step) : 0;
    };
    const kick = () => { if (!frame) frame = requestAnimationFrame(step); };
    window.addEventListener("pointermove", (event) => {
      tx = (event.clientX / window.innerWidth - 0.5) * 2;
      ty = (event.clientY / window.innerHeight - 0.5) * 2;
      kick();
    }, { passive: true });
    document.addEventListener("mouseleave", () => { tx = 0; ty = 0; kick(); });
  }

  // ───────── Skills ─────────
  const skillGrid = $("#skill-grid");
  if (skillGrid) {
    const cards = $$("[data-skill-card]", skillGrid);
    const filterButtons = $$("[data-skill-filter]");
    const sorter = $("#skill-sort");
    const count = $("#skill-count");
    let selected = "all";
    const update = () => {
      const mode = sorter?.value || "default";
      const order = [...cards].sort((a, b) => {
        if (mode === "highest") return Number(b.dataset.level) - Number(a.dataset.level);
        if (mode === "alphabetical") return a.dataset.name.localeCompare(b.dataset.name);
        return cards.indexOf(a) - cards.indexOf(b);
      });
      flip(cards, () => {
        order.forEach((card) => {
          const show = selected === "all" || card.dataset.category === selected;
          card.hidden = !show;
          if (show && !card.classList.contains("is-visible")) showNow(card);
          skillGrid.append(card);
        });
      });
      if (count) count.textContent = String(cards.filter((card) => !card.hidden).length);
    };
    filterButtons.forEach((button) => button.addEventListener("click", () => {
      selected = button.dataset.skillFilter;
      filterButtons.forEach((item) => {
        const active = item === button;
        item.classList.toggle("is-active", active);
        item.setAttribute("aria-pressed", String(active));
      });
      update();
    }));
    sorter?.addEventListener("change", update);
  }

  // ───────── Projects ─────────
  const projectGrid = $("#project-grid");
  if (projectGrid) {
    const cards = $$("[data-project-card]", projectGrid);
    const search = $("#project-search");
    const category = $("#project-category");
    const status = $("#project-status");
    const count = $("#project-count");
    const empty = $("#project-empty");
    const clear = $("#clear-project-filters");
    const haystacks = new Map(cards.map((card) => [card, `${card.dataset.search} ${card.textContent}`.toLowerCase()]));

    const syncUrl = () => {
      const params = new URLSearchParams();
      if (search?.value.trim()) params.set("q", search.value.trim());
      if (category?.value !== "all") params.set("area", category.value);
      if (status?.value !== "all") params.set("status", status.value);
      const qs = params.toString();
      try { history.replaceState(null, "", qs ? `?${qs}` : location.pathname); } catch { /* file:// or sandboxed */ }
    };
    const update = () => {
      const query = (search?.value || "").trim().toLowerCase();
      const area = category?.value || "all";
      const state = status?.value || "all";
      flip(cards, () => {
        cards.forEach((card) => {
          const match = (!query || haystacks.get(card).includes(query))
            && (area === "all" || card.dataset.category === area)
            && (state === "all" || card.dataset.status === state);
          card.hidden = !match;
          if (match && !card.classList.contains("is-visible")) showNow(card);
        });
      });
      const shown = cards.filter((card) => !card.hidden).length;
      if (count) count.textContent = String(shown);
      if (empty) empty.hidden = shown !== 0;
      if (clear) clear.disabled = !query && area === "all" && state === "all";
      syncUrl();
    };
    // Restore a shared link such as projects.html?q=network&area=networking
    const params = new URLSearchParams(location.search);
    if (search && params.get("q")) search.value = params.get("q");
    if (category && [...category.options].some((o) => o.value === params.get("area"))) category.value = params.get("area");
    if (status && [...status.options].some((o) => o.value === params.get("status"))) status.value = params.get("status");

    search?.addEventListener("input", debounce(update, 140));
    category?.addEventListener("change", update);
    status?.addEventListener("change", update);
    clear?.addEventListener("click", () => {
      if (search) search.value = "";
      if (category) category.value = "all";
      if (status) status.value = "all";
      update();
      search?.focus();
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "/" && !/^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement?.tagName) && search) { event.preventDefault(); search.focus(); }
    });
    update();

    // Smooth accordion on the native <details>
    $$(".project-details", projectGrid).forEach((details) => {
      const summary = $("summary", details);
      const body = $(".details-copy", details);
      let running = null;
      summary.addEventListener("click", (event) => {
        if (reduceMotion || !body) return;
        event.preventDefault();
        running?.cancel();
        if (details.open) {
          const height = body.offsetHeight;
          details.classList.add("is-closing");
          running = body.animate({ height: [`${height}px`, "0px"], opacity: [1, 0] }, { duration: 300, easing: EASE });
          running.onfinish = () => { details.open = false; details.classList.remove("is-closing"); running = null; };
        } else {
          details.open = true;
          const height = body.offsetHeight;
          running = body.animate({ height: ["0px", `${height}px`], opacity: [0, 1] }, { duration: 380, easing: EASE });
          running.onfinish = () => { running = null; };
        }
      });
    });
  }

  // ───────── Resume ─────────
  $("#print-resume")?.addEventListener("click", () => window.print());
  $("#copy-resume")?.addEventListener("click", async () => {
    const content = $("#resume-content");
    if (!content) return;
    try {
      await navigator.clipboard.writeText(content.innerText.replace(/\n{3,}/g, "\n\n"));
      toast("Resume summary copied to the clipboard");
    } catch {
      toast("Clipboard access is unavailable in this browser");
    }
  });

  // ───────── Contact ─────────
  const form = $("#contact-form");
  if (form) {
    const draftKey = "mezzy-portfolio-contact-draft-v1";
    const recentKey = "mezzy-portfolio-contact-prepared-v1";
    const feedback = $("#contact-feedback");
    const formStatus = $("#form-status");
    const message = $("#contact-message", form);
    const length = $("#message-length");
    const fields = $$("input, textarea", form);
    const email = site.email || "mezzyechavez637@gmail.com";

    const errorFor = (field) => {
      const v = field.validity;
      const name = field.name;
      if (v.valueMissing) return name === "email" ? "Please add your email so I can reply." : name === "name" ? "Please tell me your name." : "Please write a short message.";
      if (v.typeMismatch || v.patternMismatch) return "That email address doesn’t look right.";
      if (v.tooShort) return `A little more, please — at least ${field.minLength} characters.`;
      return "";
    };
    const setError = (field, text) => {
      const slot = $(`#${field.id}-error`);
      field.setAttribute("aria-invalid", text ? "true" : "false");
      if (slot) slot.textContent = text;
    };
    const touched = new WeakSet();

    try {
      const saved = JSON.parse(safeRead(draftKey) || "null");
      if (saved && typeof saved === "object") fields.forEach((field) => { if (typeof saved[field.name] === "string") field.value = saved[field.name]; });
    } catch { safeRemove(draftKey); }
    const lastPrepared = safeRead(recentKey);
    if (feedback && lastPrepared) feedback.textContent = `A message draft was prepared on this device · ${lastPrepared}`;

    const updateLength = () => { if (length && message) length.textContent = String(message.value.length); };
    const persist = debounce(() => {
      safeWrite(draftKey, JSON.stringify(Object.fromEntries(fields.map((field) => [field.name, field.value]))));
      if (feedback) feedback.textContent = "Draft saved in this browser while you type.";
    }, 300);
    fields.forEach((field) => {
      field.addEventListener("input", () => {
        updateLength();
        persist();
        if (touched.has(field) || field.getAttribute("aria-invalid") === "true") setError(field, errorFor(field));
      });
      field.addEventListener("blur", () => { if (field.value || touched.has(field)) { touched.add(field); setError(field, errorFor(field)); } });
    });
    updateLength();

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      let firstBad = null;
      fields.forEach((field) => {
        touched.add(field);
        const text = errorFor(field);
        setError(field, text);
        if (text && !firstBad) firstBad = field;
      });
      if (firstBad) {
        firstBad.focus();
        const box = firstBad.closest(".field");
        if (box && !reduceMotion) { box.classList.remove("shake"); void box.offsetWidth; box.classList.add("shake"); box.addEventListener("animationend", () => box.classList.remove("shake"), { once: true }); }
        if (formStatus) formStatus.textContent = "Please check the highlighted fields.";
        return;
      }
      const values = Object.fromEntries(new FormData(form).entries());
      const subject = values.subject.trim() || `Portfolio note from ${values.name.trim()}`;
      const body = `Hi Mezzy,\n\n${values.message.trim()}\n\nFrom: ${values.name.trim()}\nReply to: ${values.email.trim()}`;
      safeWrite(recentKey, new Date().toLocaleString());
      if (feedback) feedback.textContent = "Email draft prepared. Your mail app will handle sending it.";
      if (formStatus) formStatus.textContent = "Opening your email application with this draft. The message has not been sent from this page.";
      toast("Opening your email app…");
      window.location.href = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    });

    $("#clear-contact")?.addEventListener("click", () => {
      form.reset();
      safeRemove(draftKey);
      fields.forEach((field) => { touched.delete(field); setError(field, ""); field.removeAttribute("aria-invalid"); });
      updateLength();
      if (feedback) feedback.textContent = "Draft cleared from this browser.";
      if (formStatus) formStatus.textContent = "Draft cleared.";
      toast("Draft cleared");
      $("#contact-name", form)?.focus();
    });
  }

  const copyButton = $("[data-copy-email]");
  copyButton?.addEventListener("click", async () => {
    const address = site.email || "mezzyechavez637@gmail.com";
    let ok = false;
    try { await navigator.clipboard.writeText(address); ok = true; } catch {
      const area = document.createElement("textarea");
      area.value = address; area.setAttribute("readonly", ""); area.style.cssText = "position:fixed;opacity:0";
      document.body.append(area); area.select();
      try { ok = document.execCommand("copy"); } catch { ok = false; }
      area.remove();
    }
    if (ok) {
      copyButton.classList.add("is-done");
      copyButton.textContent = "✓";
      setTimeout(() => { copyButton.classList.remove("is-done"); copyButton.textContent = "⎘"; }, 1600);
      toast("Email address copied");
    } else {
      window.prompt("Copy this email address", address);
    }
  });

  // ───────── Housekeeping ─────────
  document.addEventListener("visibilitychange", () => root.classList.toggle("is-paused", document.hidden));
  $$("[data-year]").forEach((node) => { node.textContent = String(new Date().getFullYear()); });
})();

/* Click effects: spin, stretch, jelly, flip + ripple and sparks */
(() => {
  "use strict";
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const map = [
    [".brand-mark", "fx-spin"], [".portrait-window, .about-photo, .about-portrait, .contact-photo", "fx-flip"],
    [".button, .nav-cta, .filter-chip, .text-button, .clear-button, .theme-toggle", "fx-stretch"],
    [".stat-item, .coffee-stamp, .stat-coffee, .chip-cloud span, .social-links a, .skill-card, .project-card, .timeline-entry, .experience-entry, .why-card, .about-note, .tag-row span", "fx-jelly"],
    [".hero-name, h1, .column-icon, .method-symbol, .social-mark", "fx-spin"]
  ];
  map.forEach(([sel, fx]) => document.querySelectorAll(sel).forEach((el) => { el.dataset.fx = fx; }));
  const play = (el, fx) => {
    el.classList.remove("fx-spin", "fx-stretch", "fx-jelly", "fx-flip");
    void el.offsetWidth;
    el.classList.add(fx);
    el.addEventListener("animationend", () => el.classList.remove(fx), { once: true });
  };
  document.addEventListener("click", (e) => {
    const target = e.target.closest?.("[data-fx]");
    if (target) play(target, target.dataset.fx);
    const ring = document.createElement("span");
    ring.className = "click-ripple";
    ring.style.left = e.clientX + "px"; ring.style.top = e.clientY + "px";
    document.body.append(ring);
    setTimeout(() => ring.remove(), 750);
    for (let i = 0; i < 8; i++) {
      const s = document.createElement("span"), a = (Math.PI * 2 * i) / 8, d = 34 + Math.random() * 26;
      s.className = "click-spark";
      s.style.left = e.clientX + "px"; s.style.top = e.clientY + "px";
      s.style.setProperty("--dx", Math.cos(a) * d + "px"); s.style.setProperty("--dy", Math.sin(a) * d + "px");
      document.body.append(s);
      setTimeout(() => s.remove(), 750);
    }
  });
})();

/* Lively behaviour: greeting rotator, cursor glow, card tilt, magnetic buttons, back-to-top, page transitions */
(() => {
  "use strict";
  const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  // Back to top
  const top = document.createElement("button");
  top.className = "to-top"; top.type = "button"; top.setAttribute("aria-label", "Back to top"); top.textContent = "↑";
  top.addEventListener("click", () => window.scrollTo({ top: 0, behavior: calm ? "auto" : "smooth" }));
  document.body.append(top);
  const onScroll = () => top.classList.toggle("show", window.scrollY > 500);
  window.addEventListener("scroll", onScroll, { passive: true }); onScroll();

  if (calm) return;

  // Greeting rotator (home)
  const greet = document.querySelector("[data-greet]");
  if (greet) {
    const words = ["Hello, I’m", "Kumusta, ako si", "Maayong adlaw, ako si", "Hi there, I’m"];
    let i = 0;
    setInterval(() => {
      greet.classList.add("is-out");
      setTimeout(() => { i = (i + 1) % words.length; greet.textContent = words[i]; greet.classList.remove("is-out"); }, 350);
    }, 3200);
  }

  // Page leave transition
  document.addEventListener("click", (e) => {
    const a = e.target.closest?.("a[href]");
    if (!a || e.metaKey || e.ctrlKey || e.shiftKey || a.target === "_blank") return;
    const url = new URL(a.href, location.href);
    if (url.origin !== location.origin || url.pathname === location.pathname || !/\.html?$|\/$/.test(url.pathname)) return;
    e.preventDefault();
    document.body.classList.add("page-leaving");
    setTimeout(() => { location.href = url.href; }, 260);
  });
  window.addEventListener("pageshow", () => document.body.classList.remove("page-leaving"));

  if (!fine) return;

  // Cursor glow
  const glow = document.createElement("div");
  glow.className = "cursor-glow"; document.body.append(glow);
  let gx = 0, gy = 0, tx = 0, ty = 0;
  window.addEventListener("pointermove", (e) => { tx = e.clientX; ty = e.clientY; glow.classList.add("on"); });
  document.addEventListener("pointerleave", () => glow.classList.remove("on"));
  (function loop() { gx += (tx - gx) * 0.12; gy += (ty - gy) * 0.12; glow.style.transform = `translate(${gx}px, ${gy}px)`; requestAnimationFrame(loop); })();

  // 3D tilt on cards
  const bindTilt = (el) => {
    el.classList.add("tilt-card");
    el.addEventListener("pointermove", (e) => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
      el.style.setProperty("--ry", (x * 10).toFixed(2) + "deg");
      el.style.setProperty("--rx", (-y * 10).toFixed(2) + "deg");
    });
    el.addEventListener("pointerleave", () => { el.style.setProperty("--rx", "0deg"); el.style.setProperty("--ry", "0deg"); });
  };
  document.querySelectorAll(".project-card, .skill-card, .resume-column, .contact-sidebar").forEach(bindTilt);

  // Magnetic buttons
  document.querySelectorAll(".button, .nav-cta").forEach((b) => {
    b.addEventListener("pointermove", (e) => {
      const r = b.getBoundingClientRect();
      b.style.translate = `${((e.clientX - r.left) / r.width - 0.5) * 10}px ${((e.clientY - r.top) / r.height - 0.5) * 8}px`;
    });
    b.addEventListener("pointerleave", () => { b.style.translate = ""; });
  });
})();
