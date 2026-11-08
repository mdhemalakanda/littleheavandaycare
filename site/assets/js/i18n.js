/* ============================================================
   LITTLE HEAVEN — i18n engine
   Centralized bilingual (English + বাংলা) language management.
   Usage:
     <span data-i18n="nav.about">About Us</span>
     <input data-i18n-attr="placeholder" data-i18n-key="form.phonePh">
   Dictionary lives in translations.js as window.LH_T = { en:{}, bn:{} }.
   Selection persists in localStorage ("lh_lang").
   ============================================================ */
(function () {
  "use strict";

  var STORAGE_KEY = "lh_lang";

  var I18N = {
    lang: "en",

    init: function () {
      var saved = null;
      try { saved = localStorage.getItem(STORAGE_KEY); } catch (e) {}
      this.lang = (saved === "bn" || saved === "en") ? saved : "en";
      this.apply(false);
      this.wireSwitchers();
    },

    t: function (key) {
      if (!key) return "";
      var dict = window.LH_T || {};
      var v = (dict[this.lang] || {})[key];
      if (v === undefined) v = (dict.en || {})[key];
      if (v === undefined) v = key;
      return v;
    },

    apply: function (announce) {
      var self = this;
      document.documentElement.setAttribute("lang", this.lang === "bn" ? "bn" : "en");
      document.body.classList.toggle("lang-bn", this.lang === "bn");

      var nodes = document.querySelectorAll("[data-i18n]");
      for (var i = 0; i < nodes.length; i++) {
        var el = nodes[i];
        var txt = self.t(el.getAttribute("data-i18n"));
        var isHtml = el.getAttribute("data-i18n-html") !== null;
        if (isHtml) { el.innerHTML = txt; }
        else if (el.children.length === 0) { el.textContent = txt; }
      }

      var attrs = document.querySelectorAll("[data-i18n-attr]");
      for (var j = 0; j < attrs.length; j++) {
        var a = attrs[j];
        var attrName = a.getAttribute("data-i18n-attr");
        var key2 = a.getAttribute("data-i18n-key");
        if (attrName && key2) a.setAttribute(attrName, self.t(key2));
      }

      var titleEl = document.querySelector("title[data-i18n]");
      if (titleEl) document.title = self.t(titleEl.getAttribute("data-i18n"));

      var btns = document.querySelectorAll("[data-set-lang]");
      for (var k = 0; k < btns.length; k++) {
        var b = btns[k];
        var isOn = b.getAttribute("data-set-lang") === self.lang;
        b.classList.toggle("on", isOn);
        b.setAttribute("aria-pressed", isOn ? "true" : "false");
      }

      if (announce !== false) {
        document.dispatchEvent(new CustomEvent("lh:langchange", { detail: { lang: self.lang } }));
      }
    },

    set: function (lang) {
      if (lang !== "en" && lang !== "bn") return;
      this.lang = lang;
      try { localStorage.setItem(STORAGE_KEY, lang); } catch (e) {}
      this.apply();
    },

    wireSwitchers: function () {
      var self = this;
      var btns = document.querySelectorAll("[data-set-lang]");
      for (var i = 0; i < btns.length; i++) {
        btns[i].addEventListener("click", function (e) {
          e.preventDefault();
          self.set(this.getAttribute("data-set-lang"));
        });
      }
    }
  };

  window.LH_I18N = I18N;
  document.addEventListener("DOMContentLoaded", function () { I18N.init(); });
})();
