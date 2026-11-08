# PROJECT REQUIREMENTS — Little Heaven Daycare & Preschool website

## Objectives
1. A polished bilingual (EN/BN) demo website that presents Little Heaven's real services and real social media content.
2. All Facebook/Instagram media served via remote official URLs and Iframely embeds — zero downloads.
3. Every visible interaction works on static hosting (file:// friendly).

## Audience & journeys
- Parents in Dhanmondi/Dhaka researching daycare/preschool: Home → Programs → Admission form / call.
- Parents verifying authenticity: Gallery / Videos (real posts) → Facebook/Instagram links.
- Returning parents: News & Events for the latest activities.

## Sitemap (13 pages — evidence-based, replaces Kids Express's 16)
| Page | Purpose |
|---|---|
| index.html | Hero, intro, programmes, why-us (verified 7-point list), activities, parent/teacher story reels, gallery preview, admission CTA |
| about.html | Story (verified intro), what we believe, environment, sister-concern note |
| programs.html | Overview grid (3 verified programmes) |
| program-day-care.html | Full/half-day daycare, ages 6 months+, hours, daily rhythm (verified snippets) |
| program-preschool.html | 2 shifts, Sun–Thu, from age 2, play-based approach (verified captions) |
| program-playzone.html | Fri–Sat 3:30–5:00 PM, ages 3–10, equipped indoor playzone |
| activities.html | Activity features, each backed by a real post/reel |
| gallery.html | Filterable photo gallery from official FB/IG CDN URLs + lightbox |
| videos.html | Complete video/Reel collection via Iframely, click-to-load, FB/IG filter chips |
| news.html / news-details.html | Dated event cards from real posts (Sep 28 – Nov 3, 2026) |
| admission.html | Verified timings/ages, honest sample checklist, inquiry form, call CTAs |
| contact.html | Contact cards (phone/email/address/hours), form, social links, map placeholder |

Removed vs Kids Express: teachers.html (page publishes no staff profiles; team shown via verified
teacher-story reel on About), play-group/nursery/kindergarten/pre-primary programme pages (no evidence).

## Functional requirements
1. Iframely integration (assets/js/iframely.js + main.js):
   - Single async load of https://iframely.net/embed.js.
   - Click-to-load modal: iframely-embed / iframely-responsive structure with data-iframely-url + iframely.load().
   - URL whitelist: facebook.com (/reel/, /videos/, /watch, /posts/) and instagram.com (/reel/, /p/, /reels/).
   - Fallback card with original-post link if embed fails, iframe errors, or times out.
   - Generator URLs (https://iframely.com/domains/{facebook|instagram}?url=…) kept in data + modal footer for QA.
2. i18n EN/BN via data-i18n, localStorage lh_lang, dictionary rewritten for every key.
3. Gallery filters (moments/classroom/activities/celebration), lightbox with captions + source link.
4. Video cards with platform badges; FB/IG filter chips on videos page.
5. Forms: same validation flow (demo, no backend) — honest demo note retained.
6. SEO: unique title/desc per page, JSON-LD ChildCare block (verified data only, no invented domain),
   og tags, robots.txt + sitemap.xml emitted by build, alt text everywhere.
7. Performance: photos lazy + referrerpolicy=no-referrer; embeds only on click; no layout shift.

## Media requirements
- Photos: FB page photo-CDN URLs (9-photo recent carousel), IG photo CDN URLs (6 posts), official logo
  (PNG/JPG variants). All remote. Signed-URL expiry documented; regeneration notes in research sources.
- Videos/Reels: FB reels (permalinks where verified) + all 6 IG reels. Thumbnails from official CDN.

## Acceptance
- node scripts/build.mjs → 13 pages build; node scripts/qa.mjs → 0 i18n/link/form problems.
- grep across src/templates/assets for kids-express/KES branding → zero public-facing hits.
- All internal links resolve; all external media URLs curl-tested (status + content-type).
