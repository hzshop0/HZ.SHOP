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
  HZ.API =
    HZ.API || "/api";
  HZ.CART_KEY =
    HZ.CART_KEY || "hz_cart";
  HZ.FAVORITES_KEY =
    HZ.FAVORITES_KEY || "hz_fav";
  HZ.DISCOUNT_KEY =
    HZ.DISCOUNT_KEY ||
    "hz_discount_rate";
  HZ.DELIVERY_FEE =
    HZ.DELIVERY_FEE ?? 4;
  /* ---------------------------------
     Application state
     --------------------------------- */
  HZ.products =
    Array.isArray(HZ.products)
      ? HZ.products
      : [];
  HZ.cart =
    Array.isArray(HZ.cart)
      ? HZ.cart
      : [];
  HZ.favorites =
    Array.isArray(HZ.favorites)
      ? HZ.favorites
      : [];
  HZ.current =
    HZ.current || "all";
  HZ.discountRate =
    HZ.toNumber?.(
      localStorage.getItem(
        HZ.DISCOUNT_KEY
      ),
      0
    ) || 0;
  HZ.selectedPayment =
    HZ.selectedPayment ||
    "الدفع عند الاستلام";
  /* ---------------------------------
     DOM helpers
     --------------------------------- */
  HZ.$ = (
    selector,
    root = document
  ) => {
    return root.querySelector(
      selector
    );
  };
  HZ.$$ = (
    selector,
    root = document
  ) => {
    return Array.from(
      root.querySelectorAll(
        selector
      )
    );
  };
  HZ.byId = (
    id
  ) => {
    return document.getElementById(
      id
    );
  };
  /* ---------------------------------
     Safe JSON
     --------------------------------- */
  HZ.safeJSON = (
    value,
    fallback = null
  ) => {
    try {
      return JSON.parse(
        value
      );
    } catch {
      return fallback;
    }
  };
  /* ---------------------------------
     Storage helpers
     --------------------------------- */
  HZ.storageGet = (
    key,
    fallback = null
  ) => {
    try {
      const value =
        localStorage.getItem(
          key
        );
      return value === null
        ? fallback
        : value;
    } catch (error) {
      console.error(
        "HZ.SHOP storage read error:",
        error
      );
      return fallback;
    }
  };
  HZ.storageSet = (
    key,
    value
  ) => {
    try {
      localStorage.setItem(
        key,
        String(value)
      );
      return true;
    } catch (error) {
      console.error(
        "HZ.SHOP storage write error:",
        error
      );
      return false;
    }
  };
  HZ.storageRemove = (
    key
  ) => {
    try {
      localStorage.removeItem(
        key
      );
      return true;
    } catch (error) {
      console.error(
        "HZ.SHOP storage remove error:",
        error
      );
      return false;
    }
  };
  HZ.storageGetJSON = (
    key,
    fallback = null
  ) => {
    const value =
      HZ.storageGet(
        key,
        null
      );
    if (value === null) {
      return fallback;
    }
    return HZ.safeJSON(
      value,
      fallback
    );
  };
  HZ.storageSetJSON = (
    key,
    value
  ) => {
    try {
      return HZ.storageSet(
        key,
        JSON.stringify(value)
      );
    } catch (error) {
      console.error(
        "HZ.SHOP JSON storage error:",
        error
      );
      return false;
    }
  };
  HZ.readStoredArray = (
    key
  ) => {
    const value =
      HZ.storageGetJSON(
        key,
        []
      );
    return Array.isArray(value)
      ? value
      : [];
  };
  HZ.writeStoredArray = (
    key,
    value
  ) => {
    return HZ.storageSetJSON(
      key,
      Array.isArray(value)
        ? value
        : []
    );
  };
  /* ---------------------------------
     HTML safety
     --------------------------------- */
  HZ.escapeHtml = (
    value
  ) => {
    return String(
      value ?? ""
    )
      .replace(
        /&/g,
        "&amp;"
      )
      .replace(
        /</g,
        "&lt;"
      )
      .replace(
        />/g,
        "&gt;"
      )
      .replace(
        /"/g,
        "&quot;"
      )
      .replace(
        /'/g,
        "&#039;"
      );
  };
  /* ---------------------------------
     Numbers
     --------------------------------- */
  HZ.toNumber = (
    value,
    fallback = 0
  ) => {
    const number =
      Number(value);
    return Number.isFinite(
      number
    )
      ? number
      : fallback;
  };
  HZ.clamp = (
    value,
    min,
    max
  ) => {
    return Math.min(
      Math.max(
        value,
        min
      ),
      max
    );
  };
  /* ---------------------------------
     Currency
     --------------------------------- */
  HZ.formatPrice = (
    value
  ) => {
    const number =
      HZ.toNumber(
        value,
        0
      );
    return number.toLocaleString(
      "en-US",
      {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
      }
    );
  };
  /* ---------------------------------
     General helpers
     --------------------------------- */
  HZ.debounce = (
    fn,
    delay = 300
  ) => {
    let timer;
    return (
      ...args
    ) => {
      clearTimeout(
        timer
      );
      timer =
        setTimeout(
          () => {
            fn(...args);
          },
          delay
        );
    };
  };
  HZ.sleep = (
    ms
  ) => {
    return new Promise(
      resolve =>
        setTimeout(
          resolve,
          ms
        )
    );
  };
  HZ.isObject = (
    value
  ) => {
    return (
      value !== null &&
      typeof value ===
        "object" &&
      !Array.isArray(
        value
      )
    );
  };
  /* ---------------------------------
     Toast
     --------------------------------- */
  HZ.toast = (
    message
  ) => {
    const toast =
      document.getElementById(
        "toast"
      );
    if (!toast) {
      return;
    }
    toast.textContent =
      String(
        message ?? ""
      );
    toast.classList.add(
      "show"
    );
    clearTimeout(
      HZ._toastTimer
    );
    HZ._toastTimer =
      setTimeout(
        () => {
          toast.classList.remove(
            "show"
          );
        },
        3000
      );
  };
  /* ---------------------------------
     Navigation
     --------------------------------- */
  HZ.go = (
    url
  ) => {
    window.location.href =
      url;
  };
  HZ.goHome = () => {
    window.location.href =
      "/";
  };
  HZ.goCart = () => {
    window.location.href =
      "/Cart.html";
  };
  HZ.goAccount = () => {
    window.location.href =
      "/Account.html";
  };
  /* ---------------------------------
     Scroll locking
     --------------------------------- */
  HZ.lockScroll = () => {
    document.body.classList.add(
      "no-scroll"
    );
  };
  HZ.unlockScroll = () => {
    document.body.classList.remove(
      "no-scroll"
    );
  };
  /* ---------------------------------
     Global error protection
     --------------------------------- */
  window.addEventListener(
    "error",
    event => {
      console.error(
        "HZ.SHOP error:",
        event.error ||
        event.message
      );
    }
  );
  window.addEventListener(
    "unhandledrejection",
    event => {
      console.error(
        "HZ.SHOP promise error:",
        event.reason
      );
    }
  );
})();
