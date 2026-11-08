#!/usr/bin/env node
/* ============================================================
   LITTLE HEAVEN DAYCARE & PRESCHOOL — static page builder (zero dependencies)
   Composes final pages in site/ from templates/ + src/pages/.
   Run:  node scripts/build.mjs
   Serve: ./scripts/serve.sh  (http://localhost:8130)
   ============================================================ */
import { readFileSync, writeFileSync, mkdirSync, readdirSync, cpSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const T = (p) => readFileSync(join(ROOT, "templates", p), "utf8");
const P = (p) => readFileSync(join(ROOT, "src", "pages", p), "utf8");

const BRAND = "Little Heaven Daycare & Preschool";

/* Page registry — one entry per output page.
   nav: which nav item is active (or null). titleKey/descKey are i18n keys. */
const PAGES = {
  "index.html":            { page: "index.html",            nav: "home",      titleKey: "meta.titleHome",    titleEn: "Little Heaven Daycare & Preschool — Where Little Minds Learn, Play & Grow", descEn: "Daycare (full day / half day), preschool and a highly equipped playzone in Dhanmondi 4, Dhaka. Play-based learning for children 6 months and up. Admissions open." },
  "about.html":            { page: "about.html",            nav: "about",     titleKey: "meta.titleAbout",   titleEn: "About Us — Little Heaven Daycare & Preschool", descEn: "Learn about Little Heaven — a little place with big dreams in Dhanmondi, Dhaka, in the same building as Saalim Wisdom School." },
  "programs.html":         { page: "programs.html",         nav: "programs",  titleKey: "meta.titlePrograms",titleEn: "Our Programs — Little Heaven Daycare & Preschool", descEn: "Daycare, Preschool and Playzone programs at Little Heaven, Dhanmondi 4, Dhaka." },
  "program-day-care.html": { page: "program-day-care.html", nav: "programs",  titleKey: "meta.titlePDaycare",titleEn: "Daycare Program — Little Heaven Daycare & Preschool", descEn: "Caring full-day and half-day daycare for children 6 months and up at Little Heaven, Dhanmondi, Dhaka." },
  "program-preschool.html":{ page: "program-preschool.html",nav: "programs",  titleKey: "meta.titlePPreschool",titleEn: "Preschool Program — Little Heaven Daycare & Preschool", descEn: "Play-based preschool at Little Heaven — morning shift 9:30–11:30 AM and day shift 12:00–2:00 PM, Sunday–Thursday, from age 2." },
  "program-playzone.html": { page: "program-playzone.html", nav: "programs",  titleKey: "meta.titlePPlayzone",titleEn: "Playzone — Little Heaven Daycare & Preschool", descEn: "A highly equipped indoor playzone at Little Heaven — Friday & Saturday, 3:30–5:00 PM, for ages 3–10." },
  "activities.html":       { page: "activities.html",       nav: "activities",titleKey: "meta.titleActivities",titleEn: "Activities — Little Heaven Daycare & Preschool", descEn: "Color matching, problem-solving, pretend play, sensory activities, water play and more — real activities at Little Heaven." },
  "gallery.html":          { page: "gallery.html",          nav: "gallery",   titleKey: "meta.titleGallery", titleEn: "Gallery — Little Heaven Daycare & Preschool", descEn: "Photos from classrooms, celebrations and everyday smiles at Little Heaven — from our official Facebook and Instagram pages." },
  "videos.html":           { page: "videos.html",           nav: "videos",    titleKey: "meta.titleVideos",  titleEn: "Videos — Little Heaven Daycare & Preschool", descEn: "Watch reels and videos from Little Heaven's official Facebook and Instagram pages." },
  "news.html":             { page: "news.html",             nav: "news",      titleKey: "meta.titleNews",    titleEn: "News & Events — Little Heaven Daycare & Preschool", descEn: "Latest news, events and updates from Little Heaven - Daycare, Preschool & Playzone." },
  "news-details.html":     { page: "news-details.html",     nav: "news",      titleKey: "meta.titleNews",    titleEn: "News — Little Heaven Daycare & Preschool", descEn: "News story from Little Heaven - Daycare, Preschool & Playzone." },
  "admission.html":        { page: "admission.html",        nav: "admission", titleKey: "meta.titleAdmission",titleEn: "Admission — Little Heaven Daycare & Preschool", descEn: "Admissions are open at Little Heaven, Dhanmondi 4, Dhaka. Preschool morning and day shifts, daycare full and half day. Call 01947-771948." },
  "contact.html":          { page: "contact.html",          nav: "contact",   titleKey: "meta.titleContact", titleEn: "Contact Us — Little Heaven Daycare & Preschool", descEn: "Contact Little Heaven — phone 01947-771948, email, WhatsApp, address in Dhanmondi 4, Dhaka and inquiry form." },
};

function fill(tpl, map) {
  return tpl.replace(/\{\{(\w+)\}\}/g, (_, k) => (map[k] !== undefined ? map[k] : `{{${k}}}`));
}

function navActive(nav) {
  const keys = ["home", "about", "programs", "activities", "gallery", "videos", "news", "admission", "contact"];
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
cpSync(join(ROOT, "assets"), join(ROOT, "site", "assets"), { recursive: true });

/* robots.txt + sitemap.xml (relative URLs — no production domain is invented) */
writeFileSync(join(ROOT, "site", "robots.txt"),
`User-agent: *
Allow: /

Sitemap: sitemap.xml
`);
const pageList = Object.keys(PAGES);
writeFileSync(join(ROOT, "site", "sitemap.xml"),
`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pageList.map((p) => `  <url><loc>${p}</loc></url>`).join("\n")}
</urlset>
`);

console.log("done:", pageList.length, "pages + robots.txt + sitemap.xml");
