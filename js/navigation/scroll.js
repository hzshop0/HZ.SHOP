const SCROLL = {
  top(behavior = "smooth") {
    window.scrollTo({
      top: 0,
      behavior
    });
  },

  toElement(element, behavior = "smooth") {
    if (!element) return;

    element.scrollIntoView({
      behavior,
      block: "start"
    });
  },

  savePosition(key = window.location.pathname) {
    try {
      sessionStorage.setItem(
        `hz_scroll_${key}`,
        String(window.scrollY)
      );
    } catch {}
  },

  restorePosition(key = window.location.pathname) {
    try {
      const position = Number(
        sessionStorage.getItem(`hz_scroll_${key}`)
      );

      if (Number.isFinite(position)) {
        window.scrollTo({
          top: position,
          behavior: "instant"
        });
      }
    } catch {}
  }
};
