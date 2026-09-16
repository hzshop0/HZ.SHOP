const NAVIGATION = {
  go(path) {
    if (!path) return;

    window.location.href = path;
  },

  home() {
    this.go("/");
  },

  product(id) {
    if (!id) return;

    this.go(
      `/pages/product/?id=${encodeURIComponent(id)}`
    );
  },

  category(id) {
    if (!id) return;

    this.go(
      `/pages/category/?id=${encodeURIComponent(id)}`
    );
  },

  cart() {
    this.go("/pages/cart/");
  },

  checkout() {
    this.go("/pages/checkout/");
  },

  account() {
    this.go("/pages/account/");
  },

  orders() {
    this.go("/pages/orders/");
  },

  wishlist() {
    this.go("/pages/wishlist/");
  },

  search(query = "") {
    const value = String(query).trim();

    this.go(
      value
        ? `/pages/search/?q=${encodeURIComponent(value)}`
        : "/pages/search/"
    );
  },

  notifications() {
    this.go("/pages/notifications/");
  }
};

window.NAVIGATION = NAVIGATION;
