const UTILS = {
  escapeHTML(value = "") {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  },

  formatPrice(value) {
    const number = Number(value);

    if (!Number.isFinite(number)) {
      return "$0";
    }

    return `$${number.toFixed(2)}`;
  },

  formatNumber(value) {
    const number = Number(value);

    if (!Number.isFinite(number)) {
      return "0";
    }

    return number.toLocaleString();
  },

  isRTL(language = "ar") {
    return language === "ar";
  },

  debounce(callback, delay = 300) {
    let timer;

    return (...args) => {
      clearTimeout(timer);

      timer = setTimeout(() => {
        callback(...args);
      }, delay);
    };
  }
};
