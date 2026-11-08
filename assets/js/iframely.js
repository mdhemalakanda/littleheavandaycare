/* ============================================================
   LITTLE HEAVEN — social embed integration (no API key)
   Strategy (verified 2026-11-08):
   1. Iframely embed.js (https://iframely.net/embed.js) is tried first,
      per project spec — data-iframely-url = ORIGINAL post URL.
      NOTE: Iframely's free keyless service cannot resolve facebook.com /
      instagram.com media (their API 404s without an api_key), so step 2
      handles the real rendering:
   2. OFFICIAL platform embeds (keyless, platform-approved):
      - Facebook: plugins/video.php (reels/videos) or plugins/post.php (posts)
      - Instagram: instagram.com/{p|reel}/{id}/embed
   3. Source-link fallback card as last resort.
   Public generator URLs (https://iframely.com/domains/{facebook|instagram}?url=…)
   remain available dynamically for QA / preview links.
   ============================================================ */
(function () {
  "use strict";

  var GENERATOR_BASES = {
    facebook: "https://iframely.com/domains/facebook?url=",
    instagram: "https://iframely.com/domains/instagram?url="
  };

  /* Only legitimate Facebook / Instagram post URLs may be embedded. */
  var ALLOWED = [
    /^https:\/\/([a-z0-9-]+\.)*(facebook\.com)\/(reel\/[0-9]+|watch\/?(\?v=[0-9]+)?|littleheavendaycarepreschool\/(videos|posts)\/[^\s]+)/i,
    /^https:\/\/([a-z0-9-]+\.)*(instagram\.com)\/(p|reel|reels)\/[A-Za-z0-9_-]+\/?/i
  ];

  function isAllowed(url) {
    return typeof url === "string" && ALLOWED.some(function (re) { return re.test(url); });
  }

  function safeHost(url) {
    try { return new URL(url).hostname; } catch (e) { return ""; }
  }

  function platformOf(url) {
    if (!url) return null;
    if (/(^|\.)facebook\.com$/i.test(safeHost(url))) return "facebook";
    if (/(^|\.)instagram\.com$/i.test(safeHost(url))) return "instagram";
    return null;
  }

  /* Dynamic generator URL, per project spec. */
  function generatorUrl(platform, originalUrl) {
    var base = GENERATOR_BASES[platform];
    if (!base || !originalUrl) return null;
    return base + encodeURIComponent(originalUrl);
  }

  /* Build the Iframely embed markup for one original post URL (attempt 1). */
  function embedHtml(originalUrl, titleText) {
    if (!isAllowed(originalUrl)) return null;
    var t = (titleText || "Social post").replace(/"/g, "&quot;");
    return '<div class="iframely-embed">' +
      '<div class="iframely-responsive">' +
      '<a href="' + originalUrl + '" data-iframely-url="' + originalUrl + '" title="' + t + '"></a>' +
      '</div></div>';
  }

  /* OFFICIAL platform embed markup (attempt 2 — keyless, platform-approved). */
  function platformEmbedHtml(url) {
    if (!isAllowed(url)) return null;
    if (/(^|\.)facebook\.com$/i.test(safeHost(url))) {
      var isPost = /\/posts\//.test(url);
      var plugin = isPost ? "post.php" : "video.php";
      var extra = isPost ? "&show_text=true&width=500" : "&show_text=false&width=560";
      var title = platformOf(url) === "facebook" ? "Facebook embed" : "Facebook embed";
      return '<iframe src="https://www.facebook.com/plugins/' + plugin + '?href=' + encodeURIComponent(url) + extra + '" ' +
        'style="border:none;overflow:hidden" scrolling="no" frameborder="0" allowfullscreen="true" ' +
        'allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share" title="' + title + '"></iframe>';
    }
    if (/(^|\.)instagram\.com$/i.test(safeHost(url))) {
      var m = url.match(/\/(p|reel|reels|tv)\/([A-Za-z0-9_-]+)/);
      if (!m) return null;
      var kind = m[1] === "reels" ? "reel" : m[1];
      return '<iframe src="https://www.instagram.com/' + kind + '/' + m[2] + '/embed" frameborder="0" scrolling="no" ' +
        'allowtransparency="true" title="Instagram embed"></iframe>';
    }
    return null;
  }

  /* Render attempt 1 into a container; calls back with true on success,
     false on failure/timeout (caller then tries platformEmbedHtml). */
  function render(container, originalUrl, titleText, onDone) {
    var html = embedHtml(originalUrl, titleText);
    if (!html) { if (onDone) onDone(false); return; }
    container.innerHTML = html;
    var done = false;
    var finish = function (ok) { if (!done) { done = true; if (onDone) onDone(ok); } };
    /* Success signal: embed.js replaces the anchor with a rendered widget. */
    var check = window.setInterval(function () {
      if (container.querySelector("iframe") || container.querySelector(".iframely-widget")) {
        window.clearInterval(check);
        finish(true);
      }
    }, 250);
    /* Failure signal: anchor removed but nothing rendered in its place. */
    var mo = null;
    if (window.MutationObserver) {
      mo = new MutationObserver(function () {
        var a = container.querySelector("a[data-iframely-url]");
        var rendered = container.querySelector("iframe") || container.querySelector(".iframely-widget");
        if (!a && !rendered) { window.clearInterval(check); mo.disconnect(); finish(false); }
      });
      mo.observe(container, { childList: true, subtree: true });
    }
    var timer = window.setTimeout(function () {
      window.clearInterval(check);
      if (mo) mo.disconnect();
      finish(!!container.querySelector("iframe"));
    }, 6000);
    if (window.iframely && typeof window.iframely.load === "function") {
      try { window.iframely.load(container); } catch (e) { /* handled by timeout */ }
    }
  }

  window.LH_IFRAMELY = {
    isAllowed: isAllowed,
    platformOf: platformOf,
    generatorUrl: generatorUrl,
    embedHtml: embedHtml,
    platformEmbedHtml: platformEmbedHtml,
    render: render
  };
})();
