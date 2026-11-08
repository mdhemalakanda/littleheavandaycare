# Media & content provenance — Kids Express School demo

All media belongs to **KIDS Express School And Day-Care center** and is pulled
from their official public Facebook presence:
https://www.facebook.com/kids.express.school/

Harvest date: **2026-11-05** (Safari AppleScript pipeline, logged-in session).

## Verified school facts (from the Facebook page)
- Name: KIDS Express School And Day-Care center — "KIDS EXPRESS PRE-SCHOOL AND DAY CARE"
- Positioning: "A Specialized Eng.Vers School For Toddler, Pre-Schooler, kindergarten goers with day care service. Serving parents since 2006."
- Phones: 01977-989213 (main, from page header/CTA), 01720-306752 (second)
  (the page About section also shows a "01977979213" variant — likely a typo; both header numbers are used on the site)
- Email: ferdausi.sumi34@gmail.com
- Address: 963, East Shewra Para (old Koborsthan Goli, at Shewra Para bus stand), Begum Rokeya Sarani, Mirpur — along Metro pillar 308, Dhaka 1216
- ~1.1K followers; category "School"; own domain kexpsdc.com is dead (DNS)
- Videos: 3 recent "Good day all…" posts (27 Oct) + 10 reels on the Reels tab
  (+ the example reel the client shared: facebook.com/reel/1638304324481425,
  "Rafsan is learning…")

## Photos
16 curated genuine school photos (birthday celebrations at the day-care,
classroom gatherings, cultural events, school banner, play corridor) +
named slots (hero/about/activities). All are **hotlinked fbcdn URLs** —
no local copies, per client instruction. Signed URLs may expire; regenerate
from `sources/*.txt` via the harvest pipeline.

Known exclusions: one "Dream Wall Studio" logo (unrelated ad/tag), profile
avatars, tiny thumbnails, and the ~270 unrelated images from the general
script-JSON pool (feed/ad contamination — never used).

## Videos
11 reels. Titles are honest generic descriptions based on thumbnail content
(book-learning scenes / group photo); view counts captured 2026-11-05.
Playback via iframely popup — nothing stored. If the school supplies original
video files later, swap `assets/data/videos.js` entries to local files.

## Demonstration content (clearly labelled on the site)
- Program structure (5 programs + ages) — plausible for an English-version
  pre-school but pending school confirmation
- Teacher profiles — sample cards, no real names/photos (the page publishes none)
- Testimonials — sample quotes marked as such
- Statistics beyond "20+ years": Happy Students 300+, Staff 15+ are placeholders
- Requirements/process steps on Admission — sample placeholders
- News dates: only the 27 Oct 2026 "Good day" post is date-verified; others
  intentionally show no date badge
