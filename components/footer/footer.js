const FOOTER = {
  init() {
    const footer =
      document.getElementById(
        "siteFooter"
      );

    if (!footer) return;

    const year =
      footer.querySelector(
        "[data-footer-year]"
      );

    if (year) {
      year.textContent =
        new Date().getFullYear();
    }
  }
};
