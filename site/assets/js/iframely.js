/* ============================================================
   LITTLE HEAVEN — Iframely integration (no API key, embed.js)
   Docs: https://iframely.com/docs/embedjs
   Public generator URLs are used for QA / preview links only —
   rendering always goes through https://iframely.net/embed.js
   with data-iframely-url set to the ORIGINAL social post URL.
   ============================================================ */
(function () {
  "use strict";

  var GENERATOR_BASES = {
    facebook: "https://iframely.com/domains/facebook?url=",
    instagram: "https://iframely.com/domains/instagram?url="
  };

  /* Only legitimate Facebook / Instagram post URLs may be embedded. */
  var ALLOWED = [
    /^https:\/\/([a-z0-9-]+\.)*(facebook\.com)\/(reel\/[0-9]+|watch\/?(\?v=[0-9]+)?|littleheavendaycarepreschool\/(videos|posts)\/[^\s]+|plugins\/video\.php)/i,
    /^https:\/\/([a-z0-9-]+\.)*(instagram\.com)\/(p|reel|reels)\/[A-Za-z0-9_-]+\/?/i
  ];

  function isAllowed(url) {
    return typeof url === "string" && ALLOWED.some(function (re) { return re.test(url); });
  }

  function platformOf(url) {
    if (!url) return null;
    if (/(^|\.)facebook\.com$/i.test(safeHost(url))) return "facebook";
    if (/(^|\.)instagram\.com$/i.test(safeHost(url))) return "instagram";
    return null;
  }

  function safeHost(url) {
    try { return new URL(url).hostname; } catch (e) { return ""; }
  }

  /* Dynamic generator URL, per project spec. */
  function generatorUrl(platform, originalUrl) {
    var base = GENERATOR_BASES[platform];
    if (!base || !originalUrl) return null;
    return base + encodeURIComponent(originalUrl);
  }

  /* Build the embed markup for one original post URL. */
  function embedHtml(originalUrl, titleText) {
    if (!isAllowed(originalUrl)) return null;
    var t = (titleText || "Social post").replace(/"/g, "&quot;");
    return '<div class="iframely-embed">' +
      '<div class="iframely-responsive">' +
      '<a href="' + originalUrl + '" data-iframely-url="' + originalUrl + '" title="' + t + '"></a>' +
      '</div></div>';
  }

  /* Render into a container, then initialise via iframely.load().
     Calls back with true on success, false on failure/timeout. */
  function render(container, originalUrl, titleText, onDone) {
    var html = embedHtml(originalUrl, titleText);
    if (!html) { if (onDone) onDone(false); return; }
    container.innerHTML = html;
    var done = false;
    var finish = function (ok) { if (!done) { done = true; if (onDone) onDone(ok); } };
    /* Success signal: iframely replaces the anchor with an iframe. */
    var check = window.setInterval(function () {
      var frame = container.querySelector("iframe");
      if (frame) { window.clearInterval(check); finish(true); }
    }, 250);
    /* Fallback signal: embed.js removed our anchor but no iframe appeared. */
    var anchor = container.querySelector("a[data-iframely-url]");
    var mo = null;
    if (window.MutationObserver) {
      mo = new MutationObserver(function () {
        var a = container.querySelector("a[data-iframely-url]");
        var f = container.querySelector("iframe");
        if (a !== anchor && !f) { window.clearInterval(check); mo.disconnect(); finish(false); }
      });
      mo.observe(container, { childList: true, subtree: true });
    }
    var timer = window.setTimeout(function () {
      window.clearInterval(check);
      if (mo) mo.disconnect();
      if (!container.querySelector("iframe")) finish(false);
    }, 12000);
    if (window.iframely && typeof window.iframely.load === "function") {
      window.iframely.load(container, { url: originalUrl });
    } else {
      document.addEventListener("iframely:init", function once () {
        if (window.iframely && window.iframely.load) window.iframely.load(container, { url: originalUrl });
      }, { once: true });
    }
  }

  window.LH_IFRAMELY = {
    isAllowed: isAllowed,
    platformOf: platformOf,
    generatorUrl: generatorUrl,
    embedHtml: embedHtml,
    render: render
  };
})();
