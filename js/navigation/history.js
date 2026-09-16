const NAVIGATION_HISTORY = {
  back() {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      NAVIGATION.home();
    }
  },

  forward() {
    window.history.forward();
  },

  replace(path) {
    if (!path) return;

    window.location.replace(path);
  }
};

window.NAVIGATION_HISTORY = NAVIGATION_HISTORY;
