# Little Heaven Daycare & Preschool — bilingual website demo

A complete, premium, bilingual (English + বাংলা) static website for **Little Heaven -
Daycare, Preschool & Playzone**, Dhanmondi 4, Dhaka — built as a client proposal from
the Kids Express design foundation, fully rebranded and content-sourced from Little
Heaven's official Facebook and Instagram presence.

## Run it

```bash
node scripts/build.mjs      # compose site/ from templates/ + src/pages/
node scripts/qa.mjs         # i18n coverage + link + form + old-brand audit
./scripts/serve.sh          # http://localhost:8130  (serves site/)
```

(Any static server pointed at `site/` works. Pages also work from `file://`
because scripts are classic, not modules.)

## Architecture

```
templates/        head / header / footer / scripts partials (shared chrome)
src/pages/        13 page fragments (content sections only)
scripts/build.mjs composes templates + fragments -> site/*.html (+ robots.txt, sitemap.xml)
scripts/qa.mjs    i18n (EN+BN), internal links, form structure, old-brand scan
assets/css/style.css   design system (tokens, components, responsive, iframely styles)
assets/js/i18n.js      language engine (data-i18n attributes, localStorage lh_lang)
assets/js/iframely.js  URL whitelist + dynamic generator URLs + embed render/fallback
assets/js/main.js      interactions: nav/drawer, gallery+lightbox, video modal (Iframely
                       click-to-load + fallback), stories, programs, news, forms
assets/data/*.js       bilingual content: translations, media, videos (24 reels),
                       programs, news (8 dated posts), stories (4 official reels)
docs/                  project documentation + research sources (this is NOT the built site)
```

### Language system
- Centralized dictionary (`translations.js`, 332 keys × EN/BN), applied via `data-i18n`.
- Persisted in `localStorage("lh_lang")`; Bangla typography auto-swaps via `html[lang="bn"]`.

### Media policy (per client instruction)
- Photos are **hotlinked from the official Facebook/Instagram CDN** — no local copies.
  Signed URLs may expire; sources archived in `docs/research-sources/` for regeneration,
  and any failed image auto-swaps to a branded placeholder at runtime.
- Videos/Reels render as lazy inline **Iframely embed.js** embeds
  (`https://iframely.net/embed.js`, `data-iframely-url` = original post URL, `iframely.load()`
  near the viewport, timeout → honest fallback card with the original post link).
  Iframely's free keyless service cannot resolve FB/IG (verified 404), so each card falls back to
  the platform's own official embed (FB plugin iframe / IG /embed iframe) — keyless and reliable.
  Generator preview URLs (`https://iframely.com/domains/{facebook|instagram}?url=…`)
  are derived dynamically for every item and shown in each video modal for QA.
- Nothing is downloaded; nothing is re-hosted; every card links back to the original post.

### Honest content rules
- Real, verified facts only (name, phones, email, address, hours, shifts, ages, sister school).
- The 7-point "Why parents choose" list, activities, news items and stories all trace to
  official posts — see `docs/SOCIAL_MEDIA_AUDIT.md`.
- No invented teachers, testimonials, ratings, founding years or statistics.
- The demo form stores nothing and sends nothing.

## Documentation
`docs/PROJECT_AUDIT.md` · `SOCIAL_MEDIA_AUDIT.md` · `BRAND_GUIDELINES.md` ·
`PROJECT_REQUIREMENTS.md` · `MEDIA_PLACEMENT_MAP.md` · `IMPLEMENTATION_REPORT.md`
