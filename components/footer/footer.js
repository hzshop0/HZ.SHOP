const FOOTER = {

  async init() {

    const container =
      document.getElementById("site-footer");

    if (!container) return;


    if (!container.querySelector("#siteFooter")) {

      try {

        const response =
          await fetch("/components/footer/footer.html");

        if (!response.ok) {
          throw new Error("Failed to load footer");
        }

        container.innerHTML =
          await response.text();

      } catch (error) {

        console.error(
          "HZ.SHOP Footer:",
          error
        );

        return;
      }
    }


    const year =
      container.querySelector(
        "[data-footer-year]"
      );

    if (year) {

      year.textContent =
        new Date().getFullYear();

    }

  }

};


window.FOOTER = FOOTER;
