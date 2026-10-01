/* Epoxy coating calculator */
(() => {
  const form = document.getElementById("coat-form");

  form.addEventListener("segchange", e => {
    form.querySelectorAll("[data-for]").forEach(f => { f.hidden = f.dataset.for !== e.detail; });
  });

  function vstr(ml) { const [v, u] = RM.primaryVol(ml); return `${v} ${u}`; }

  function calc() {
    const shape = RM.seg("shape") || "rect";
    form.querySelectorAll("[data-for]").forEach(f => { f.hidden = f.dataset.for !== shape; });

    const area = shape === "circle"
      ? Math.PI * Math.pow(RM.num("dia") / 2, 2)
      : RM.num("len") * RM.num("wid");
    const thk = RM.num("thk");
    const coats = Math.max(1, Math.round(RM.num("coats", 1)));
    const drip = RM.num("drip", 15);
    const ratio = RM.num("ratio", 1);
    document.getElementById("drip-v").textContent = drip + "%";

    const perCoat = RM.cubicToMl(area * thk) * (1 + drip / 100);
    const total = perCoat * coats;

    const areaStr = RM.unit === "imperial"
      ? `${RM.fmt(area / 144, 2)} ft²`
      : `${RM.fmt(area / 10000, 2)} m²`;
    RM.set("r-area", area > 0 ? areaStr : "—");

    if (total <= 0) {
      ["r-main", "r-alt", "r-coat", "r-a", "r-b", "r-weight"].forEach(id => RM.set(id, "—"));
      return;
    }
    const v = RM.vol(total);
    RM.set("r-main", vstr(total));
    RM.set("r-alt", RM.unit === "imperial"
      ? `${RM.fmt(v.ml, 0)} ml · ${RM.fmt(v.L, 2)} L`
      : `${RM.fmt(v.floz, 1)} fl oz · ${RM.fmt(v.gal, 2)} US gal`);
    RM.set("r-coat", vstr(perCoat));
    RM.set("r-a", vstr(total * ratio / (ratio + 1)));
    RM.set("r-b", vstr(total / (ratio + 1)));
    RM.set("r-weight", RM.primaryWeight(total));
  }

  RM.bind(calc);
})();
