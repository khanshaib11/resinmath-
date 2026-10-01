/* Resin cost and project pricing calculator */
(() => {
  const form = document.getElementById("cost-form");
  const curSelect = document.getElementById("currency-symbol");
  const resinInput = document.getElementById("resin-needed");
  const kitInput = document.getElementById("kit-size");

  function getCur() {
    return curSelect ? curSelect.value : "$";
  }

  function updateCurLabels() {
    const cur = getCur();
    document.querySelectorAll("[data-cur]").forEach(el => el.textContent = cur);
    const kp = document.getElementById("kit-price");
    if (kp && kp.parentElement.querySelector(".suffix")) {
      kp.parentElement.querySelector(".suffix").textContent = cur;
    }
  }

  function updateUnitSuffixes() {
    const suf = RM.unit === "imperial" ? "gal" : "L";
    const rs = document.getElementById("resin-unit-suf");
    const ks = document.getElementById("kit-unit-suf");
    if (rs) rs.textContent = suf;
    if (ks) ks.textContent = suf;
  }

  curSelect.addEventListener("change", () => {
    updateCurLabels();
    calc();
  });

  document.addEventListener("unitchange", e => {
    updateUnitSuffixes();
    const isMetric = e.detail === "metric";
    const factor = isMetric ? 3.78541 : 1 / 3.78541;
    [resinInput, kitInput].forEach(el => {
      if (!el) return;
      const v = parseFloat(el.value);
      if (!isNaN(v) && v > 0) {
        el.value = +(v * factor).toFixed(2);
      }
    });
    calc();
  });

  function calc() {
    updateCurLabels();
    updateUnitSuffixes();

    const cur = getCur();
    const resinVol = RM.num("resin-needed", 0);
    const kitSize = Math.max(0.001, RM.num("kit-size", 1));
    const kitPrice = RM.num("kit-price", 0);
    const costWood = RM.num("cost-wood", 0);
    const costConsumables = RM.num("cost-consumables", 0);
    const laborHours = RM.num("labor-hours", 0);
    const hourlyRate = RM.num("hourly-rate", 0);
    const markup = RM.num("markup", 100);

    const markupValEl = document.getElementById("markup-v");
    if (markupValEl) markupValEl.textContent = markup + "%";

    const volUnit = RM.unit === "imperial" ? "gal" : "L";
    const unitRate = kitPrice / kitSize;
    const resinUsedCost = resinVol * unitRate;
    const kitsCount = resinVol > 0 ? Math.ceil(resinVol / kitSize - 1e-9) : 0;
    const kitsPurchasedCost = kitsCount * kitPrice;

    const materialsTotal = resinUsedCost + costWood + costConsumables;
    const laborTotal = laborHours * hourlyRate;
    const prodCost = materialsTotal + laborTotal;
    const retail = prodCost * (1 + markup / 100);
    const wholesale = prodCost * 1.5;

    if (prodCost <= 0) {
      ["r-retail", "r-wholesale", "r-resincost", "r-kits", "r-matcost", "r-laborcost", "r-prodcost", "r-unitrate"].forEach(id => RM.set(id, "—"));
      return;
    }

    RM.set("r-retail", RM.money(retail, cur));
    RM.set("r-wholesale", `Wholesale (1.5×): ${RM.money(wholesale, cur)}`);
    RM.set("r-resincost", `${RM.money(resinUsedCost, cur)} (${RM.fmt(resinVol, 2)} ${volUnit})`);
    RM.set("r-kits", `${kitsCount} kit${kitsCount === 1 ? "" : "s"} (${RM.money(kitsPurchasedCost, cur)})`);
    RM.set("r-matcost", RM.money(materialsTotal, cur));
    RM.set("r-laborcost", RM.money(laborTotal, cur));
    RM.set("r-prodcost", RM.money(prodCost, cur));
    RM.set("r-unitrate", `${RM.money(unitRate, cur)} / ${volUnit}`);

    const kitNote = document.getElementById("r-kit-note");
    if (kitNote) {
      const leftover = (kitsCount * kitSize) - resinVol;
      if (leftover > 0.05) {
        kitNote.innerHTML = `<b>Inventory Note:</b> Buying ${kitsCount} kit${kitsCount > 1 ? "s" : ""} will leave you with ≈ <b>${RM.fmt(leftover, 2)} ${volUnit}</b> of leftover resin for small mold casts or future repairs.`;
      } else {
        kitNote.innerHTML = `<b>Kit purchase note:</b> Kit volume closely matches your requirement. Ensure proper mixing technique to prevent pour line deficiencies.`;
      }
    }
  }

  RM.bind(calc);
})();
