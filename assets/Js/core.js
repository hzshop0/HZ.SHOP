/* =================================
   HZ.SHOP — Core
   Shared utilities and application state
   ================================= */

(() => {
  "use strict";

  window.HZ = window.HZ || {};

  /* ---------------------------------
     Configuration
     --------------------------------- */

  HZ.API = "/api";
  HZ.CART_KEY = "hz_cart";
  HZ.FAVORITES_KEY = "hz_fav";

  /* ---------------------------------
     DOM helpers
     --------------------------------- */

  HZ.$ = (selector, root = document) => {
    return root.querySelector(selector);
  };

  HZ.$$ = (selector, root = document) => {
    return Array.from(root.querySelectorAll(selector));
  };

  HZ.byId = (id) => {
    return document.getElementById(id);
  };

  /* ---------------------------------
     Safe JSON
     --------------------------------- */

  HZ.safeJSON = (value, fallback = null) => {
    try {
      return JSON.parse(value);
    } catch {
      return fallback;
    }
  };

  /* ---------------------------------
     HTML safety
     --------------------------------- */

  HZ.escapeHtml = (value) => {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  };

  /* ---------------------------------
     Numbers
     --------------------------------- */

  HZ.toNumber = (value, fallback = 0) => {
    const number = Number(value);
    return Number.isFinite(number) ? number : fallback;
  };

  HZ.clamp = (value, min, max) => {
    return Math.min(Math.max(value, min), max);
  };

  /* ---------------------------------
     Currency
     --------------------------------- */

  HZ.formatPrice = (value) => {
    const number = HZ.toNumber(value, 0);

    return number.toLocaleString("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    });
  };

  /* ---------------------------------
     General helpers
     --------------------------------- */

  HZ.debounce = (fn, delay = 300) => {
    let timer;

    return (...args) => {
      clearTimeout(timer);

      timer = setTimeout(() => {
        fn(...args);
      }, delay);
    };
  };

  HZ.sleep = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
  };

  HZ.isObject = (value) => {
    return value !== null &&
      typeof value === "object" &&
      !Array.isArray(value);
  };

  /* ---------------------------------
     Navigation
     --------------------------------- */

  HZ.go = (url) => {
    window.location.href = url;
  };

  HZ.goHome = () => {
    window.location.href = "/";
  };

  HZ.goCart = () => {
    window.location.href = "/Cart.html";
  };

  HZ.goAccount = () => {
    window.location.href = "/Account.html";
  };

  /* ---------------------------------
     Scroll locking
     --------------------------------- */

  HZ.lockScroll = () => {
    document.body.classList.add("no-scroll");
  };

  HZ.unlockScroll = () => {
    document.body.classList.remove("no-scroll");
  };

  /* ---------------------------------
     Global error protection
     --------------------------------- */

  window.addEventListener("error", (event) => {
    console.error("HZ.SHOP error:", event.error || event.message);
  });

  window.addEventListener("unhandledrejection", (event) => {
    console.error("HZ.SHOP promise error:", event.reason);
  });

})();
