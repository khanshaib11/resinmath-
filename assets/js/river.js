/* River table epoxy calculator */
(() => {
  const viz = document.getElementById("viz");

  function draw(pours, dispPct, depthRatio) {
    const W = 400, H = 140, wood = 110, top = 22;
    const h = Math.max(30, Math.min(100, 40 + depthRatio * 60));
    const bottom = top + h;
    let layers = "";
    for (let i = 1; i < pours; i++) {
      const y = bottom - (h / pours) * i;
      layers += `<line x1="${wood}" x2="${W - wood}" y1="${y}" y2="${y}" stroke="rgba(255,255,255,.35)" stroke-dasharray="4 5"/>`;
    }
    let rocks = "";
    const nRocks = Math.round(dispPct / 6);
    for (let i = 0; i < nRocks; i++) {
      const x = wood + 16 + ((i * 47) % (W - 2 * wood - 32));
      const r = 6 + (i % 3) * 3;
      rocks += `<ellipse cx="${x}" cy="${bottom - r}" rx="${r * 1.4}" ry="${r}" fill="rgba(20,22,35,.75)" stroke="rgba(255,255,255,.15)"/>`;
    }
    viz.innerHTML = `
      <svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" role="img">
        <defs>
          <linearGradient id="rg" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0" stop-color="hsl(172 72% 46%)"/><stop offset=".6" stop-color="hsl(188 80% 48%)"/><stop offset="1" stop-color="hsl(206 82% 44%)"/>
          </linearGradient>
          <linearGradient id="wg" x1="0" x2="1"><stop offset="0" stop-color="#4a2c18"/><stop offset="1" stop-color="#2a170a"/></linearGradient>
        </defs>
        <rect x="0" y="${top}" width="${wood}" height="${h}" fill="url(#wg)" rx="3"/>
        <rect x="${W - wood}" y="${top}" width="${wood}" height="${h}" fill="url(#wg)" rx="3"/>
        <path d="M${wood} ${top} q 30 8 ${(W - 2 * wood) / 2} 0 t ${(W - 2 * wood) / 2} 0 V ${bottom} H ${wood} Z" fill="url(#rg)" opacity=".9">
          <animate attributeName="d" dur="5s" repeatCount="indefinite"
            values="M${wood} ${top + 2} q 30 6 ${(W - 2 * wood) / 2} 0 t ${(W - 2 * wood) / 2} 0 V ${bottom} H ${wood} Z;
                    M${wood} ${top + 2} q 30 -6 ${(W - 2 * wood) / 2} 0 t ${(W - 2 * wood) / 2} 0 V ${bottom} H ${wood} Z;
                    M${wood} ${top + 2} q 30 6 ${(W - 2 * wood) / 2} 0 t ${(W - 2 * wood) / 2} 0 V ${bottom} H ${wood} Z"/>
        </path>
        ${rocks}${layers}
        <text x="${W / 2}" y="${H - 6}" fill="rgba(220,226,255,.6)" font-size="11" text-anchor="middle" font-family="Inter">cross-section · ${pours} pour${pours > 1 ? "s" : ""}</text>
      </svg>`;
  }

  function vstr(ml) { const [v, u] = RM.primaryVol(ml); return `${v} ${u}`; }

  function calc() {
    const L = RM.num("len"), W = RM.num("wid"), D = RM.num("dep");
    const n = Math.max(1, Math.round(RM.num("cnt", 1)));
    const waste = RM.num("waste", 10), disp = RM.num("disp", 0);
    const maxp = RM.num("maxpour", 0), ratio = RM.num("ratio", 2);

    document.getElementById("waste-v").textContent = waste + "%";
    document.getElementById("disp-v").textContent = disp + "%";

    const raw = RM.cubicToMl(L * W * D * n);
    const total = raw * (1 - disp / 100) * (1 + waste / 100);
    const pours = maxp > 0 && D > 0 ? Math.max(1, Math.ceil(D / maxp - 1e-9)) : 1;

    if (total <= 0) {
      ["r-main", "r-alt", "r-weight", "r-pours", "r-a", "r-b", "r-perpour"].forEach(id => RM.set(id, "—"));
      draw(1, 0, 0.5);
      return;
    }

    const v = RM.vol(total);
    RM.set("r-main", vstr(total));
    RM.set("r-alt", RM.unit === "imperial"
      ? `${RM.fmt(v.L, 2)} L · ${RM.fmt(v.floz, 0)} fl oz`
      : `${RM.fmt(v.gal, 2)} US gal · ${RM.fmt(v.floz, 0)} fl oz`);
    RM.set("r-weight", RM.primaryWeight(total));
    RM.set("r-pours", pours + (pours === 1 ? " pour" : " pours"));
    RM.set("r-a", vstr(total * ratio / (ratio + 1)));
    RM.set("r-b", vstr(total / (ratio + 1)));
    RM.set("r-perpour", vstr(total / pours) + (pours > 1 ? ` × ${pours}` : ""));

    const tip = document.getElementById("r-tip");
    tip.innerHTML = pours > 1
      ? `<b>Layering:</b> Your depth is more than this resin's max pour depth, so pour it in ${pours} layers. Wait the cure time on the label between layers so it doesn't overheat.`
      : `<b>Tip:</b> Mix a little more than one pour needs. Running short mid-pour leaves visible lines in the resin.`;

    const depthCm = RM.toCm(D);
    draw(Math.min(pours, 8), disp, Math.min(1, depthCm / 10));
  }

  RM.bind(calc);
})();
