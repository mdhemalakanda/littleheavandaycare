#!/usr/bin/env node
/* ============================================================
   KIDS EXPRESS SCHOOL — static page builder (zero dependencies)
   Composes final pages in site/ from templates/ + src/pages/.
   Run:  node scripts/build.mjs
   Serve: cd site && python3 -m http.server 8090
   ============================================================ */
import { readFileSync, writeFileSync, mkdirSync, readdirSync, cpSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const T = (p) => readFileSync(join(ROOT, "templates", p), "utf8");
const P = (p) => readFileSync(join(ROOT, "src", "pages", p), "utf8");

/* Page registry — one entry per output page.
   nav: which nav item is active (or null). titleKey/descKey are i18n keys. */
const PAGES = {
  "index.html":            { page: "index.html",            nav: "home",      titleKey: "meta.titleHome",    titleEn: "Kids Express School — A Happy Place to Learn & Grow", descEn: "Kids Express School & Day-Care Centre, Mirpur, Dhaka. English-version pre-school for toddlers, pre-schoolers and kindergarteners. Serving parents since 2006." },
  "about.html":            { page: "about.html",            nav: "about",     titleKey: "meta.titleAbout",   titleEn: "About Us — Kids Express School", descEn: "Learn about Kids Express School & Day-Care Centre — our story, mission and learning environment in Mirpur, Dhaka." },
  "programs.html":         { page: "programs.html",         nav: "programs",  titleKey: "meta.titlePrograms",titleEn: "Our Programs — Kids Express School", descEn: "Play Group, Nursery, Kindergarten, Pre-Primary and Day-Care programs at Kids Express School." },
  "program-day-care.html": { page: "program-day-care.html", nav: "programs",  titleKey: "meta.titlePDaycare",titleEn: "Day-Care Program — Kids Express School", descEn: "Caring, safe day-care service for children at Kids Express School, Mirpur, Dhaka." },
  "program-play-group.html":{ page: "program-play-group.html",nav:"programs",  titleKey: "meta.titlePPlay",   titleEn: "Play Group — Kids Express School", descEn: "Play Group program at Kids Express School — first steps into joyful learning." },
  "program-nursery.html":  { page: "program-nursery.html",  nav: "programs",  titleKey: "meta.titlePNursery",titleEn: "Nursery — Kids Express School", descEn: "Nursery program at Kids Express School — learning through play, stories and songs." },
  "program-kindergarten.html":{page:"program-kindergarten.html",nav:"programs",titleKey: "meta.titlePKg",     titleEn: "Kindergarten — Kids Express School", descEn: "Kindergarten program at Kids Express School — confident school readiness in English." },
  "program-pre-primary.html":{page:"program-pre-primary.html",nav: "programs", titleKey: "meta.titlePPre",    titleEn: "Pre-Primary — Kids Express School", descEn: "Pre-Primary program at Kids Express School — a strong bridge into primary school." },
  "teachers.html":         { page: "teachers.html",         nav: "teachers",  titleKey: "meta.titleTeachers",titleEn: "Our Teachers — Kids Express School", descEn: "Meet the caring teachers of Kids Express School & Day-Care Centre." },
  "activities.html":       { page: "activities.html",       nav: "activities",titleKey: "meta.titleActivities",titleEn: "Activities — Kids Express School", descEn: "Art, music, storytelling, outdoor play and more — learning activities at Kids Express School." },
  "gallery.html":          { page: "gallery.html",          nav: "gallery",   titleKey: "meta.titleGallery", titleEn: "Gallery — Kids Express School", descEn: "Photos from classrooms, celebrations and everyday smiles at Kids Express School." },
  "videos.html":           { page: "videos.html",           nav: "videos",    titleKey: "meta.titleVideos",  titleEn: "Videos — Kids Express School", descEn: "Watch school videos from Kids Express School & Day-Care Centre." },
  "news.html":             { page: "news.html",             nav: "news",      titleKey: "meta.titleNews",    titleEn: "News & Events — Kids Express School", descEn: "Latest news, events and updates from Kids Express School & Day-Care Centre." },
  "news-details.html":     { page: "news-details.html",     nav: "news",      titleKey: "meta.titleNews",    titleEn: "News — Kids Express School", descEn: "News story from Kids Express School & Day-Care Centre." },
  "admission.html":        { page: "admission.html",        nav: "admission", titleKey: "meta.titleAdmission",titleEn: "Admission — Kids Express School", descEn: "Apply for admission to Kids Express School & Day-Care Centre, Mirpur, Dhaka." },
  "contact.html":          { page: "contact.html",          nav: "contact",   titleKey: "meta.titleContact", titleEn: "Contact Us — Kids Express School", descEn: "Contact Kids Express School & Day-Care Centre — phone, email, address and inquiry form." },
};

function fill(tpl, map) {
  return tpl.replace(/\{\{(\w+)\}\}/g, (_, k) => (map[k] !== undefined ? map[k] : `{{${k}}}`));
}

function navActive(nav) {
  const keys = ["home", "about", "programs", "activities", "gallery", "videos", "news", "admission", "contact", "teachers"];
  const out = {};
  keys.forEach((k) => { out["ACTIVE_" + k.toUpperCase()] = k === nav ? ' aria-current="page"' : ""; });
  return out;
}

mkdirSync(join(ROOT, "site"), { recursive: true });

for (const [out, cfg] of Object.entries(PAGES)) {
  const headVars = {
    TITLE_EN: cfg.titleEn,
    DESC_EN: cfg.descEn,
    TITLE_KEY: cfg.titleKey,
    PAGE_ID: out.replace(".html", ""),
  };
  const html =
    fill(T("head.html"), headVars) +
    "\n" +
    fill(T("header.html"), navActive(cfg.nav)) +
    "\n" +
    P(cfg.page) +
    "\n" +
    T("footer.html") +
    "\n" +
    T("scripts.html") +
    "\n</body>\n</html>\n";

  writeFileSync(join(ROOT, "site", out), html);
  console.log("built", out);
}

/* copy assets into site/ so the output is fully self-contained */
mkdirSync(join(ROOT, "site"), { recursive: true });
cpSync(join(ROOT, "assets"), join(ROOT, "site", "assets"), { recursive: true });

/* keep docs/ (GitHub Pages folder) in sync when it exists */
import { existsSync } from "node:fs";
if (existsSync(join(ROOT, "docs"))) {
  cpSync(join(ROOT, "site"), join(ROOT, "docs"), { recursive: true });
  console.log("docs/ synced from site/");
}

console.log("done:", Object.keys(PAGES).length, "pages");
