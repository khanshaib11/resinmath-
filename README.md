# ResinMath 🧪🪵

> Precision epoxy resin calculators for woodworkers, artists, and makers. Stop guessing, stop wasting expensive resin, and never botch a cure.

Live site: [https://resinmath.pages.dev](https://resinmath.pages.dev)

---

## Why I Built This

If you've ever poured a deep live-edge river table or cast a set of silicone molds, you know the drill:
- Epoxies cost $100–$150+ a gallon, and running short mid-pour leaves ugly visible cure lines.
- Measuring a 2:1 volume system on a kitchen scale ruins the chemical cross-link because Part A and Part B have completely different densities.
- Most resin brand calculators are buried inside clunky checkout pages and full of trackers.

ResinMath is a standalone, fast, privacy-first suite of specialized calculators built to run 100% in the browser. Zero ads, zero tracking, works offline, and switches between Imperial and Metric in one click.

---

## The Calculators

| Tool | Route | What It Does |
|---|---|---|
| **🌊 River Table** | `/river-table-epoxy-calculator/` | Calculates cubic volume from length, multi-point average width & depth. Includes waste %, object displacement (rocks/wood), and maximum pour depth layer warnings with visual cross-section. |
| **✨ Tabletop & Coating** | `/resin-coating-calculator/` | Flood coat estimator for rectangular & round table tops, charcuterie boards, and canvas art. Accounts for surface area, thickness, multiple coats, and drip runoff. |
| **🧊 Mold Volume** | `/resin-mold-volume-calculator/` | Geometric volume solvers for cylinders, cubes/trays, spheres, domes, cones, plus the water-displacement method for odd sculpted silicone molds. Multiplies by batch quantity. |
| **⚖️ A:B Mix Ratio** | `/resin-mix-ratio-calculator/` | Calculates Part A (resin) and Part B (hardener) splits. Supports volume or weight (scale tare workflow) for 1:1, 2:1, 3:1, 4:1, 100:45, or custom ratios. Can calculate backwards from leftover resin on hand. |
| **💰 Resin Cost & Pricing** | `/resin-cost-calculator/` | Determines kit purchases (rounded to full kits), raw material costs, shop consumables, labor hours, and healthy wholesale/retail profit margins. |

---

## Core Formulas Used

### 1. River Table Cubic Volume
```
Volume (in³) = Length × Average Width × Depth
US Gallons   = (Volume in³ / 231) × (1 - Displacement%) × (1 + Waste%)
Liters       = ((L_cm × W_cm × D_cm) / 1000) × (1 - Displacement%) × (1 + Waste%)
```

### 2. Surface Coating
```
Rectangular Area (sq ft) = (Length_in × Width_in) / 144
Circular Area (sq ft)    = (π × (Diameter_in / 2)²) / 144
Total Fl Oz              = (Area_sq_in × Thickness_in / 1.805) × Coats × (1 + Drip%)
```

### 3. Stoichiometric A:B Split
```
Part A = Total Batch × (Parts_A / (Parts_A + Parts_B))
Part B = Total Batch × (Parts_B / (Parts_A + Parts_B))
```

---

## Tech Stack & Architecture

- **Vanilla HTML5, CSS3, & Modern JavaScript (ES6+)**
- **Zero build tools, zero dependencies** — loads instantly, runs forever without broken `node_modules`
- **Artisanal Maker Theme**: Deep slate palette with organic Caribbean lagoon teal and warm amber resin highlights
- **Client-Side URL State**: Share any calculation via query params (`?len=72&wid=8&dep=1.5&u=imperial`)
- **Search Engine Optimized**: Valid Schema.org `WebApplication`, `BreadcrumbList`, and `FAQPage` JSON-LD on all routes
- **Deployment**: Hosted on Cloudflare Pages (free global CDN, custom domain support, unlimited bandwidth)

---

## Project Structure

```text
resinmath/
├── index.html                           # Home landing & calculator directory
├── 404.html                             # Custom styled 404 error page
├── favicon.svg                          # High-DPI resin droplet icon
├── robots.txt                           # Search engine crawling rules
├── sitemap.xml                          # XML sitemap for Google/Bing
├── assets/
│   ├── css/
│   │   └── style.css                    # Design system, glassmorphism, responsive grid
│   ├── img/
│   │   └── resin-hero.jpg               # Studio walnut & river resin visual asset
│   └── js/
│       ├── common.js                    # Unit conversion engine (in/cm, oz/ml), URL state, UI
│       ├── river.js                     # River table engine & dynamic SVG cross-section
│       ├── coating.js                   # Tabletop & canvas flood coat engine
│       ├── mold.js                      # 3D geometry & water method mold engine
│       ├── mix.js                       # Weight vs volume ratio splitter & scale tare logic
│       └── cost.js                      # Kit estimator, labor pricing & retail margins
├── river-table-epoxy-calculator/
│   └── index.html
├── resin-coating-calculator/
│   └── index.html
├── resin-mold-volume-calculator/
│   └── index.html
├── resin-mix-ratio-calculator/
│   └── index.html
└── resin-cost-calculator/
    └── index.html
```

---

## Running Locally

Because there are no heavy build tools, you can run ResinMath with any local static server:

```bash
# Using Python
python -m http.server 8000

# Or with Node
npx serve .
```

Open `http://localhost:8000` in your browser.

---

## Deploying to Cloudflare Pages (Free)

1. Fork or push this repository to your GitHub account.
2. Log into the [Cloudflare Dashboard](https://dash.cloudflare.com/) and go to **Workers & Pages** > **Create application** > **Pages** > **Connect to Git**.
3. Select your `resinmath` repo.
4. Set build settings:
   - **Framework preset**: None
   - **Build command**: *(leave blank)*
   - **Build output directory**: `/` *(or root)*
5. Click **Save and Deploy**. Your site will be live at `https://resinmath.pages.dev` with free SSL, global CDN, and unlimited bandwidth.
6. Under **Custom domains**, click **Set up a domain** whenever you're ready to link your own domain for free.

---

## License

MIT © ResinMath contributors. Feel free to use, modify, or extend for your own maker projects.
