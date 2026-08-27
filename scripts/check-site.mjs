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
for (const file of htmlFiles) {
  const html = await readFile(file, "utf8");
  const checks = ["<title>", "rel=\"canonical\"", "<meta name=\"description\"", "<main"];
  const absent = checks.filter((needle) => !html.includes(needle));
  if (absent.length) throw new Error(`${file.pathname}: missing ${absent.join(", ")}`);
}

const sitemap = await readFile(new URL("sitemap.xml", root), "utf8");
const urlCount = (sitemap.match(/<url>/g) || []).length;
if (urlCount !== htmlFiles.length - 1) {
  throw new Error(`Sitemap URL count ${urlCount} does not match indexable HTML count ${htmlFiles.length - 1}`);
}

console.log(`Site checks passed: ${htmlFiles.length} HTML files, ${urlCount} sitemap URLs.`);
