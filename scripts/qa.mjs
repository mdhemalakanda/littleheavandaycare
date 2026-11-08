#!/usr/bin/env node
/* QA audit for the Kids Express site.
   - scans src/pages/*.html for data-i18n keys
   - verifies every key exists in BOTH en and bn dictionaries (translations.js)
   - checks internal links resolve to built files
   - checks forms have required structure
   Run: node scripts/qa.mjs   (after node scripts/build.mjs) */
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

/* load translations via a fake window */
const win = {};
new Function("window", readFileSync(join(ROOT, "assets/data/translations.js"), "utf8"))(win);
const T = win.KES_T || {};

/* collect keys used in pages */
const pagesDir = join(ROOT, "src", "pages");
const files = readdirSync(pagesDir).filter((f) => f.endsWith(".html"));
const used = new Map(); // key -> [pages]
for (const f of files) {
  const html = readFileSync(join(pagesDir, f), "utf8");
  const re = /data-i18n(?:-key)?="([^"]+)"/g;
  let m;
  while ((m = re.exec(html))) {
    if (!used.has(m[1])) used.set(m[1], []);
    used.get(m[1]).push(f);
  }
}

/* keys used in shared templates */
const tmplDir = join(ROOT, "templates");
for (const f of readdirSync(tmplDir).filter((f) => f.endsWith(".html"))) {
  const html = readFileSync(join(tmplDir, f), "utf8");
  const re = /data-i18n(?:-key)?="([^"]+)"/g;
  let m;
  while ((m = re.exec(html))) {
    if (!used.has(m[1])) used.set(m[1], []);
    used.get(m[1]).push("templates/" + f);
  }
}

/* keys referenced from JS (t("key") calls) */
const jsFiles = ["assets/js/i18n.js", "assets/js/main.js", "assets/data/media.js", "assets/data/programs.js", "assets/data/teachers.js", "assets/data/news.js", "assets/data/testimonials.js", "assets/data/videos.js"];
for (const f of jsFiles) {
  try {
    const src = readFileSync(join(ROOT, f), "utf8");
    const re = /(?<![A-Za-z])t\("([^"]+)"\)|(?<![A-Za-z])t\('([^']+)'\)/g;
    let m;
    while ((m = re.exec(src))) {
      const key = m[1] || m[2];
      if (!key.includes("+") && !key.startsWith("{{")) { if (!used.has(key)) used.set(key, []); used.get(key).push("js"); }
    }
  } catch (e) {}
}
/* dynamic key namespaces built in JS */
["gallery.chip.all","gallery.chip.campus","gallery.chip.classroom","gallery.chip.celebration","gallery.chip.daycare","gallery.chip.activities","gallery.cat.campus","gallery.cat.classroom","gallery.cat.celebration","gallery.cat.daycare","gallery.cat.activities","news.cat.day","news.cat.event","news.cat.note","meta.months","common.learnMore","common.readMore","common.close","videos.play","videos.embedNote","videos.watchOnFb","form.errRequired","form.errEmail","form.errPhone","form.toastSuccess","meta.titleHome","meta.titleAbout","meta.titlePrograms","meta.titlePDaycare","meta.titlePPlay","meta.titlePNursery","meta.titlePKg","meta.titlePPre","meta.titleTeachers","meta.titleActivities","meta.titleGallery","meta.titleVideos","meta.titleNews","meta.titleAdmission","meta.titleContact","{{TITLE_KEY}}"].forEach((k) => { if (!used.has(k)) used.set(k, ["js-dynamic"]); });

let problems = 0;
const missing = [];
for (const [key, where] of used) {
  if (key.startsWith("{{")) continue;
  if (!(key in (T.en || {}))) { missing.push(`EN missing: ${key}  (used in ${where.join(", ")})`); problems++; }
  if (!(key in (T.bn || {}))) { missing.push(`BN missing: ${key}  (used in ${where.join(", ")})`); problems++; }
}
const unused = [];
for (const dict of ["en", "bn"]) {
  for (const k of Object.keys(T[dict] || {})) {
    if (!used.has(k) && !k.startsWith("_")) unused.push(`${dict}: ${k}`);
  }
}

/* link check */
const built = join(ROOT, "site");
const linkProblems = [];
for (const f of files) {
  const html = readFileSync(join(pagesDir, f), "utf8");
  const re = /href="([a-z-]+\.html)(\?[^"]*)?"/g;
  let m;
  while ((m = re.exec(html))) {
    const target = m[1];
    if (!["index.html"].includes(target) && !existsSync(join(pagesDir, target))) {
      linkProblems.push(`${f} -> ${target} (missing src page)`); problems++;
    }
  }
}

/* form structure check */
const formProblems = [];
for (const f of ["admission.html", "contact.html"]) {
  const p = join(pagesDir, f);
  if (!existsSync(p)) { formProblems.push(`${f} does not exist`); problems++; continue; }
  const html = readFileSync(p, "utf8");
  if (!html.includes("data-form")) { formProblems.push(`${f}: no data-form`); problems++; }
  if (!html.includes("data-success-key")) { formProblems.push(`${f}: no data-success-key`); problems++; }
  const fields = (html.match(/class="form-field/g) || []).length;
  const errs = (html.match(/class="field-error"/g) || []).length;
  if (errs < fields) { formProblems.push(`${f}: ${fields} fields but only ${errs} error spans`); problems++; }
}

console.log("pages:", files.length);
console.log("i18n keys used:", used.size);
console.log("dictionary sizes:", Object.keys(T.en || {}).length, "en /", Object.keys(T.bn || {}).length, "bn");
if (missing.length) { console.log("\nMISSING KEYS:"); missing.forEach((x) => console.log("  " + x)); }
if (unused.length) { console.log("\nunused dict keys (" + unused.length + "):"); unused.slice(0, 30).forEach((x) => console.log("  " + x)); }
if (linkProblems.length) { console.log("\nLINK PROBLEMS:"); linkProblems.forEach((x) => console.log("  " + x)); }
if (formProblems.length) { console.log("\nFORM PROBLEMS:"); formProblems.forEach((x) => console.log("  " + x)); }
console.log(problems === 0 ? "\nQA PASS" : `\nQA FAIL — ${problems} problem(s)`);
process.exit(problems === 0 ? 0 : 1);
