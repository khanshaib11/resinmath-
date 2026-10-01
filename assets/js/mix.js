/* Epoxy mix ratio calculator */
(() => {
  const form = document.getElementById("mix-form");
  const presetSelect = document.getElementById("ratio-preset");
  const customFields = document.querySelectorAll("[data-custom-ratio]");

  function getParts() {
    const val = presetSelect.value;
    if (val === "custom") {
      const a = RM.num("ratio-a", 100);
      const b = RM.num("ratio-b", 50);
      return { a: Math.max(0.01, a), b: Math.max(0.01, b) };
    }
    const [sa, sb] = val.split(":");
    return { a: parseFloat(sa) || 1, b: parseFloat(sb) || 1 };
  }

  function updateSuffixes(mode) {
    const isWeight = mode === "weight";
    let suf;
    if (isWeight) {
      suf = RM.unit === "imperial" ? "oz (wt)" : "g";
    } else {
      suf = RM.unit === "imperial" ? "fl oz" : "ml";
    }
    const bs = document.getElementById("batch-suffix");
    const as = document.getElementById("parta-suffix");
    const bss = document.getElementById("partb-suffix");
    if (bs) bs.textContent = suf;
    if (as) as.textContent = suf;
    if (bss) bss.textContent = suf;
    return suf;
  }

  function handlePresetChange() {
    const isCustom = presetSelect.value === "custom";
    customFields.forEach(f => f.hidden = !isCustom);
  }

  presetSelect.addEventListener("change", handlePresetChange);

  form.addEventListener("segchange", () => {
    const target = RM.seg("target") || "total";
    form.querySelectorAll("[data-target-input]").forEach(el => {
      el.hidden = el.dataset.targetInput !== target;
    });
  });

  function calc() {
    handlePresetChange();
    const mode = RM.seg("mode") || "volume";
    const target = RM.seg("target") || "total";
    const suf = updateSuffixes(mode);

    form.querySelectorAll("[data-target-input]").forEach(el => {
      el.hidden = el.dataset.targetInput !== target;
    });

    const { a, b } = getParts();
    const totalParts = a + b;
    const pctA = (a / totalParts) * 100;
    const pctB = (b / totalParts) * 100;

    let partA = 0, partB = 0, total = 0;

    if (target === "total") {
      total = RM.num("input-total", 0);
      partA = total * (a / totalParts);
      partB = total * (b / totalParts);
    } else if (target === "parta") {
      partA = RM.num("input-parta", 0);
      partB = partA * (b / a);
      total = partA + partB;
    } else if (target === "partb") {
      partB = RM.num("input-partb", 0);
      partA = partB * (a / b);
      total = partA + partB;
    }

    // Ratio visualizer
    const barA = document.getElementById("bar-a");
    const barB = document.getElementById("bar-b");
    if (barA && barB) {
      barA.style.flexGrow = a;
      barB.style.flexGrow = b;
      barA.textContent = `Part A (${Math.round(pctA)}%)`;
      barB.textContent = `Part B (${Math.round(pctB)}%)`;
    }

    if (total <= 0) {
      ["r-total", "r-total-alt", "r-parta", "r-partb", "r-pcta", "r-pctb", "r-tare"].forEach(id => RM.set(id, "—"));
      return;
    }

    const precision = mode === "weight" && RM.unit === "metric" ? 0 : (total < 10 ? 2 : 1);
    const fmtVal = v => `${RM.fmt(v, precision)} ${suf}`;

    RM.set("r-total", fmtVal(total));
    RM.set("r-parta", fmtVal(partA));
    RM.set("r-partb", fmtVal(partB));
    RM.set("r-pcta", `${RM.fmt(pctA, 1)}%`);
    RM.set("r-pctb", `${RM.fmt(pctB, 1)}%`);

    // Secondary unit display
    if (mode === "volume") {
      if (RM.unit === "imperial") {
        const ml = total * RM.ML_PER_FLOZ;
        RM.set("r-total-alt", `≈ ${RM.fmt(ml, 0)} ml · ${RM.fmt(ml / RM.ML_PER_GAL, 2)} US gal`);
      } else {
        const floz = total / RM.ML_PER_FLOZ;
        RM.set("r-total-alt", `≈ ${RM.fmt(floz, 1)} fl oz · ${RM.fmt(total / 1000, 2)} L`);
      }
    } else {
      if (RM.unit === "imperial") {
        const g = total * RM.G_PER_OZ;
        RM.set("r-total-alt", `≈ ${RM.fmt(g, 0)} g · ${RM.fmt(total / 16, 2)} lb`);
      } else {
        const oz = total / RM.G_PER_OZ;
        RM.set("r-total-alt", `≈ ${RM.fmt(oz, 1)} oz (wt) · ${RM.fmt(total / 1000, 2)} kg`);
      }
    }

    const tareGuide = mode === "weight"
      ? `1. Pour <b>${fmtVal(partA)}</b> of Part A into mixing cup.<br>2. Tare (zero) scale.<br>3. Pour <b>${fmtVal(partB)}</b> of Part B directly on top (cumulative reads ${fmtVal(total)}).`
      : `Measure <b>${fmtVal(partA)}</b> Part A and <b>${fmtVal(partB)}</b> Part B in graduated mixing cups before combining.`;
    const tareEl = document.getElementById("r-tare");
    if (tareEl) tareEl.innerHTML = tareGuide;
  }

  RM.bind(calc);
})();
