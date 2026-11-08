# MEDIA PLACEMENT MAP — Little Heaven website

Every usable media item → exact website location. Statuses: EMBEDDED (Iframely), REMOTE-IMG (hotlinked),
LINK-ONLY (source link card), FALLBACK-READY (thumb unverified at script level; auto placeholder on failure).

## Home (index.html)
| Slot | Item | Status |
|---|---|---|
| Hero photo | FB page photo #1 (885184386) | REMOTE-IMG (200 ✓) |
| Hero floating cards | icon-only (no media) | — |
| About teaser photo | FB page photo #2 (886418345) | REMOTE-IMG (200 ✓) |
| Programs grid | 3 program cards → FB photos 888033376 / 886418345 / 884391221 | REMOTE-IMG |
| Activities grid | FB photos 883002202 / 887924980 / 885227119 / 883718039 | REMOTE-IMG |
| Stories grid (4) | I4 Dbav5sMCX4z, I5 DbVmSraCFPa, I6 Da2tnOIk9mJ, F17 reel/1791231542231454 | EMBEDDED (thumbs FALLBACK-READY) |
| Videos teaser (3) | F1 admission reel, F4 welcome, F6 problem-solving (first 3 of current list) | EMBEDDED |
| Gallery preview (6) | first 6 gallery items | REMOTE-IMG |

## About (about.html)
| Slot | Item | Status |
|---|---|---|
| Story photo | FB page photo #3 (888033376) | REMOTE-IMG |
| Sister-concern panel | Official logo JPG (og variant) | REMOTE-IMG (200 ✓) |
| Environment split | FB photos #4 (882624031) + #5 (884391221) | REMOTE-IMG |
| Team section | I6 teacher-story reel (kind filter) | EMBEDDED |

## Programs pages
| Page | Slot | Item | Status |
|---|---|---|---|
| programs.html | grid | 3 program photos | REMOTE-IMG |
| program-day-care.html | overview | FB photo 888033376 | REMOTE-IMG |
| program-preschool.html | overview + activities | FB photo 886418345 + act photos | REMOTE-IMG |
| program-playzone.html | overview | FB photo 884391221 | REMOTE-IMG |

## Activities (activities.html)
Slots act1–act4 = FB page photos #6–#9 (883002202, 887924980, 885227119, 883718039) — REMOTE-IMG (200 ✓).
Text sections reference F6/F9/F11/F12/F13/F14 reels (watch on Videos page).

## Gallery (gallery.html) — 15 items
| Item | Source URL | Status |
|---|---|---|
| fb-carousel-1..9 | FB page photo post | REMOTE-IMG (200 ✓) + lightbox source link (page photos) |
| ig-20260724 DbLTCykjItG | instagram.com/p/DbLTCykjItG/ | REMOTE-IMG + source link |
| ig-20260721 DbDkpLzEW0M | instagram.com/p/DbDkpLzEW0M/ | REMOTE-IMG + source link |
| ig-20260718 Da72dU2k0jM | instagram.com/p/Da72dU2k0jM/ | REMOTE-IMG + source link |
| ig-20260712 DasaAx2ky74 | instagram.com/p/DasaAx2ky74/ | FALLBACK-READY (403 scripted; placeholder on failure) |
| ig-20260710 DanPOWDk2pj | instagram.com/p/DanPOWDk2pj/ | REMOTE-IMG + source link |
| ig-20260708 DaiHxUbkxE2 | instagram.com/p/DaiHxUbkxE2/ | FALLBACK-READY |

## Videos (videos.html) — full collection, FB/IG filter chips
FB (14 embedded): F1 1714043582992391 · F2 2704890733274188 · F3 2742547902778426 · F4 1665213335165756 ·
F5 24875344582134317 · F6 1131473072699403 · F8 1854801555687143 · F9 2625944174521152 · F10 978271228109434 ·
F11 2005025860186458 · F12 2163596741204824 · F13 2033264850625880 · F14 946962911468261 · F15 1161905819276238 ·
F16 1505952047625714 · F17 1791231542231454 (16 total embedded)
FB link-only (2): F7 Color Matching 3-Nov-2026 (newest, permalink not yet indexed) · F18 Transportation Week.
IG (6 embedded): I1 DCt1YRMyxG_ · I2 DCtznlzyp3e · I3 DCtzVVGym1q · I4 Dbav5sMCX4z · I5 DbVmSraCFPa · I6 Da2tnOIk9mJ.
Every card: platform badge, category, duration (where known), title/desc from real captions, generator
preview link in the modal footer, and "Watch on Facebook/Instagram" source link.

## News (news.html + news-details.html) — 8 dated items
F7→3 Nov (source link) · F6→31 Oct · F8→29 Oct (Aiza) · F9→29 Oct (shopping) · F4→26 Oct ·
F12→17 Oct (handwashing/karate) · F1→28 Sep · F20→undated "Happy place" post (source link).

## Admission / Contact
No media slots; icon-only + WhatsApp/FB/IG links. Map = honest placeholder pending approval.

## Global
- og:image (every page) = official logo JPG variant (REMOTE-IMG 200 ✓).
- All <img> carry referrerpolicy="no-referrer", loading="lazy", alt text from verified captions.
- Automatic broken-image fallback: any failed thumb swaps to the branded cloud placeholder (main.js initImageFallback).
- Zero media files stored in the repo — every reference is a remote official URL.
