/* Programs data — bilingual.
   NOTE: Kids Express School's Facebook presence verifies the school type
   (English-version pre-school + day-care, toddlers → kindergarten). The
   five-program structure below is a DEMONSTRATION layout pending the
   school's confirmation; copy is written to be easily editable. */
window.KES_DATA = window.KES_DATA || {};
window.KES_DATA.programs = [
  {
    id: "day-care", href: "program-day-care.html", tint: "sky",
    img: window.KES_MEDIA ? KES_MEDIA.about.src : "",
    en: { name: "Day-Care", age: "Ages 1.5+", short: "A safe, loving second home for your child while you work — care, meals, naps and play." },
    bn: { name: "ডে-কেয়ার", age: "১.৫ বছর+", short: "বাবা-মা কাজে থাকলনে শিশুর জন্য নিরাপদ, স্নেহময় দ্বিতীয় ঘর — যত্ন, খাওয়া, বিশ্রাম আর খেলা।" }
  },
  {
    id: "play-group", href: "program-play-group.html", tint: "coral",
    img: window.KES_MEDIA ? KES_MEDIA.act4.src : "",
    en: { name: "Play Group", age: "Ages 2–3", short: "First steps into school life — colours, rhymes, toys and lots of gentle fun." },
    bn: { name: "প্লে গ্রুপ", age: "২–৩ বছর", short: "স্কুলজীবনের প্রথম পাতা — রং, ছড়া, খেলনা আর আনন্দের মিশেল।" }
  },
  {
    id: "nursery", href: "program-nursery.html", tint: "grass",
    img: window.KES_MEDIA ? KES_MEDIA.act3.src : "",
    en: { name: "Nursery", age: "Ages 3–4", short: "Learning through stories, songs and hands-on play — letters and numbers become friends." },
    bn: { name: "নার্সারি", age: "৩–৪ বছর", short: "গল্প, গান আর খেলায় খেলায় শেখা — অক্ষর আর সংখ্যা হয়ে ওঠে বন্ধু।" }
  },
  {
    id: "kindergarten", href: "program-kindergarten.html", tint: "lav",
    img: window.KES_MEDIA ? KES_MEDIA.act1.src : "",
    en: { name: "Kindergarten", age: "Ages 4–5", short: "Confident English, early reading and writing, and joyful school readiness." },
    bn: { name: "কিন্ডারগার্টেন", age: "৪–৫ বছর", short: "আত্মবিশ্বাসী ইংরেজি, পড়া-লেখার শুরু আর স্কুলের জন্য প্রস্তুতি।" }
  },
  {
    id: "pre-primary", href: "program-pre-primary.html", tint: "sun",
    img: window.KES_MEDIA ? KES_MEDIA.act2.src : "",
    en: { name: "Pre-Primary", age: "Ages 5–6", short: "The strong bridge into primary school — habits, skills and confidence that last." },
    bn: { name: "প্রি-প্রাইমারি", age: "৫–৬ বছর", short: "প্রাইমারি স্কুলে যাওয়ার শক্ত সেতু — স্থায়ী অভ্যাস, দক্ষতা আর আত্মবিশ্বাস।" }
  }
];
