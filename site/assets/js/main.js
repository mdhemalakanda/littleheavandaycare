/* ============================================================
   LITTLE HEAVEN — interactions & dynamic content
   Classic script (no modules) so the site works from file:// too.
   Depends on: i18n.js (LH_I18N), translations.js (LH_T),
               iframely.js (LH_IFRAMELY), data files (LH_DATA, LH_MEDIA).
   Videos/Reels render via Iframely embed.js — click to load,
   with an honest fallback card when an embed is unavailable.
   ============================================================ */
(function () {
  "use strict";

  var $  = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var LANG = function () { return window.LH_I18N.lang; };
  var pick = function (obj, field) { return obj && obj[field] ? obj[field][LANG()] || obj[field].en : ""; };
  var esc = function (s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  };

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

  var FB_ICON = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M13.5 21v-8h2.7l.4-3.2h-3.1V7.7c0-.9.3-1.6 1.7-1.6h1.5V3.2c-.3 0-1.2-.1-2.3-.1-2.4 0-4 1.4-4 4v2.7H7.6V13h2.8v8h3.1Z"/></svg>';
  var IG_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.2" cy="6.8" r="1.2" fill="currentColor" stroke="none"/></svg>';

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

  /* ---------------- videos via Iframely ---------------- */
  var videoState = { platform: "all", list: [] };

  function currentVideos() {
    return LH_DATA.videos.filter(function (v) {
      return videoState.platform === "all" || v.platform === videoState.platform;
    });
  }

  function thumbHtml(v, cls) {
    if (v.thumb) {
      return '<img src="' + esc(v.thumb) + '" alt="" loading="lazy" referrerpolicy="no-referrer">';
    }
    return '<span class="vc-placeholder ' + (cls || '') + '" aria-hidden="true">' +
      '<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="30" fill="rgba(255,255,255,.14)"/><ellipse cx="32" cy="16.5" rx="9" ry="3" fill="none" stroke="#FFC533" stroke-width="2.6"/><path d="M45 44H20a8 8 0 0 1-1.6-15.84A12 12 0 0 1 41.6 24 9 9 0 0 1 45 44Z" fill="rgba(255,255,255,.85)"/></svg>' +
      '</span>';
  }

  function renderVideos() {
    var grid = $("[data-videos-grid]");
    if (!grid || !window.LH_DATA || !LH_DATA.videos) return;
    var lim = parseInt(grid.getAttribute("data-limit") || "0", 10);
    var list = currentVideos().slice(0, lim > 0 ? lim : currentVideos().length);
    videoState.list = list;
    grid.innerHTML = list.map(function (v, i) {
      var badge = v.platform === "instagram" ? '<span class="vc-platform p-ig">' + IG_ICON + 'Instagram</span>' : '<span class="vc-platform p-fb">' + FB_ICON + 'Facebook</span>';
      var pending = v.status === "pending-permalink";
      var catLabel = window.LH_I18N.t("videos.cat." + (v.cat || "learning"));
      return '<article class="video-card reveal" data-vi="' + i + '" style="transition-delay:' + (i * 0.06) + 's">' +
        '<div class="vc-thumb' + (v.thumb ? '' : ' no-thumb') + '">' + thumbHtml(v) +
        '<button class="vc-play-btn" aria-label="' + esc(window.LH_I18N.t("videos.play")) + '"><span class="vc-play"></span></button>' +
        badge +
        (v.dur ? '<span class="vc-duration">' + esc(v.dur) + '</span>' : "") +
        '</div>' +
        '<div class="vc-body"><span class="vc-cat">' + esc(catLabel) + '</span>' +
        '<h3>' + esc(pick(v, LANG())) + '</h3><p>' + esc(pick(v, LANG(), "d")) + '</p>' +
        (pending ? '<a class="vc-source" target="_blank" rel="noopener" href="' + esc(v.pageUrl || "https://www.facebook.com/littleheavendaycarepreschool/videos") + '">' + esc(window.LH_I18N.t("videos.pendingNote")) + ' ↗</a>' : '') +
        '</div></article>';
    }).join("");
    initReveal();
    $$("article.video-card", grid).forEach(function (card) {
      card.addEventListener("click", function () { openVideoModal(parseInt(card.getAttribute("data-vi"), 10)); });
    });
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

  function ensureVideoModal() {
    if ($(".video-modal")) return $(".video-modal");
    var vm = document.createElement("div");
    vm.className = "video-modal";
    vm.innerHTML =
      '<div class="vm-body">' +
      '  <button class="vm-x" aria-label="Close"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" width="20" height="20"><path d="M18 6L6 18M6 6l12 12"/></svg></button>' +
      '  <div class="vm-frame"></div>' +
      '  <div class="vm-fallback" hidden>' +
      '    <div class="vm-fb-icon"><svg viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="32" r="30" fill="#3FA9D9" opacity=".15"/><ellipse cx="32" cy="16.5" rx="9" ry="3" fill="none" stroke="#FFC533" stroke-width="2.6"/><path d="M45 44H20a8 8 0 0 1-1.6-15.84A12 12 0 0 1 41.6 24 9 9 0 0 1 45 44Z" fill="#FFF9F1" stroke="#3FA9D9"/></svg></div>' +
      '    <p class="vm-fb-note"></p>' +
      '    <div class="vm-fb-actions"></div>' +
      '  </div>' +
      '  <div class="vm-info"><h3></h3><p></p>' +
      '    <div class="vm-note"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg><span data-i18n="videos.embedNote"></span></div>' +
      '    <div class="vm-actions">' +
      '      <a class="btn btn-primary btn-sm vm-source" target="_blank" rel="noopener" href="#"></a>' +
      '      <button class="btn btn-ghost btn-sm vm-close-btn"><span data-i18n="common.close"></span></button>' +
      '      <a class="vm-generator" target="_blank" rel="noopener" href="#" data-i18n="videos.generator"></a>' +
      '    </div>' +
      '  </div>' +
      '</div>';
    document.body.appendChild(vm);
    vm.addEventListener("click", function (e) { if (e.target === vm) closeVideoModal(); });
    $(".vm-close-btn", vm).addEventListener("click", closeVideoModal);
    $(".vm-x", vm).addEventListener("click", closeVideoModal);
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && vm.classList.contains("open")) closeVideoModal();
    });
    return vm;
  }

  function showFallback(vm, note, links) {
    var fb = $(".vm-fallback", vm);
    fb.hidden = false;
    $(".vm-fb-note", fb).textContent = note;
    $(".vm-fb-actions", fb).innerHTML = links.map(function (l) {
      return '<a class="btn btn-sky btn-sm" target="_blank" rel="noopener" href="' + esc(l.href) + '">' + esc(l.label) + '</a>';
    }).join("");
  }

  function openVideoModal(i) {
    var v = videoState.list[i];
    if (!v) return;
    var vm = ensureVideoModal();
    var fb = $(".vm-fallback", vm); fb.hidden = true;
    $(".vm-frame", vm).innerHTML = "";
    var source = $(".vm-source", vm);
    var gen = $(".vm-generator", vm);
    var title = pick(v, LANG());

    if (v.status === "pending-permalink" || !v.originalUrl) {
      showFallback(vm, window.LH_I18N.t("videos.pendingNote"),
        [{ href: v.pageUrl || "https://www.facebook.com/littleheavendaycarepreschool/videos", label: window.LH_I18N.t("videos.watchOnFb") }]);
    } else {
      var platform = window.LH_IFRAMELY.platformOf(v.originalUrl) || v.platform;
      var gurl = window.LH_IFRAMELY.generatorUrl(platform, v.originalUrl);
      if (gurl) { gen.href = gurl; gen.style.display = "inline-flex"; } else { gen.style.display = "none"; }
      var canEmbed = window.LH_IFRAMELY.isAllowed(v.originalUrl);
      if (!canEmbed) {
        showFallback(vm, window.LH_I18N.t("videos.fallbackNote"),
          [{ href: v.originalUrl, label: platform === "instagram" ? window.LH_I18N.t("videos.watchOnIg") : window.LH_I18N.t("videos.watchOnFb") }]);
      } else {
        $(".vm-frame", vm).innerHTML = window.LH_IFRAMELY.embedHtml(v.originalUrl, title);
        window.LH_IFRAMELY.render($(".vm-frame", vm), v.originalUrl, title, function (ok) {
          if (!ok) {
            $(".vm-frame", vm).innerHTML = "";
            showFallback(vm, window.LH_I18N.t("videos.fallbackNote"),
              [{ href: v.originalUrl, label: platform === "instagram" ? window.LH_I18N.t("videos.watchOnIg") : window.LH_I18N.t("videos.watchOnFb") }]);
          }
        });
      }
      source.href = v.originalUrl;
      source.innerHTML = platform === "instagram"
        ? '<span data-i18n="videos.watchOnIg"></span>'
        : '<span data-i18n="videos.watchOnFb"></span>';
      localizeInjected(vm);
    }

    $(".vm-info h3", vm).textContent = title;
    $(".vm-info p", vm).textContent = pick(v, LANG(), "d");
    localizeInjected(vm);
    vm.classList.add("open");
    document.body.style.overflow = "hidden";
  }

  function closeVideoModal() {
    var vm = $(".video-modal");
    if (!vm) return;
    $(".vm-frame", vm).innerHTML = "";
    vm.classList.remove("open");
    document.body.style.overflow = "";
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
      var badge = v.platform === "instagram" ? '<span class="sc-platform p-ig">' + IG_ICON + '</span>' : '<span class="sc-platform p-fb">' + FB_ICON + '</span>';
      var kindLabel = s.kind === "teacher" ? "teacher" : "parent";
      return '<article class="story-card reveal" data-story="' + esc(s.videoId) + '" style="transition-delay:' + (i * 0.06) + 's">' +
        '<div class="sc-thumb">' + thumbHtml(v, "sc-ph") + badge +
        '<button class="vc-play-btn" aria-label="' + esc(window.LH_I18N.t("videos.play")) + '"><span class="vc-play"></span></button></div>' +
        '<div class="sc-body"><p>' + esc(pick(s, LANG())) + '</p><span>' + esc(pick(s, LANG(), "d")) + '</span>' +
        '<span class="sc-kind k-' + kindLabel + '">' + esc(kindLabel === "teacher" ? (LANG() === "bn" ? "শিক্ষিকা" : "Teacher") : (LANG() === "bn" ? "অভিভাবক" : "Parent")) + '</span></div>' +
        '</article>';
    }).join("");
    initReveal();
    $$("[data-story]", grid).forEach(function (card) {
      card.addEventListener("click", function () {
        var id = card.getAttribute("data-story");
        var idx = videoState.list.findIndex ? videoState.list.findIndex(function (x) { return x.id === id; }) : -1;
        var globalIdx = LH_DATA.videos.findIndex(function (x) { return x.id === id; });
        if (idx >= 0) { openVideoModal(idx); return; }
        /* not on this page's rendered list — render a one-off modal list */
        videoState.list = LH_DATA.videos;
        openVideoModal(globalIdx);
        videoState.list = currentVideos();
      });
    });
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
      document.title = n[LANG()].title + " — " + window.LH_I18N.t("brand.name");
      host.innerHTML =
        '<img class="main-img" src="' + esc(n.thumb) + '" alt="' + esc(n[LANG()].title) + '" referrerpolicy="no-referrer" style="border-radius:var(--r-xl);box-shadow:var(--sh-md);max-height:440px;width:100%;object-fit:cover">' +
        '<span class="eyebrow" style="margin-top:26px">' + esc(window.LH_I18N.t("news.cat." + n.cat)) + '</span>' +
        '<h1 style="font-size:clamp(1.7rem,3.4vw,2.5rem)">' + esc(n[LANG()].title) + '</h1>' +
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

  /* Broken-image fallback: swap failed CDN thumbs for the branded placeholder. */
  function initImageFallback() {
    var PH = '<svg viewBox="0 0 64 64" class="img-ph-svg" aria-hidden="true"><circle cx="32" cy="32" r="30" fill="rgba(255,255,255,.14)"/><ellipse cx="32" cy="16.5" rx="9" ry="3" fill="none" stroke="#FFC533" stroke-width="2.6"/><path d="M45 44H20a8 8 0 0 1-1.6-15.84A12 12 0 0 1 41.6 24 9 9 0 0 1 45 44Z" fill="rgba(255,255,255,.85)"/></svg>';
    function toPlaceholder(img) {
      var host = img.closest(".vc-thumb, .sc-thumb, .gallery-item, .pc-media, .split-media, .hero-photo-frame");
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
    /* also scan once at boot (cached failures may not re-fire) */
    window.setTimeout(function () {
      28394("img").forEach(function (img) {
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
    initForms();
    document.addEventListener("lh:langchange", function () {
      renderGallery(); renderVideos(); renderStories(); renderPrograms(); renderNews();
      initGalleryFilters(); initVideoFilters(); applyCatLabels(); initReveal(); fillMedia();
    });
  });
})();
