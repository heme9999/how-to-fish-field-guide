import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const root = new URL("../public/creatures/", import.meta.url);
const base = "https://how-to-fish-field-guide.overjoyed-week-dcb.workers.dev";
const creatures = [
  { slug: "brown-crab", name: "Brown Crab", type: "Regular", rod: "Crab Fishing Rod", lure: "Free Lure", status: "Cross-checked" },
  { slug: "shrimp", name: "Shrimp", type: "Regular", rod: "Crab Fishing Rod", lure: "Free Lure", status: "Cross-checked" },
  { slug: "rock-crab", name: "Rock Crab", type: "Regular", rod: "Crab Fishing Rod", lure: "Hot Dog", status: "Cross-checked" },
  { slug: "lobster", name: "Lobster", type: "Regular", rod: "Crab Fishing Rod", lure: "Hot Dog", status: "Cross-checked" },
  { slug: "mackerel", name: "Mackerel", type: "Regular", rod: "Fishing Rod", lure: "Free Lure", status: "Cross-checked" },
  { slug: "gar", name: "Gar", type: "Regular", rod: "Fishing Rod", lure: "Free Lure", status: "Cross-checked" },
  { slug: "pike", name: "Pike", type: "Regular", rod: "Fishing Rod", lure: "Free Lure", status: "Cross-checked" },
  { slug: "goldfish", name: "Goldfish", type: "Regular", rod: "Fishing Rod", lure: "Free Lure", status: "Cross-checked" },
  { slug: "piranha", name: "Piranha", type: "Regular", rod: "Fishing Rod", lure: "Hot Dog", status: "Cross-checked" },
  { slug: "spider-crab", name: "Spider Crab", type: "Boss", rod: "Progression encounter", lure: "Beer quest trigger", status: "Guide-reviewed", guide: "/guides/spider-crab/" }
];

for (const creature of creatures) {
  const canonical = `${base}/creatures/${creature.slug}/`;
  const description = `${creature.name} in How to Fish: reported rod, lure or encounter requirement, verification status and related guide links.`;
  const schema = JSON.stringify({
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "WebPage", name: `${creature.name} — How to Fish`, url: canonical, description, dateModified: "2026-08-28", isPartOf: { "@type": "WebSite", name: "How to Fish Field Guide", url: `${base}/` } },
      { "@type": "BreadcrumbList", itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: `${base}/` },
        { "@type": "ListItem", position: 2, name: "Creatures", item: `${base}/creatures/` },
        { "@type": "ListItem", position: 3, name: creature.name, item: canonical }
      ] }
    ]
  });
  const guideLink = creature.guide ? `<p><a class="button" href="${creature.guide}">Read the Spider Crab strategy →</a></p>` : "";
  const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${creature.name} Rod & Lure — How to Fish Game</title>
  <meta name="description" content="${description}">
  <link rel="canonical" href="${canonical}"><link rel="icon" href="/favicon.svg" type="image/svg+xml"><link rel="stylesheet" href="/styles.css">
  <script type="application/ld+json">${schema}</script>
</head>
<body class="inner-page creature-page">
  <header class="site-header"><nav class="nav wrap" aria-label="Primary navigation"><a class="brand" href="/"><span class="brand-mark" aria-hidden="true">HF</span><span>How to Fish <em>Field Guide</em></span></a><div class="nav-links"><a href="/creatures/" aria-current="page">Creatures</a><a href="/tools/fishipedia-tracker/">Tracker</a><a href="/guides/">Guides</a><a href="/about/">About</a></div></nav></header>
  <main class="wrap"><article class="page-head content"><div class="breadcrumbs"><a href="/">Home</a> / <a href="/creatures/">Creatures</a> / ${creature.name}</div><div class="eyebrow" style="color:#b84f31">${creature.type} entry</div><h1>${creature.name} in How to Fish</h1><p>The currently reported requirement for ${creature.name}, separated into a dedicated page so the answer and its evidence status are easy to find.</p><div class="creature-facts"><div><small>Rod or route</small><strong>${creature.rod}</strong></div><div><small>Lure or trigger</small><strong>${creature.lure}</strong></div><div><small>Evidence</small><strong>${creature.status}</strong></div></div><div class="notice"><strong>Verification note:</strong> Reviewed August 27, 2026 for launch builds 1.0.x. Treat this as a current field note rather than a permanent game rule.</div>${guideLink}<h2>Track this entry</h2><p>Open the <a href="/tools/fishipedia-tracker/">Fishipedia tracker</a> to mark ${creature.name} caught, or return to the <a href="/creatures/">10-entry verified database</a>.</p><h2>Report a correction</h2><p>If a patch changed this requirement, <a href="https://github.com/heme9999/how-to-fish-field-guide/issues/new?title=Data%20correction%3A%20${encodeURIComponent(creature.name)}" rel="nofollow">open a public correction</a> and include the build number and what you reproduced.</p></article></main>
  <footer class="site-footer"><div class="wrap"><strong>How to Fish Field Guide</strong><p class="fine">Independent fan resource. No unverified values are silently filled in.</p></div></footer>
</body></html>`;
  const directory = new URL(`${creature.slug}/`, root);
  await mkdir(directory, { recursive: true });
  await writeFile(join(fileURLToPath(directory), "index.html"), html);
}

console.log(`Generated ${creatures.length} creature pages.`);
