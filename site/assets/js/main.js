/* ============================================================
   LITTLE HEAVEN — interactions & dynamic content
   Classic script (no modules) so the site works from file:// too.
   Depends on: i18n.js (LH_I18N), translations.js (LH_T),
               iframely.js (LH_IFRAMELY), data files (LH_DATA, LH_MEDIA).
   Videos/Reels render as LAZY INLINE Iframely embeds (official
   embed.js, rendered near the viewport) with honest fallback cards;
   nothing is downloaded and every card links to the original post.
   ============================================================ */
(function () {
  "use strict";

  var $  = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var LANG = function () { return window.LH_I18N.lang; };
  var pick = function (obj, lang, field) { field = field || "t"; return obj && obj[lang] && obj[lang][field] ? obj[lang][field] : (obj && obj.en && obj.en[field]) || ""; };
  var esc = function (s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  };

  var FB_ICON = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M13.5 21v-8h2.7l.4-3.2h-3.1V7.7c0-.9.3-1.6 1.7-1.6h1.5V3.2c-.3 0-1.2-.1-2.3-.1-2.4 0-4 1.4-4 4v2.7H7.6V13h2.8v8h3.1Z"/></svg>';
  var IG_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.2" cy="6.8" r="1.2" fill="currentColor" stroke="none"/></svg>';
  var CLOUD_ICON = '<svg viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="32" r="30" fill="rgba(63,169,217,.16)"/><ellipse cx="32" cy="16.5" rx="9" ry="3" fill="none" stroke="#FFC533" stroke-width="2.6"/><path d="M45 44H20a8 8 0 0 1-1.6-15.84A12 12 0 0 1 41.6 24 9 9 0 0 1 45 44Z" fill="#FFF9F1"/></svg>';

  /* ---------------- header / drawer / nav ---------------- */
  function initHeader() {
    var header = $(".site-header");
    if (!header) return;
    var onScroll = function () {
      header.classList.toggle("scrolled", window.scrollY > 8);
      var bt = $(".back-top");
      if (bt) bt.classList.toggle("show", window.scrollY > 550);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  function initDrawer() {
    var open = $(".hamburger"), close = $(".drawer-close"), overlay = $(".drawer-overlay");
    if (!open) return;
    open.addEventListener("click", function () { document.body.classList.add("drawer-open"); open.setAttribute("aria-expanded", "true"); });
    if (close) close.addEventListener("click", closeDrawer);
    if (overlay) overlay.addEventListener("click", closeDrawer);
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeDrawer(); });
    $$(".drawer nav a").forEach(function (a) { a.addEventListener("click", closeDrawer); });
    function closeDrawer() { document.body.classList.remove("drawer-open"); if (open) open.setAttribute("aria-expanded", "false"); }
  }

  function initDropdowns() {
    if (!window.matchMedia("(hover: none)").matches) return;
    $$(".main-nav > li.has-drop > .nav-link").forEach(function (link) {
      link.addEventListener("click", function (e) {
        var li = link.parentElement;
        if (!li.classList.contains("open")) {
          e.preventDefault();
          $$(".main-nav > li.open").forEach(function (o) { if (o !== li) o.classList.remove("open"); });
          li.classList.add("open");
        }
      });
    });
    document.addEventListener("click", function (e) {
      if (!e.target.closest(".main-nav")) $$(".main-nav > li.open").forEach(function (o) { o.classList.remove("open"); });
    });
  }

  function initReveal() {
    var els = $$(".reveal");
    if (!els.length) return;
    if (!("IntersectionObserver" in window)) { els.forEach(function (e) { e.classList.add("in"); }); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
      });
    }, { threshold: 0.12 });
    els.forEach(function (e) { io.observe(e); });
  }

  function initBackTop() {
    var bt = $(".back-top");
    if (!bt) return;
    bt.addEventListener("click", function () { window.scrollTo({ top: 0, behavior: "smooth" }); });
  }

  /* ---------------- gallery + lightbox ---------------- */
  var galleryState = { filter: "all", lightboxList: [], lbIndex: 0 };

  function renderGallery() {
    var grid = $("[data-gallery-grid]");
    if (!grid || !window.LH_DATA || !LH_DATA.gallery) return;
    var lim = parseInt(grid.getAttribute("data-limit") || "0", 10);
    var data = LH_DATA.gallery.filter(function (g) {
      return galleryState.filter === "all" || g.cat === galleryState.filter;
    });
    if (lim > 0) data = data.slice(0, lim);
    galleryState.lightboxList = data;
    grid.innerHTML = data.map(function (g, i) {
      var shape = g.tall ? "g-tall" : (g.wide ? "g-wide" : "");
      return '<figure class="gallery-item reveal ' + shape + '" data-gi="' + i + '" tabindex="0" role="button" aria-label="' + esc(pick(g, LANG())) + '">' +
        '<img src="' + esc(g.src) + '" alt="' + esc(pick(g, LANG())) + '" loading="lazy" referrerpolicy="no-referrer">' +
        '<span class="gi-zoom" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3M11 8v6M8 11h6"/></svg></span>' +
        '<figcaption class="gi-veil"><b>' + esc(pick(g, LANG())) + '</b><span data-cat="' + g.cat + '"></span></figcaption>' +
        '</figure>';
    }).join("");
    applyCatLabels();
    initReveal();
    $$("figure.gallery-item", grid).forEach(function (fig) {
      fig.addEventListener("click", function () { openLightbox(parseInt(fig.getAttribute("data-gi"), 10)); });
      fig.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openLightbox(parseInt(fig.getAttribute("data-gi"), 10)); } });
    });
  }

  function applyCatLabels() {
    $$("[data-cat]").forEach(function (el) {
      el.textContent = window.LH_I18N.t("gallery.cat." + el.getAttribute("data-cat"));
    });
  }

  function initGalleryFilters() {
    var wrap = $(".filter-chips");
    if (!wrap) return;
    $$("button.chip", wrap).forEach(function (chip) {
      chip.addEventListener("click", function () {
        $$("button.chip", wrap).forEach(function (c) { c.classList.remove("on"); });
        chip.classList.add("on");
        galleryState.filter = chip.getAttribute("data-filter") || "all";
        renderGallery();
      });
      var f = chip.getAttribute("data-filter");
      chip.textContent = window.LH_I18N.t("gallery.chip." + (f || "all"));
    });
  }

  function ensureLightbox() {
    if ($(".lightbox")) return $(".lightbox");
    var lb = document.createElement("div");
    lb.className = "lightbox";
    lb.innerHTML =
      '<button class="lb-close" aria-label="Close"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M18 6L6 18M6 6l12 12"/></svg></button>' +
      '<span class="lb-count"></span>' +
      '<button class="lb-btn lb-prev" aria-label="Previous"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M15 18l-6-6 6-6"/></svg></button>' +
      '<div class="lb-body"><img src="" alt=""><div class="lb-caption"><b></b><span></span><a class="lb-source" target="_blank" rel="noopener" href="#">Open source post ↗</a></div></div>' +
      '<button class="lb-btn lb-next" aria-label="Next"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M9 6l6 6-6 6"/></svg></button>';
    document.body.appendChild(lb);
    $(".lb-close", lb).addEventListener("click", closeLightbox);
    $(".lb-prev", lb).addEventListener("click", function () { stepLightbox(-1); });
    $(".lb-next", lb).addEventListener("click", function () { stepLightbox(1); });
    lb.addEventListener("click", function (e) { if (e.target === lb) closeLightbox(); });
    document.addEventListener("keydown", function (e) {
      if (!lb.classList.contains("open")) return;
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowLeft") stepLightbox(-1);
      if (e.key === "ArrowRight") stepLightbox(1);
    });
    return lb;
  }
  function openLightbox(i) {
    var lb = ensureLightbox();
    galleryState.lbIndex = i;
    updateLightbox(lb);
    lb.classList.add("open");
    document.body.style.overflow = "hidden";
  }
  function closeLightbox() {
    var lb = $(".lightbox");
    if (lb) lb.classList.remove("open");
    document.body.style.overflow = "";
  }
  function stepLightbox(d) {
    var n = galleryState.lightboxList.length;
    if (!n) return;
    galleryState.lbIndex = (galleryState.lbIndex + d + n) % n;
    updateLightbox($(".lightbox"));
  }
  function updateLightbox(lb) {
    var g = galleryState.lightboxList[galleryState.lbIndex];
    if (!g) return;
    $("img", lb).src = g.src;
    $("img", lb).alt = pick(g, LANG());
    $(".lb-caption b", lb).textContent = pick(g, LANG());
    $(".lb-caption span", lb).textContent = window.LH_I18N.t("gallery.cat." + g.cat);
    var src = $(".lb-source", lb);
    if (g.srcUrl) { src.href = g.srcUrl; src.style.display = "inline-flex"; }
    else { src.style.display = "none"; }
    $(".lb-count", lb).textContent = (galleryState.lbIndex + 1) + " / " + galleryState.lightboxList.length;
  }

  /* ---------------- lazy inline Iframely embeds ---------------- */
  var embedObserver = null;

  function sourceLabel(url) {
    return window.LH_I18N.t(window.LH_IFRAMELY.platformOf(url) === "instagram" ? "videos.watchOnIg" : "videos.watchOnFb");
  }

  function fallbackHtml(url) {
    return '<div class="vm-fallback"><div class="vm-fb-icon">' + CLOUD_ICON + '</div>' +
      '<p class="vm-fb-note">' + esc(window.LH_I18N.t("videos.fallbackNote")) + '</p>' +
      '<div class="vm-fb-actions"><a class="btn btn-sky btn-sm" target="_blank" rel="noopener" href="' + esc(url) + '">' + esc(sourceLabel(url)) + ' ↗</a></div></div>';
  }

  function pendingHtml(pageUrl) {
    return '<div class="vm-fallback"><div class="vm-fb-icon">' + CLOUD_ICON + '</div>' +
      '<p class="vm-fb-note">' + esc(window.LH_I18N.t("videos.pendingNote")) + '</p>' +
      '<div class="vm-fb-actions"><a class="btn btn-sky btn-sm" target="_blank" rel="noopener" href="' + esc(pageUrl) + '">' + esc(window.LH_I18N.t("videos.watchOnFb")) + ' ↗</a></div></div>';
  }

  function mountEmbed(host) {
    if (host.dataset.mounted) return;
    host.dataset.mounted = "1";
    var url = host.getAttribute("data-embed-url");
    var title = host.getAttribute("data-embed-title") || "Video";
    if (window.LH_IFRAMELY.iframelyFirst()) {
      /* Key configured: Iframely first, platform embed on failure. */
      window.LH_IFRAMELY.render(host, url, title, function (ok) {
        if (ok) return;
        var plat = window.LH_IFRAMELY.platformEmbedHtml(url);
        host.innerHTML = plat
          ? '<div class="iframely-responsive">' + plat + '</div>'
          : fallbackHtml(url);
      });
    } else {
      /* Keyless: platform embed renders INSTANTLY. Iframely keyless cannot
         resolve FB/IG (verified 404), so waiting 6s per card helps nobody. */
      var plat = window.LH_IFRAMELY.platformEmbedHtml(url);
      host.innerHTML = plat
          ? '<div class="iframely-responsive embed-platform">' + plat + '</div>'
          : fallbackHtml(url);
    }
  }

  function observeEmbeds() {
    var hosts = $$("[data-embed-url]");
    if (!hosts.length) return;
    if (!("IntersectionObserver" in window)) { hosts.forEach(mountEmbed); return; }
    if (!embedObserver) {
      embedObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (!en.isIntersecting) return;
          embedObserver.unobserve(en.target);
          mountEmbed(en.target);
        });
      }, { rootMargin: "300px 0px" });
    }
    hosts.forEach(function (host) { embedObserver.observe(host); });
  }

  /* ---------------- videos ---------------- */
  var videoState = { platform: "all" };

  function currentVideos() {
    return LH_DATA.videos.filter(function (v) {
      return videoState.platform === "all" || v.platform === videoState.platform;
    });
  }

  function platformBadge(p) {
    return p === "instagram"
      ? '<span class="vc-platform p-ig">' + IG_ICON + 'Instagram</span>'
      : '<span class="vc-platform p-fb">' + FB_ICON + 'Facebook</span>';
  }

  function renderVideos() {
    var grid = $("[data-videos-grid]");
    if (!grid || !window.LH_DATA || !LH_DATA.videos) return;
    var lim = parseInt(grid.getAttribute("data-limit") || "0", 10);
    var list = currentVideos().slice(0, lim > 0 ? lim : currentVideos().length);
    grid.innerHTML = list.map(function (v, i) {
      var catLabel = window.LH_I18N.t("videos.cat." + (v.cat || "learning"));
      var embedArea;
      if (v.status === "pending-permalink" || !v.originalUrl) {
        embedArea = '<div class="vc-embed">' + pendingHtml(v.pageUrl || "https://www.facebook.com/littleheavendaycarepreschool/videos") + '</div>';
      } else if (v.embedBlocked) {
        /* Facebook itself refuses this embed — show the honest source card. */
        embedArea = '<div class="vc-embed">' + fallbackHtml(v.originalUrl) + '</div>';
      } else {
        embedArea = '<div class="vc-embed" data-embed-url="' + esc(v.originalUrl) + '" data-embed-title="' + esc(pick(v, LANG())) + '"></div>';
      }
      var srcLink = v.originalUrl
        ? '<a class="vc-source" target="_blank" rel="noopener" href="' + esc(v.originalUrl) + '">' + esc(sourceLabel(v.originalUrl)) + ' ↗</a>'
        : "";
      var head = '<span class="vc-head">' + platformBadge(v.platform) +
        (v.dur ? '<span class="vc-duration-inline">' + esc(v.dur) + '</span>' : "") +
        '<span class="vc-cat">' + esc(catLabel) + '</span></span>';
      return '<article class="video-card reveal" style="transition-delay:' + (i * 0.06) + 's">' +
        embedArea +
        '<div class="vc-body">' + head +
        '<h3>' + esc(pick(v, LANG())) + '</h3><p>' + esc(pick(v, LANG(), "d")) + '</p>' +
        srcLink + '</div></article>';
    }).join("");
    initReveal();
    observeEmbeds();
  }

  function initVideoFilters() {
    var wrap = $(".video-chips");
    if (!wrap) return;
    $$("button.chip", wrap).forEach(function (chip) {
      chip.addEventListener("click", function () {
        $$("button.chip", wrap).forEach(function (c) { c.classList.remove("on"); });
        chip.classList.add("on");
        videoState.platform = chip.getAttribute("data-platform") || "all";
        renderVideos();
      });
      var p = chip.getAttribute("data-platform");
      chip.textContent = window.LH_I18N.t("videos." + (p || "all"));
    });
  }

  /* ---------------- stories (real reels) ---------------- */
  function renderStories() {
    var grid = $("[data-stories-grid]");
    if (!grid || !window.LH_DATA || !LH_DATA.stories) return;
    var lim = parseInt(grid.getAttribute("data-limit") || "0", 10);
    var kind = grid.getAttribute("data-kind");
    var pool = kind ? LH_DATA.stories.filter(function (s) { return s.kind === kind; }) : LH_DATA.stories;
    var list = pool.slice(0, lim > 0 ? lim : pool.length);
    grid.innerHTML = list.map(function (s, i) {
      var v = LH_DATA.videos.find(function (x) { return x.id === s.videoId; });
      if (!v) return "";
      var kindLabel = s.kind === "teacher"
        ? (LANG() === "bn" ? "শিক্ষিকা" : "Teacher")
        : (LANG() === "bn" ? "অভিভাবক" : "Parent");
      var embedArea = (v.originalUrl && v.status === "confirmed" && !v.embedBlocked)
        ? '<div class="vc-embed" data-embed-url="' + esc(v.originalUrl) + '" data-embed-title="' + esc(pick(s, LANG())) + '"></div>'
        : '<div class="vc-embed">' + pendingHtml(v.pageUrl || "https://www.facebook.com/littleheavendaycarepreschool/videos") + '</div>';
      return '<article class="story-card reveal" style="transition-delay:' + (i * 0.06) + 's">' +
        embedArea +
        '<div class="sc-body"><span class="vc-head">' + platformBadge(v.platform) +
        '<span class="sc-kind k-' + s.kind + '">' + esc(kindLabel) + '</span></span>' +
        '<p>' + esc(pick(s, LANG())) + '</p><span>' + esc(pick(s, LANG(), "d")) + '</span>' +
        (v.originalUrl ? '<a class="vc-source" target="_blank" rel="noopener" href="' + esc(v.originalUrl) + '">' + esc(sourceLabel(v.originalUrl)) + ' ↗</a>' : "") +
        '</div></article>';
    }).join("");
    initReveal();
    observeEmbeds();
  }

  /* ---------------- programs ---------------- */
  function renderPrograms() {
    var grid = $("[data-programs-grid]");
    if (!grid || !window.LH_DATA || !LH_DATA.programs) return;
    var lim = parseInt(grid.getAttribute("data-limit") || "0", 10);
    var list = LH_DATA.programs.slice(0, lim > 0 ? lim : LH_DATA.programs.length);
    grid.innerHTML = list.map(function (p, i) {
      var imgSrc = (window.LH_MEDIA && LH_MEDIA[p.img] && LH_MEDIA[p.img].src) || "";
      return '<article class="program-card card tint-' + p.tint + ' reveal" style="transition-delay:' + (i * 0.06) + 's">' +
        '<div class="pc-media"><img src="' + esc(imgSrc) + '" alt="' + esc(pick(p, LANG())) + '" loading="lazy" referrerpolicy="no-referrer">' +
        '<span class="pc-age">' + esc(pick(p, LANG(), "age")) + '</span></div>' +
        '<div class="pc-body"><h3>' + esc(pick(p, LANG())) + '</h3>' +
        '<p>' + esc(pick(p, LANG(), "short")) + '</p>' +
        '<a class="pc-link" href="' + esc(p.href) + '"><span data-i18n="common.learnMore"></span>' +
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M5 12h14M13 6l6 6-6 6"/></svg></a></div>' +
        '</article>';
    }).join("");
    localizeInjected(grid);
    initReveal();
  }

  function localizeInjected(scope) {
    $$("[data-i18n]", scope).forEach(function (el) { el.textContent = window.LH_I18N.t(el.getAttribute("data-i18n")); });
  }

  /* ---------------- news ---------------- */
  function renderNews() {
    var grid = $("[data-news-grid]");
    if (!grid || !window.LH_DATA || !LH_DATA.news) return;
    var lim = parseInt(grid.getAttribute("data-limit") || "0", 10);
    var list = LH_DATA.news.slice(0, lim > 0 ? lim : LH_DATA.news.length);
    grid.innerHTML = list.map(function (n, i) {
      var d = n.date ? new Date(n.date) : null;
      var months = window.LH_I18N.t("meta.months").split(",");
      var m = d ? (months[d.getMonth()] || "") : "";
      var dateBadge = d ? '<span class="nc-date"><b>' + d.getDate() + '</b><span>' + esc(m) + '</span></span>' : "";
      return '<article class="news-card card reveal" style="transition-delay:' + (i * 0.06) + 's">' +
        '<div class="nc-media"><img src="' + esc(n.thumb) + '" alt="' + esc(pick(n, LANG())) + '" loading="lazy" referrerpolicy="no-referrer">' +
        dateBadge + '</div>' +
        '<div class="nc-body"><span class="nc-tag">' + esc(window.LH_I18N.t("news.cat." + n.cat)) + '</span>' +
        '<h3>' + esc(pick(n, LANG())) + '</h3><p>' + esc(pick(n, LANG(), "excerpt")) + '</p>' +
        '<a class="pc-link" href="news-details.html?id=' + esc(n.id) + '"><span data-i18n="common.readMore"></span>' +
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M5 12h14M13 6l6 6-6 6"/></svg></a></div>' +
        '</article>';
    }).join("");
    localizeInjected(grid);
    initReveal();
  }

  function renderNewsDetails() {
    var host = $("#newsArticle");
    if (!host || !window.LH_DATA || !LH_DATA.news) return;
    var id = new URLSearchParams(location.search).get("id");
    var n = LH_DATA.news.find(function (x) { return x.id === id; }) || LH_DATA.news[0];
    function paint() {
      var d = new Date(n.date);
      var months = window.LH_I18N.t("meta.months").split(",");
      document.title = n[LANG()].t + " — " + window.LH_I18N.t("brand.name");
      host.innerHTML =
        '<div class="nd-hero"><img src="' + esc(n.thumb) + '" alt="' + esc(n[LANG()].t) + '" loading="lazy" referrerpolicy="no-referrer"></div>' +
        '<span class="eyebrow" style="margin-top:26px">' + esc(window.LH_I18N.t("news.cat." + n.cat)) + '</span>' +
        '<h1 style="font-size:clamp(1.7rem,3.4vw,2.5rem)">' + esc(n[LANG()].t) + '</h1>' +
        (n.date ? '<p style="color:var(--ink-faint);font-weight:700">' + d.getDate() + " " + (months[d.getMonth()] || "") + " " + d.getFullYear() + '</p>' : '') +
        n[LANG()].body.map(function (par) { return '<p style="color:var(--ink-soft);font-size:1.03rem">' + esc(par) + '</p>'; }).join("") +
        '<a class="btn btn-sky" target="_blank" rel="noopener" href="' + esc(n.fbUrl) + '">' + esc(window.LH_I18N.t("news.seeOnFb")) + '</a>';
    }
    paint();
    document.addEventListener("lh:langchange", paint);
  }

  /* ---------------- forms + toast ---------------- */
  function initForms() {
    $$("form[data-form]").forEach(function (form) { wireForm(form); });
  }

  function validateField(field) {
    var v = field.value.trim();
    var type = field.getAttribute("data-validate");
    var wrap = field.closest(".form-field");
    var errKey = null;
    if (field.required && !v) errKey = "form.errRequired";
    else if (v && type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) errKey = "form.errEmail";
    else if (v && type === "phone" && !/^(?:\+?880|0)1[3-9]\d{8}$/.test(v.replace(/[\s-]/g, ""))) errKey = "form.errPhone";
    if (wrap) {
      wrap.classList.toggle("error", !!errKey);
      var msg = wrap.querySelector(".field-error");
      if (msg && errKey) msg.textContent = window.LH_I18N.t(errKey);
    }
    return !errKey;
  }

  function wireForm(form) {
    var fields = $$("input, select, textarea", form);
    fields.forEach(function (f) {
      f.addEventListener("blur", function () { validateField(f); });
      f.addEventListener("input", function () { if (f.closest(".form-field").classList.contains("error")) validateField(f); });
    });
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var allOk = true, firstBad = null;
      fields.forEach(function (f) {
        if (!validateField(f) && !firstBad) firstBad = f;
        if (!validateField(f)) allOk = false;
      });
      if (!allOk) { if (firstBad) firstBad.focus(); return; }
      form.reset();
      showToast(window.LH_I18N.t(form.getAttribute("data-success-key") || "form.toastSuccess"));
    });
  }

  function showToast(text) {
    var old = $(".toast");
    if (old) old.remove();
    var t = document.createElement("div");
    t.className = "toast";
    t.innerHTML = '<span class="t-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M20 6L9 17l-5-5"/></svg></span><span>' + esc(text) + '</span>';
    document.body.appendChild(t);
    requestAnimationFrame(function () { t.classList.add("show"); });
    setTimeout(function () { t.classList.remove("show"); setTimeout(function () { t.remove(); }, 450); }, 4200);
  }

  /* ---------------- media slots ---------------- */
  function fillMedia() {
    if (!window.LH_MEDIA) return;
    $$("[data-media]").forEach(function (img) {
      var slot = window.LH_MEDIA[img.getAttribute("data-media")];
      if (slot && slot.src) {
        if (!img.getAttribute("src")) img.src = slot.src;
      }
    });
  }

  /* ---------------- broken-image fallback ---------------- */
  function initImageFallback() {
    var PH = '<svg viewBox="0 0 64 64" class="img-ph-svg" aria-hidden="true"><circle cx="32" cy="32" r="30" fill="rgba(255,255,255,.14)"/><ellipse cx="32" cy="16.5" rx="9" ry="3" fill="none" stroke="#FFC533" stroke-width="2.6"/><path d="M45 44H20a8 8 0 0 1-1.6-15.84A12 12 0 0 1 41.6 24 9 9 0 0 1 45 44Z" fill="rgba(255,255,255,.85)"/></svg>';
    function toPlaceholder(img) {
      var host = img.closest(".vc-thumb, .sc-thumb, .gallery-item, .pc-media, .split-media, .hero-photo-frame, .nc-media, .activity-card, .nd-hero");
      if (!host || host.dataset.phApplied) return;
      host.dataset.phApplied = "1";
      img.style.display = "none";
      var span = document.createElement("span");
      span.className = "vc-placeholder";
      span.innerHTML = PH;
      host.insertBefore(span, host.firstChild);
    }
    document.addEventListener("error", function (e) {
      var t = e.target;
      if (t && t.tagName === "IMG") toPlaceholder(t);
    }, true);
    window.setTimeout(function () {
      $$("img").forEach(function (img) {
        if (img.complete && img.naturalWidth === 0) toPlaceholder(img);
      });
    }, 2500);
  }

  /* ---------------- boot ---------------- */
  document.addEventListener("DOMContentLoaded", function () {
    initHeader(); initDrawer(); initDropdowns(); initReveal(); initBackTop();
    initGalleryFilters(); renderGallery();
    initVideoFilters(); renderVideos();
    renderStories();
    renderPrograms(); renderNews(); renderNewsDetails(); fillMedia();
    initForms(); initImageFallback();
    document.addEventListener("lh:langchange", function () {
      renderGallery(); renderVideos(); renderStories(); renderPrograms(); renderNews();
      initGalleryFilters(); initVideoFilters(); applyCatLabels(); initReveal(); fillMedia();
    });
  });
})();
