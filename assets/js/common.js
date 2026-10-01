/* ResinMath — shared utilities (no dependencies) */
(function () {
  "use strict";

  const STORE_KEY = "rm-unit";
  const IN_TO_CM = 2.54;
  const ML_PER_IN3 = 16.387064;
  const ML_PER_FLOZ = 29.5735296;
  const ML_PER_GAL = 3785.41178;
  const G_PER_OZ = 28.3495231;
  const G_PER_LB = 453.59237;

  const params = new URLSearchParams(location.search);
  let unit = params.get("u") || localStorage.getItem(STORE_KEY) || guessUnit();

  function guessUnit() {
    const lang = (navigator.language || "en-US").toUpperCase();
    return /-(US|LR|MM)$/.test(lang) ? "imperial" : "metric";
  }

  const RM = {
    get unit() { return unit; },
    lenUnit() { return unit === "imperial" ? "in" : "cm"; },
    /** convert linear value in current unit to cm */
    toCm(v) { return unit === "imperial" ? v * IN_TO_CM : v; },
    /** volume from current-unit cubic value to ml */
    cubicToMl(v) { return unit === "imperial" ? v * ML_PER_IN3 : v; },
    ML_PER_FLOZ, ML_PER_GAL, ML_PER_IN3, G_PER_OZ, G_PER_LB,

    num(id, fallback = 0) {
      const el = document.getElementById(id);
      if (!el) return fallback;
      const v = parseFloat(el.value);
      const bad = el.value !== "" && (isNaN(v) || v < 0);
      el.classList.toggle("invalid", bad);
      return isNaN(v) || v < 0 ? fallback : v;
    },

    fmt(n, d = 1) {
      if (!isFinite(n)) return "—";
      const abs = Math.abs(n);
      const dec = abs >= 1000 ? 0 : abs >= 100 ? Math.min(d, 1) : d;
      return n.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: dec });
    },

    money(n, cur = "$") {
      if (!isFinite(n)) return "—";
      return cur + n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    },

    /** Breakdown of a volume given in ml */
    vol(ml) {
      return {
        ml, L: ml / 1000, floz: ml / ML_PER_FLOZ, gal: ml / ML_PER_GAL,
        qt: ml / (ML_PER_GAL / 4), cups: ml / (ML_PER_FLOZ * 8)
      };
    },

    /** Primary volume string for current unit system: [value, unitLabel] */
    primaryVol(ml) {
      const v = RM.vol(ml);
      if (unit === "imperial") return v.floz >= 128 ? [RM.fmt(v.gal, 2), "gallons"] : [RM.fmt(v.floz, 1), "fl oz"];
      return v.ml >= 1000 ? [RM.fmt(v.L, 2), "liters"] : [RM.fmt(v.ml, 0), "ml"];
    },

    weight(ml, density = 1.1) {
      const g = ml * density;
      return { g, kg: g / 1000, oz: g / G_PER_OZ, lb: g / G_PER_LB };
    },

    primaryWeight(ml, density = 1.1) {
      const w = RM.weight(ml, density);
      if (unit === "imperial") return w.lb >= 1 ? RM.fmt(w.lb, 2) + " lb" : RM.fmt(w.oz, 1) + " oz";
      return w.kg >= 1 ? RM.fmt(w.kg, 2) + " kg" : RM.fmt(w.g, 0) + " g";
    },

    set(id, text) {
      const el = document.getElementById(id);
      if (!el || el.textContent === text) return;
      el.textContent = text;
      el.classList.remove("bump"); void el.offsetWidth; el.classList.add("bump");
    },

    toast(msg) {
      let t = document.querySelector(".toast");
      if (!t) { t = document.createElement("div"); t.className = "toast"; t.setAttribute("role", "status"); document.body.appendChild(t); }
      t.textContent = msg; t.classList.add("show");
      clearTimeout(t._h); t._h = setTimeout(() => t.classList.remove("show"), 2200);
    },

    /** Wire a calculator: re-run fn on any input change + unit change */
    bind(fn) {
      const form = document.querySelector("[data-calc]");
      if (!form) return;
      if (params.toString()) restoreFromUrl(form);
      else if (unit === "metric") convertLen(IN_TO_CM);
      form.addEventListener("input", fn);
      form.addEventListener("change", fn);
      document.addEventListener("unitchange", fn);
      RM._calc = fn;
      fn();
    },

    shareUrl() {
      const form = document.querySelector("[data-calc]");
      const p = new URLSearchParams();
      p.set("u", unit);
      form.querySelectorAll("input[id], select[id]").forEach(el => { if (el.value !== "") p.set(el.id, el.value); });
      form.querySelectorAll("[data-seg]").forEach(g => {
        const on = g.querySelector('[aria-pressed="true"]');
        if (on) p.set(g.dataset.seg, on.dataset.value);
      });
      return location.origin + location.pathname + "?" + p.toString();
    },

    /** Segmented button groups: returns current value */
    seg(name) {
      const g = document.querySelector(`[data-seg="${name}"]`);
      const on = g && g.querySelector('[aria-pressed="true"]');
      return on ? on.dataset.value : null;
    }
  };

  function restoreFromUrl(form) {
    if (!params.toString()) return;
    form.querySelectorAll("input[id], select[id]").forEach(el => {
      if (params.has(el.id)) el.value = params.get(el.id);
    });
    form.querySelectorAll("[data-seg]").forEach(g => {
      const v = params.get(g.dataset.seg);
      if (v) selectSeg(g, v, false);
    });
  }

  function selectSeg(group, value, fire = true) {
    group.querySelectorAll("button").forEach(b => b.setAttribute("aria-pressed", String(b.dataset.value === value)));
    group.dispatchEvent(new CustomEvent("segchange", { bubbles: true, detail: value }));
    if (fire) group.dispatchEvent(new Event("change", { bubbles: true }));
  }

  /* ---------- Unit system ---------- */
  function applyUnitLabels() {
    const len = RM.lenUnit();
    document.querySelectorAll("[data-len]").forEach(el => {
      const s = el.parentElement.querySelector(".suffix");
      if (s) s.textContent = len;
    });
    document.querySelectorAll("[data-sq]").forEach(el => { el.textContent = unit === "imperial" ? "in²" : "cm²"; });
    document.querySelectorAll("[data-cubic]").forEach(el => { el.textContent = unit === "imperial" ? "in³" : "cm³"; });
    document.querySelectorAll(".unit-toggle").forEach(t => {
      t.dataset.unit = unit;
      t.querySelectorAll("button").forEach(b => b.setAttribute("aria-pressed", String(b.dataset.unit === unit)));
    });
    document.querySelectorAll("[data-show-unit]").forEach(el => { el.hidden = el.dataset.showUnit !== unit; });
  }

  function convertLen(factor) {
    document.querySelectorAll("input[data-len]").forEach(el => {
      const v = parseFloat(el.value);
      if (isNaN(v)) return;
      const r = v * factor;
      el.value = +(r >= 10 ? r.toFixed(1) : r.toFixed(2));
    });
  }

  function setUnit(next) {
    if (next === unit) return;
    convertLen(next === "metric" ? IN_TO_CM : 1 / IN_TO_CM);
    unit = next;
    localStorage.setItem(STORE_KEY, unit);
    applyUnitLabels();
    document.dispatchEvent(new CustomEvent("unitchange", { detail: unit }));
  }

  /* ---------- Boot ---------- */
  document.addEventListener("DOMContentLoaded", () => {
    applyUnitLabels();

    document.querySelectorAll(".unit-toggle button").forEach(b =>
      b.addEventListener("click", () => setUnit(b.dataset.unit)));

    document.querySelectorAll("[data-seg]").forEach(g =>
      g.addEventListener("click", e => {
        const b = e.target.closest("button");
        if (b) selectSeg(g, b.dataset.value);
      }));

    const menu = document.querySelector(".menu-btn");
    if (menu) menu.addEventListener("click", () => {
      const l = document.querySelector(".nav-links");
      const open = l.classList.toggle("open");
      menu.setAttribute("aria-expanded", String(open));
    });

    document.querySelectorAll("[data-share]").forEach(b => b.addEventListener("click", async () => {
      const url = RM.shareUrl();
      try {
        if (navigator.share && matchMedia("(pointer:coarse)").matches) await navigator.share({ title: document.title, url });
        else { await navigator.clipboard.writeText(url); RM.toast("🔗 Link copied — your numbers are saved in it"); }
      } catch (_) { /* cancelled */ }
    }));

    document.querySelectorAll("[data-copy]").forEach(b => b.addEventListener("click", async () => {
      const box = document.querySelector(".results");
      const text = [...box.querySelectorAll("[data-copy-line]")].map(el => el.innerText.replace(/\s+/g, " ").trim()).join("\n");
      try { await navigator.clipboard.writeText(text + "\n— " + location.href.split("?")[0]); RM.toast("📋 Results copied"); } catch (_) {}
    }));

    document.querySelectorAll("[data-reset]").forEach(b => b.addEventListener("click", () => {
      location.href = location.pathname;
    }));

    const io = "IntersectionObserver" in window ? new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
    }), { threshold: .12 }) : null;
    document.querySelectorAll(".reveal").forEach(el => io ? io.observe(el) : el.classList.add("in"));

    const y = document.getElementById("year");
    if (y) y.textContent = new Date().getFullYear();
  });

  window.RM = RM;
})();
