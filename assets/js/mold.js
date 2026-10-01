/* Resin mold volume calculator */
(() => {
  const form = document.getElementById("mold-form");
  const water = document.getElementById("water");

  function showFields(shape) {
    form.querySelectorAll("[data-for]").forEach(f => {
      f.hidden = !f.dataset.for.split(" ").includes(shape);
    });
  }
  form.addEventListener("segchange", e => showFields(e.detail));

  // Keep the water amount meaningful when switching units
  document.addEventListener("unitchange", e => {
    const v = parseFloat(water.value);
    if (isNaN(v)) return;
    water.value = e.detail === "metric"
      ? Math.round(v * RM.ML_PER_FLOZ)
      : +(v / RM.ML_PER_FLOZ).toFixed(2);
  });

  function vstr(ml) { const [v, u] = RM.primaryVol(ml); return `${v} ${u}`; }

  function cubic(shape) {
    const r = RM.num("dia") / 2, h = RM.num("hgt");
    switch (shape) {
      case "cyl": return Math.PI * r * r * h;
      case "rect": return RM.num("len") * RM.num("wid") * h;
      case "sphere": return (4 / 3) * Math.PI * r ** 3;
      case "dome": return (2 / 3) * Math.PI * r ** 3;
      case "cone": return (1 / 3) * Math.PI * r * r * h;
      default: return 0;
    }
  }

  function calc() {
    const shape = RM.seg("shape") || "cyl";
    showFields(shape);
    document.getElementById("water-suffix").textContent = RM.unit === "imperial" ? "fl oz" : "ml";

    let eachMl, cubicVal;
    if (shape === "water") {
      const w = RM.num("water");
      eachMl = RM.unit === "imperial" ? w * RM.ML_PER_FLOZ : w;
      cubicVal = RM.unit === "imperial" ? eachMl / RM.ML_PER_IN3 : eachMl;
    } else {
      cubicVal = cubic(shape);
      eachMl = RM.cubicToMl(cubicVal);
    }

    const qty = Math.max(1, Math.round(RM.num("qty", 1)));
    const extra = RM.num("extra", 10);
    const ratio = RM.num("ratio", 1);
    document.getElementById("extra-v").textContent = extra + "%";

    const total = eachMl * qty * (1 + extra / 100);
    if (total <= 0) {
      ["r-main", "r-alt", "r-each", "r-cubic", "r-a", "r-b", "r-weight"].forEach(id => RM.set(id, "—"));
      return;
    }
    const v = RM.vol(total);
    RM.set("r-main", vstr(total));
    RM.set("r-alt", RM.unit === "imperial"
      ? `${RM.fmt(v.ml, 0)} ml · ${RM.fmt(v.cups, 2)} cups`
      : `${RM.fmt(v.floz, 1)} fl oz · ${RM.fmt(v.cups, 2)} US cups`);
    RM.set("r-each", vstr(eachMl));
    RM.set("r-cubic", `${RM.fmt(cubicVal, 2)} ${RM.unit === "imperial" ? "in³" : "cm³"}`);
    RM.set("r-a", vstr(total * ratio / (ratio + 1)));
    RM.set("r-b", vstr(total / (ratio + 1)));
    RM.set("r-weight", RM.primaryWeight(total));
  }

  RM.bind(calc);
})();
