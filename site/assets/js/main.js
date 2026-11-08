/* ============================================================
   KIDS EXPRESS SCHOOL — interactions & dynamic content
   Classic script (no modules) so the site works from file:// too.
   Depends on: i18n.js (KES_I18N), translations.js (KES_T),
               data files (KES_DATA.gallery/videos/programs/...).
   ============================================================ */
(function () {
  "use strict";

  var $  = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var LANG = function () { return window.KES_I18N.lang; };
  var pick = function (obj, field) { return obj && obj[field] ? obj[field][LANG()] || obj[field].en : ""; };
  var esc = function (s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  };

  /* ---------------- header: sticky shadow ---------------- */
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

  /* ---------------- mobile drawer ---------------- */
  function initDrawer() {
    var open = $(".hamburger"), close = $(".drawer-close"), overlay = $(".drawer-overlay");
    if (!open) return;
    open.addEventListener("click", function () { document.body.classList.add("drawer-open"); open.setAttribute("aria-expanded", "true"); });
    if (close) close.addEventListener("click", closeDrawer);
    if (overlay) overlay.addEventListener("click", closeDrawer);
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeDrawer(); });
    function closeDrawer() { document.body.classList.remove("drawer-open"); if (open) open.setAttribute("aria-expanded", "false"); }
    $$(".drawer nav a").forEach(function (a) { a.addEventListener("click", closeDrawer); });
  }

  /* ---------------- dropdowns on touch ---------------- */
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

  /* ---------------- reveal on scroll ---------------- */
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

  /* ---------------- back to top ---------------- */
  function initBackTop() {
    var bt = $(".back-top");
    if (!bt) return;
    bt.addEventListener("click", function () { window.scrollTo({ top: 0, behavior: "smooth" }); });
  }

  /* ---------------- stats count-up ---------------- */
  function initStats() {
    var nums = $$("[data-count]");
    if (!nums.length) return;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var el = en.target, target = parseInt(el.getAttribute("data-count"), 10) || 0;
        var suffix = el.getAttribute("data-count-suffix") || "";
        var t0 = null, dur = 1600;
        function step(ts) {
          if (!t0) t0 = ts;
          var p = Math.min((ts - t0) / dur, 1);
          var eased = 1 - Math.pow(1 - p, 3);
          el.textContent = Math.round(target * eased) + suffix;
          if (p < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
        io.unobserve(el);
      });
    }, { threshold: 0.4 });
    nums.forEach(function (n) { io.observe(n); });
  }

  /* ---------------- gallery ---------------- */
  var galleryState = { items: [], filter: "all", lightboxList: [], lbIndex: 0 };

  function renderGallery() {
    var grid = $("[data-gallery-grid]");
    if (!grid || !window.KES_DATA || !KES_DATA.gallery) return;
    var lim = parseInt(grid.getAttribute("data-limit") || "0", 10);
    var data = KES_DATA.gallery.filter(function (g) {
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
      el.textContent = window.KES_I18N.t("gallery.cat." + el.getAttribute("data-cat"));
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
    });
    // localize chip labels
    $$("button.chip", wrap).forEach(function (chip) {
      var f = chip.getAttribute("data-filter");
      chip.textContent = window.KES_I18N.t("gallery.chip." + (f || "all"));
    });
  }

  /* lightbox */
  function ensureLightbox() {
    if ($(".lightbox")) return $(".lightbox");
    var lb = document.createElement("div");
    lb.className = "lightbox";
    lb.innerHTML =
      '<button class="lb-close" aria-label="Close"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M18 6L6 18M6 6l12 12"/></svg></button>' +
      '<span class="lb-count"></span>' +
      '<button class="lb-btn lb-prev" aria-label="Previous"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M15 18l-6-6 6-6"/></svg></button>' +
      '<div class="lb-body"><img src="" alt=""><div class="lb-caption"><b></b><span></span></div></div>' +
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
    $(".lb-caption span", lb).textContent = window.KES_I18N.t("gallery.cat." + g.cat);
    $(".lb-count", lb).textContent = (galleryState.lbIndex + 1) + " / " + galleryState.lightboxList.length;
  }

  /* ---------------- videos ---------------- */
  var FB_EMBED = function (u) { return "https://www.facebook.com/plugins/video.php?href=" + encodeURIComponent(u) + "&show_text=false&width=560"; };

  function renderVideos() {
    var grid = $("[data-videos-grid]");
    if (!grid || !window.KES_DATA || !KES_DATA.videos) return;
    var lim = parseInt(grid.getAttribute("data-limit") || "0", 10);
    var list = KES_DATA.videos.slice(0, lim > 0 ? lim : KES_DATA.videos.length);
    grid.innerHTML = list.map(function (v, i) {
      return '<article class="video-card reveal" style="transition-delay:' + (i * 0.06) + 's">' +
        '<div class="vc-thumb"><img src="' + esc(v.thumb) + '" alt="' + esc(pick(v, LANG())) + '" loading="lazy" referrerpolicy="no-referrer">' +
        '<button class="vc-play-btn" data-video="' + i + '" aria-label="' + esc(window.KES_I18N.t("videos.play")) + '"><span class="vc-play"></span></button>' +
        (v.dur ? '<span class="vc-duration">' + esc(v.dur) + '</span>' : "") + '</div>' +
        '<div class="vc-body"><h3>' + esc(pick(v, LANG())) + '</h3><p>' + esc(pickDeep(v, LANG(), "d")) + '</p>' +
        '</div></article>';
    }).join("");
    initReveal();
    $$("[data-video]", grid).forEach(function (btn) {
      btn.addEventListener("click", function () { openVideoModal(parseInt(btn.getAttribute("data-video"), 10)); });
    });
  }

  /* helper: pick deep field (en.t / bn.d) */
  function pickDeep(obj, lang, field) {
    return obj && obj[lang] && obj[lang][field] ? obj[lang][field] : "";
  }

  function ensureVideoModal() {
    if ($(".video-modal")) return $(".video-modal");
    var vm = document.createElement("div");
    vm.className = "video-modal";
    vm.innerHTML =
      '<div class="vm-body">' +
      '  <div class="vm-frame"></div>' +
      '  <div class="vm-info"><h3></h3><p></p>' +
      '    <div class="vm-note"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg><span data-i18n="videos.embedNote"></span></div>' +
      '    <div style="display:flex;gap:12px;margin-top:16px;flex-wrap:wrap">' +
      '      <a class="btn btn-primary btn-sm vm-fb" target="_blank" rel="noopener" href="#"><span data-i18n="videos.watchOnFb"></span></a>' +
      '      <button class="btn btn-ghost btn-sm vm-close-btn"><span data-i18n="common.close"></span></button>' +
      '    </div>' +
      '  </div>' +
      '</div>';
    document.body.appendChild(vm);
    vm.addEventListener("click", function (e) { if (e.target === vm) closeVideoModal(); });
    $(".vm-close-btn", vm).addEventListener("click", closeVideoModal);
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && vm.classList.contains("open")) closeVideoModal();
    });
    return vm;
  }

  function openVideoModal(i) {
    var v = window.KES_DATA.videos[i];
    if (!v) return;
    var vm = ensureVideoModal();
    $(".vm-frame", vm).innerHTML =
      '<iframe src="' + esc(FB_EMBED(v.fbUrl)) + '" class="vm-iframe" ' +
      'allow="autoplay; fullscreen; encrypted-media; picture-in-picture" allowfullscreen title="' + esc(pick(v, LANG())) + '"></iframe>';
    $(".vm-info h3", vm).textContent = pick(v, LANG());
    $(".vm-info p", vm).textContent = pickDeep(v, LANG(), "d");
    $(".vm-fb", vm).href = v.fbUrl;
    // localize the two data-i18n labels just injected
    $$("[data-i18n]", vm).forEach(function (el) { el.textContent = window.KES_I18N.t(el.getAttribute("data-i18n")); });
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

  /* ---------------- testimonials carousel ---------------- */
  function initTestimonials() {
    var wrap = $(".testi-wrap");
    if (!wrap || !window.KES_DATA || !KES_DATA.testimonials) return;
    var track = $(".testi-track", wrap), dots = $(".testi-dots", wrap);
    function render() {
      track.innerHTML = KES_DATA.testimonials.map(function (t) {
        return '<div class="testi-slide"><div class="testi-card">' +
          '<span class="quote-mark" aria-hidden="true">&ldquo;</span>' +
          '<div class="testi-stars" aria-hidden="true">★★★★★</div>' +
          '<p>' + esc(t[LANG()].quote) + '</p>' +
          '<div class="testi-who"><span class="tw-avatar ' + t.av + '">' + esc(t.initial) + '</span>' +
          '<span style="text-align:left"><b>' + esc(t[LANG()].name) + '</b><span>' + esc(t[LANG()].role) + '</span></span></div>' +
          '</div></div>';
      }).join("");
      dots.innerHTML = KES_DATA.testimonials.map(function (_, i) {
        return '<button data-dot="' + i + '" aria-label="' + (i + 1) + '"></button>';
      }).join("");
      wire();
      go(cur);
    }
    var cur = 0, timer = null;
    function go(i) {
      cur = i;
      track.style.transform = "translateX(-" + (i * 100) + "%)";
      $$("button", dots).forEach(function (b, bi) { b.classList.toggle("on", bi === i); });
    }
    function wire() {
      $$("button", dots).forEach(function (b) {
        b.addEventListener("click", function () { go(parseInt(b.getAttribute("data-dot"), 10)); restart(); });
      });
      var prev = $(".testi-prev", wrap), next = $(".testi-next", wrap);
      if (prev) prev.addEventListener("click", function () { go((cur - 1 + KES_DATA.testimonials.length) % KES_DATA.testimonials.length); restart(); });
      if (next) next.addEventListener("click", function () { go((cur + 1) % KES_DATA.testimonials.length); restart(); });
    }
    function restart() { clearInterval(timer); timer = setInterval(function () { go((cur + 1) % KES_DATA.testimonials.length); }, 6000); }
    render();
    restart();
    wrap.addEventListener("mouseenter", function () { clearInterval(timer); });
    wrap.addEventListener("mouseleave", restart);
    document.addEventListener("kes:langchange", render);
  }

  /* ---------------- programs grid (programs.html) ---------------- */
  function renderPrograms() {
    var grid = $("[data-programs-grid]");
    if (!grid || !window.KES_DATA || !KES_DATA.programs) return;
    var lim = parseInt(grid.getAttribute("data-limit") || "0", 10);
    var list = KES_DATA.programs.slice(0, lim > 0 ? lim : KES_DATA.programs.length);
    grid.innerHTML = list.map(function (p, i) {
      return '<article class="program-card card tint-' + p.tint + ' reveal" style="transition-delay:' + (i * 0.06) + 's">' +
        '<div class="pc-media"><img src="' + esc(p.img) + '" alt="' + esc(pick(p, LANG())) + '" loading="lazy" referrerpolicy="no-referrer">' +
        '<span class="pc-age">' + esc(p[LANG()].age) + '</span></div>' +
        '<div class="pc-body"><h3>' + esc(pick(p, LANG())) + '</h3>' +
        '<p>' + esc(pick(p, LANG(), "short") || p[LANG()].short) + '</p>' +
        '<a class="pc-link" href="' + p.href + '"><span data-i18n="common.learnMore"></span>' +
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M5 12h14M13 6l6 6-6 6"/></svg></a></div>' +
        '</article>';
    }).join("");
    localizeInjected(grid);
    initReveal();
  }

  function localizeInjected(scope) {
    $$("[data-i18n]", scope).forEach(function (el) { el.textContent = window.KES_I18N.t(el.getAttribute("data-i18n")); });
  }

  /* ---------------- teachers grid ---------------- */
  function renderTeachers() {
    var grid = $("[data-teachers-grid]");
    if (!grid || !window.KES_DATA || !KES_DATA.teachers) return;
    grid.innerHTML = KES_DATA.teachers.map(function (t, i) {
      return '<article class="teacher-card reveal" style="transition-delay:' + (i * 0.05) + 's">' +
        '<div class="teacher-avatar ' + t.av + '">' + esc(t.initial) + '</div>' +
        '<h3>' + esc(t[LANG()].name) + '</h3>' +
        '<div class="t-role">' + esc(t[LANG()].role) + '</div>' +
        '<p>' + esc(t[LANG()].bio) + '</p>' +
        '</article>';
    }).join("");
    initReveal();
  }

  /* ---------------- news list + details ---------------- */
  function renderNews() {
    var grid = $("[data-news-grid]");
    if (!grid || !window.KES_DATA || !KES_DATA.news) return;
    var lim = parseInt(grid.getAttribute("data-limit") || "0", 10);
    var list = KES_DATA.news.slice(0, lim > 0 ? lim : KES_DATA.news.length);
    grid.innerHTML = list.map(function (n, i) {
      var d = n.date ? new Date(n.date) : null;
      var months = window.KES_I18N.t("meta.months").split(",");
      var m = d ? (months[d.getMonth()] || "") : "";
      var dateBadge = d ? '<span class="nc-date"><b>' + d.getDate() + '</b><span>' + esc(m) + '</span></span>' : "";
      return '<article class="news-card card reveal" style="transition-delay:' + (i * 0.06) + 's">' +
        '<div class="nc-media"><img src="' + esc(n.thumb) + '" alt="' + esc(pick(n, LANG())) + '" loading="lazy" referrerpolicy="no-referrer">' +
        dateBadge + '</div>' +
        '<div class="nc-body"><span class="nc-tag">' + esc(window.KES_I18N.t("news.cat." + n.cat)) + '</span>' +
        '<h3>' + esc(pick(n, LANG())) + '</h3><p>' + esc(pickDeep(n, LANG(), "excerpt")) + '</p>' +
        '<a class="pc-link" href="news-details.html?id=' + esc(n.id) + '"><span data-i18n="common.readMore"></span>' +
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M5 12h14M13 6l6 6-6 6"/></svg></a></div>' +
        '</article>';
    }).join("");
    localizeInjected(grid);
    initReveal();
  }

  function renderNewsDetails() {
    var host = $("#newsArticle");
    if (!host || !window.KES_DATA || !KES_DATA.news) return;
    var id = new URLSearchParams(location.search).get("id");
    var n = KES_DATA.news.find(function (x) { return x.id === id; }) || KES_DATA.news[0];
    function paint() {
      var d = new Date(n.date);
      var months = window.KES_I18N.t("meta.months").split(",");
      document.title = n[LANG()].title + " — " + window.KES_I18N.t("brand.name");
      host.innerHTML =
        '<img class="main-img" src="' + esc(n.thumb) + '" alt="' + esc(n[LANG()].title) + '" referrerpolicy="no-referrer" style="border-radius:var(--r-xl);box-shadow:var(--sh-md);max-height:440px;width:100%;object-fit:cover">' +
        '<span class="eyebrow" style="margin-top:26px">' + esc(window.KES_I18N.t("news.cat." + n.cat)) + '</span>' +
        '<h1 style="font-size:clamp(1.7rem,3.4vw,2.5rem)">' + esc(n[LANG()].title) + '</h1>' +
        '<p style="color:var(--ink-faint);font-weight:700">' + d.getDate() + " " + (months[d.getMonth()] || "") + " " + d.getFullYear() + '</p>' +
        n[LANG()].body.map(function (par) { return '<p style="color:var(--ink-soft);font-size:1.03rem">' + esc(par) + '</p>'; }).join("") +
        '<a class="btn btn-sky" target="_blank" rel="noopener" href="' + esc(n.fbUrl) + '">' + esc(window.KES_I18N.t("news.seeOnFb")) + '</a>';
    }
    paint();
    document.addEventListener("kes:langchange", paint);
  }

  /* ---------------- forms ---------------- */
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
      if (msg && errKey) msg.textContent = window.KES_I18N.t(errKey);
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
      showToast(window.KES_I18N.t(form.getAttribute("data-success-key") || "form.toastSuccess"));
    });
  }

  /* ---------------- toast ---------------- */
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
    if (!window.KES_MEDIA) return;
    $$("[data-media]").forEach(function (img) {
      var slot = window.KES_MEDIA[img.getAttribute("data-media")];
      if (slot && slot.src) {
        if (!img.getAttribute("src")) img.src = slot.src;
      }
    });
  }

  /* ---------------- boot ---------------- */
  function renderAllDynamic() {
    renderGallery(); renderVideos(); renderPrograms(); renderTeachers(); renderNews(); renderNewsDetails();
  }

  document.addEventListener("DOMContentLoaded", function () {
    initHeader(); initDrawer(); initDropdowns(); initReveal(); initBackTop(); initStats();
    initGalleryFilters(); renderGallery(); renderVideos(); renderPrograms(); renderTeachers(); renderNews(); renderNewsDetails(); fillMedia();
    initTestimonials(); initForms();
    document.addEventListener("kes:langchange", function () {
      renderGallery(); renderVideos(); renderPrograms(); renderTeachers(); renderNews();
      initGalleryFilters(); applyCatLabels(); initReveal(); fillMedia();
      // lightbox/video modal texts refresh on next open
    });
  });
})();
