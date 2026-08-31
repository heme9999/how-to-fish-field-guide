import { readFile, readdir } from "node:fs/promises";
import { join } from "node:path";

const root = new URL("../public/", import.meta.url);
const required = ["index.html", "robots.txt", "sitemap.xml", "styles.css", "app.js"];
const missing = [];

for (const file of required) {
  try {
    await readFile(new URL(file, root));
  } catch {
    missing.push(file);
  }
}

if (missing.length) {
  throw new Error(`Missing required files: ${missing.join(", ")}`);
}

async function findHtml(dirUrl) {
  const entries = await readdir(dirUrl, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const child = new URL(`${entry.name}${entry.isDirectory() ? "/" : ""}`, dirUrl);
    if (entry.isDirectory()) files.push(...await findHtml(child));
    if (entry.isFile() && entry.name.endsWith(".html")) files.push(child);
  }
  return files;
}

const htmlFiles = await findHtml(root);
const canonicalUrls = [];
for (const file of htmlFiles) {
  const html = await readFile(file, "utf8");
  const checks = ["<title>", "rel=\"canonical\"", "<meta name=\"description\"", "<main"];
  const absent = checks.filter((needle) => !html.includes(needle));
  if (absent.length) throw new Error(`${file.pathname}: missing ${absent.join(", ")}`);
  if (!file.pathname.endsWith("/404.html")) {
    const canonical = html.match(/<link rel="canonical" href="([^"]+)"/i)?.[1];
    if (!canonical) throw new Error(`${file.pathname}: canonical URL could not be parsed`);
    canonicalUrls.push(canonical);
    const primaryNav = html.match(/<nav class="nav wrap" aria-label="Primary navigation">([\s\S]*?)<\/nav>/i)?.[1];
    if (!primaryNav) throw new Error(`${file.pathname}: primary navigation could not be parsed`);
    if (!/href="(?:\.\/|\/)guides\/"[^>]*>Guides<\/a>/i.test(primaryNav)) {
      throw new Error(`${file.pathname}: Guides navigation must point to /guides/`);
    }
  }
}

const sitemap = await readFile(new URL("sitemap.xml", root), "utf8");
const urlCount = (sitemap.match(/<url>/g) || []).length;
if (urlCount !== htmlFiles.length - 1) {
  throw new Error(`Sitemap URL count ${urlCount} does not match indexable HTML count ${htmlFiles.length - 1}`);
}
for (const canonical of canonicalUrls) {
  if (!sitemap.includes(`<loc>${canonical}</loc>`)) throw new Error(`Sitemap is missing canonical URL: ${canonical}`);
}

console.log(`Site checks passed: ${htmlFiles.length} HTML files, ${urlCount} sitemap URLs.`);
