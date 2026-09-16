const HEADER = {

  async init() {

    const container =
      document.getElementById("site-header");

    if (!container) return;

    if (!container.querySelector("#siteHeader")) {

      try {

        const response =
          await fetch("/components/header/header.html");

        if (!response.ok) {
          throw new Error("Failed to load header");
        }

        container.innerHTML =
          await response.text();

      } catch (error) {

        console.error(
          "HZ.SHOP Header:",
          error
        );

        return;
      }
    }


    const searchForm =
      document.getElementById(
        "headerSearchForm"
      );

    const searchInput =
      document.getElementById(
        "headerSearchInput"
      );


    const wishlistButton =
      document.getElementById(
        "headerWishlistButton"
      );

    const notificationsButton =
      document.getElementById(
        "headerNotificationsButton"
      );

    const cartButton =
      document.getElementById(
        "headerCartButton"
      );

    const accountButton =
      document.getElementById(
        "headerAccountButton"
      );


    if (searchForm && searchInput) {

      searchForm.addEventListener(
        "submit",
        (event) => {

          event.preventDefault();

          const query =
            searchInput.value.trim();

          if (
            typeof NAVIGATION !==
            "undefined"
          ) {
            NAVIGATION.search(query);
          }

        }
      );

    }


    if (wishlistButton) {

      wishlistButton.addEventListener(
        "click",
        () => {

          if (
            typeof NAVIGATION !==
            "undefined"
          ) {
            NAVIGATION.wishlist();
          }

        }
      );

    }


    if (notificationsButton) {

      notificationsButton.addEventListener(
        "click",
        () => {

          if (
            typeof NAVIGATION !==
            "undefined"
          ) {
            NAVIGATION.notifications();
          }

        }
      );

    }


    if (cartButton) {

      cartButton.addEventListener(
        "click",
        () => {

          if (
            typeof NAVIGATION !==
            "undefined"
          ) {
            NAVIGATION.cart();
          }

        }
      );

    }


    if (accountButton) {

      accountButton.addEventListener(
        "click",
        () => {

          if (
            typeof NAVIGATION !==
            "undefined"
          ) {
            NAVIGATION.account();
          }

        }
      );

    }


    this.updateCartCount();


    window.addEventListener(
      "hz:cart_updated",
      (event) => {

        const count =
          event?.detail?.count ?? 0;

        this.updateCartCount(count);

      }
    );

  },


  updateCartCount(count = 0) {

    const cartCount =
      document.getElementById(
        "headerCartCount"
      );

    if (!cartCount) return;

    const value =
      Math.max(
        0,
        Number(count) || 0
      );

    cartCount.textContent =
      value;

    cartCount.hidden =
      value === 0;

  }

};


window.HEADER = HEADER;
