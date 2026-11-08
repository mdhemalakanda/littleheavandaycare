# PROJECT AUDIT — Kids Express → Little Heaven duplication source analysis

Audit date: 2026-11-08. Original project: `../kids-express` (untouched; git origin github.com/mdhemalakanda/kids-express-school.git, 1 commit).

## 1. Architecture (verified by reading every source file)

Zero-dependency static site. No backend, no database, no CMS, no package.json.

```
templates/         head.html / header.html / footer.html / scripts.html  (shared chrome)
src/pages/         16 page fragments (content sections only)
scripts/build.mjs  composes templates + fragments -> site/*.html, copies assets/, syncs docs/
scripts/qa.mjs     i18n key coverage (EN+BN) + internal link + form structure audit
scripts/serve.sh   python3 http.server on :8130
assets/css/style.css   45KB single design system (tokens, components, responsive)
assets/js/i18n.js  language engine: data-i18n attrs, localStorage "kes_lang", kes:langchange event
assets/js/main.js  all behaviour: sticky header, drawer, dropdowns, reveal-on-scroll, count-up,
                   gallery+filters+lightbox, video modal, testimonials carousel, programs/teachers/
                   news renderers, form validation + toast, media slot filler (data-media)
assets/data/*.js   window.KES_T (translations), window.KES_MEDIA (photo slots),
                   window.KES_DATA.{gallery,videos,programs,teachers,news,testimonials}
assets/data/sources/  Safari-harvested Facebook CDN URLs + page text (Kids Express school)
site/  docs/       built output (docs/ = GitHub Pages copy of site/)
```

Pages built (16): index, about, programs, program-{day-care,play-group,nursery,kindergarten,pre-primary},
teachers, activities, gallery, videos, news, news-details, admission, contact.

## 2. Design system (preserve — high quality)

- Tokens: cream base #FFF9F1, sky #3FA9D9, sun #FFC533, grass #58BE8A, coral #FF7A59, lav #9B8AE6, ink #2E3444.
- Type: Baloo Chettan 2 (display) + Nunito (body); Bangla swap: Baloo Da 2 + Hind Siliguri via html[lang="bn"].
- Radii 12–32px, soft shadows, pill buttons, squiggle accents, reveal-on-scroll (IntersectionObserver).
- Components: topbar, sticky header + drawer nav, page-hero + breadcrumbs, feature cards, program cards,
  gallery masonry-ish grid + lightbox, video cards + modal, timetable, info panels, forms with per-field
  validation, toast, stats band, CTA bands, back-top. Responsive breakpoints in style.css.

## 3. Media policy (original project)

Photos hotlinked from Facebook CDN (signed URLs, expire); videos via Facebook plugin iframe in a modal.
Docs/MANIFEST label demo content honestly (teacher profiles, testimonials = sample placeholders).

## 4. Reuse decisions for Little Heaven

KEEP as-is (architecture/quality): build system, i18n engine pattern, all CSS component structure,
lightbox, forms+validation, toast, reveal, count-up, drawer, QA script pattern.
REPLACE (business identity/content): logo SVG, favicon, palette accents, every text string, data files,
contact info, social links, page set (see PROJECT_REQUIREMENTS.md), video embed mechanism
(Facebook plugin → Iframely embed.js per new requirement), localStorage key kes_lang → lh_lang.
REMOVE: teachers.html (no verified staff data), 4 old program pages, docs/ = built-site sync
(docs/ now holds project documentation; build no longer syncs into it).
NEW: program-preschool.html, program-playzone.html, robots.txt, sitemap.xml via build.

## 5. Duplication safety

- rsync copy excluding .git / .DS_Store / node_modules; fresh `git init` + baseline commit in the copy.
- Original project not modified after duplication (only reads). Working tree of original stays clean.
- No secrets existed in the source (static demo; no env files, no keys).
