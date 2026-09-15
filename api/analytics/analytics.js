const ANALYTICS_API = {
  async track(
    event,
    data = {}
  ) {
    if (!event) {
      return false;
    }

    try {
      const payload = {
        event,
        data,
        url:
          window.location.href,
        path:
          window.location.pathname,
        referrer:
          document.referrer || "",
        timestamp:
          new Date().toISOString()
      };

      await API.post(
        "/api/analytics",
        payload
      );

      return true;
    } catch (error) {
      console.warn(
        "Analytics tracking failed:",
        error
      );

      return false;
    }
  },

  pageView(data = {}) {
    return this.track(
      "page_view",
      data
    );
  },

  productView(
    productId,
    data = {}
  ) {
    return this.track(
      "product_view",
      {
        productId,
        ...data
      }
    );
  },

  search(
    query,
    data = {}
  ) {
    return this.track(
      "search",
      {
        query:
          String(
            query || ""
          ).trim(),
        ...data
      }
    );
  },

  categoryView(
    categoryId,
    data = {}
  ) {
    return this.track(
      "category_view",
      {
        categoryId,
        ...data
      }
    );
  },

  addToCart(
    productId,
    quantity = 1,
    data = {}
  ) {
    return this.track(
      "add_to_cart",
      {
        productId,
        quantity:
          Number(quantity) || 1,
        ...data
      }
    );
  },

  removeFromCart(
    productId,
    data = {}
  ) {
    return this.track(
      "remove_from_cart",
      {
        productId,
        ...data
      }
    );
  },

  wishlistAdd(
    productId,
    data = {}
  ) {
    return this.track(
      "wishlist_add",
      {
        productId,
        ...data
      }
    );
  },

  wishlistRemove(
    productId,
    data = {}
  ) {
    return this.track(
      "wishlist_remove",
      {
        productId,
        ...data
      }
    );
  },

  beginCheckout(
    data = {}
  ) {
    return this.track(
      "begin_checkout",
      data
    );
  },

  purchase(
    orderId,
    data = {}
  ) {
    return this.track(
      "purchase",
      {
        orderId,
        ...data
      }
    );
  },

  accountLogin(
    data = {}
  ) {
    return this.track(
      "login",
      data
    );
  },

  accountRegister(
    data = {}
  ) {
    return this.track(
      "register",
      data
    );
  },

  share(
    data = {}
  ) {
    return this.track(
      "share",
      data
    );
  },

  notificationOpen(
    notificationId,
    data = {}
  ) {
    return this.track(
      "notification_open",
      {
        notificationId,
        ...data
      }
    );
  }
};
