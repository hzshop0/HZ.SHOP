const HEADER = {
  init() {
    const searchForm = document.getElementById("headerSearchForm");
    const searchInput = document.getElementById("headerSearchInput");

    const wishlistButton = document.getElementById(
      "headerWishlistButton"
    );

    const notificationsButton = document.getElementById(
      "headerNotificationsButton"
    );

    const cartButton = document.getElementById(
      "headerCartButton"
    );

    const accountButton = document.getElementById(
      "headerAccountButton"
    );

    if (searchForm && searchInput) {
      searchForm.addEventListener("submit", (event) => {
        event.preventDefault();

        const query = searchInput.value.trim();

        NAVIGATION.search(query);
      });
    }

    if (wishlistButton) {
      wishlistButton.addEventListener("click", () => {
        NAVIGATION.wishlist();
      });
    }

    if (notificationsButton) {
      notificationsButton.addEventListener("click", () => {
        NAVIGATION.notifications();
      });
    }

    if (cartButton) {
      cartButton.addEventListener("click", () => {
        NAVIGATION.cart();
      });
    }

    if (accountButton) {
      accountButton.addEventListener("click", () => {
        NAVIGATION.account();
      });
    }

    this.updateCartCount();
  },

  updateCartCount(count = 0) {
    const cartCount = document.getElementById(
      "headerCartCount"
    );

    if (!cartCount) return;

    const value = Math.max(0, Number(count) || 0);

    cartCount.textContent = value;

    cartCount.hidden = value === 0;
  }
};
