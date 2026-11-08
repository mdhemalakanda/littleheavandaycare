# Kids Express School — bilingual website demo

A complete, premium, bilingual (English + বাংলা) frontend demonstration for
**Kids Express School & Day-Care Centre**, Mirpur, Dhaka — built as a client
proposal. Static HTML/CSS/JS, zero build dependencies.

## Run it

```bash
node scripts/build.mjs      # compose site/ from templates/ + src/pages/
node scripts/qa.mjs         # i18n coverage + link + form audit
./scripts/serve.sh          # http://localhost:8130  (serves site/)
```

(Any static server pointed at `site/` works. Pages also work from `file://`
because scripts are classic, not modules.)

## Architecture

```
templates/        head / header / footer / scripts partials (shared chrome)
src/pages/        page fragments (content sections only)
scripts/build.mjs composes templates + fragments -> site/*.html
assets/css/style.css   full design system (tokens, components, responsive)
assets/js/i18n.js      language engine (data-i18n attributes, localStorage)
assets/js/translations.js   centralized EN + BN dictionary
assets/js/main.js      interactions: nav/drawer, gallery+lightbox, video
                       popups (iframely), carousel, count-up, form validation
assets/data/*.js       bilingual content: media, programs, teachers, news,
                       videos, testimonials
```

### Language system
- Centralized dictionary (`translations.js`), applied via `data-i18n` /
  `data-i18n-attr` attributes. No scattered conditionals.
- Persisted in `localStorage("kes_lang")`; consistent across all 16 pages,
  survives refresh and direct page opens.
- Typography swaps automatically for Bangla: Baloo Da 2 / Hind Siliguri via
  `html[lang="bn"]` rules, with extra line-height so Bangla never breaks.

### Media policy (per client instruction)
- Photos are **hotlinked from the school's Facebook CDN** — no local copies.
  fbcdn URLs are signed and can expire; regenerate lists via the Safari
  harvest pipeline (see `assets/data/sources/`).
- Videos play **in a popup via iframely**
  (`https://iframely.com/domains/facebook?url=<fb video url>`) — nothing is
  stored locally.

### Honest content rules
- Real, verified facts only (name, phones, email, address, since 2006, FB page).
- Programs structure, teacher profiles and testimonials are clearly-labelled
  demonstration content awaiting school confirmation.
- The demo form stores nothing and sends nothing.

## Future WordPress integration
Data files (`assets/data/*.js`) mirror the content model 1:1 (programs,
teachers, news, videos, gallery items) — each maps directly to a post type /
REST endpoint. i18n dictionary maps to a bilingual fields plugin (e.g. Polylang
multipack). Forms are ready to POST to a WP REST endpoint
(`wireForm` in main.js is the single integration point).
