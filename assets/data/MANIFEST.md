# Media & content provenance — Little Heaven Daycare & Preschool

All media and business facts belong to **Little Heaven - Daycare, Preschool & Playzone**,
pulled from their official public pages:
- Facebook: https://www.facebook.com/littleheavendaycarepreschool (4,921 followers)
- Instagram: https://www.instagram.com/littleheavendaycarepreschool/ (138 posts)

Harvest date: **2026-11-08** (web-reader + web-search; logged-out, no downloads).

## Facts source of truth
docs/research-sources/fb-page-intro.txt · fb-posts-captions.txt · ig-profile.txt · iframely-checks.txt
Full audit: docs/SOCIAL_MEDIA_AUDIT.md · placement: docs/MEDIA_PLACEMENT_MAP.md

## Photos (assets/data/media.js)
- `logo` / `logoJpg`: official FB profile picture (PNG + JPG variants) — hotlinked CDN URLs.
- 9 square page photos from the FB photo carousel — used for hero/about/environment/activity slots.
- 6 Instagram photo-post CDN URLs (640px) in LH_DATA.gallery + 9 of the FB photos = 15 gallery items.
All are signed CDN URLs (valid until ~late Nov 2026 `oe=` parameter) — regenerate from
docs/research-sources/ if they expire. Nothing is stored locally.

## Videos & Reels (assets/data/videos.js) — 24 items
- 18 Facebook reels: 16 og-verified permalinks + 2 pending-permalink items
  (Color Matching 3 Nov 2026 — newest post, not yet indexed; Transportation Week collage — no page permalink).
- 6 Instagram reels (3 launch reels Nov 2024, 2 parent stories, 1 teacher story).
- Thumbs: official CDN where mapped; unmapped items render a branded cloud placeholder.
- Playback: Iframely embed.js (https://iframely.net/embed.js), click-to-load modal,
  data-iframely-url = original post URL; fallback card with source link on failure.

## Demo content (clearly labelled on the site)
- Admission requirements checklist — sample placeholders pending school confirmation.
- Daily daycare rhythm — derived from official post snippets; exact times to be confirmed.
- Forms store nothing and send nothing.
