/* =================================
   HZ.SHOP — Recently Viewed
   Recently viewed products
   ================================= */

(() => {
  "use strict";

  window.HZ = window.HZ || {};

  HZ.RECENT_KEY = "hz_recent";

  HZ.getRecentKey = () => {
    const customer = HZ.customer;

    if (customer) {
      const id =
        customer.id ??
        customer.customer_id ??
        customer.phone;

      if (id !== undefined && id !== null) {
        return `hz_recent_${id}`;
      }
    }

    return HZ.RECENT_KEY;
  };

  HZ.recentlyViewed = [];

  /* ---------------------------------
     Load
     --------------------------------- */

  HZ.loadRecentlyViewed = () => {
    const recent =
      HZ.storageGetJSON(
        HZ.getRecentKey(),
        []
      );

    HZ.recentlyViewed =
      Array.isArray(recent)
        ? recent
        : [];

    return HZ.recentlyViewed;
  };

  /* ---------------------------------
     Save
     --------------------------------- */

  HZ.saveRecentlyViewed = () => {
    return HZ.storageSetJSON(
      HZ.getRecentKey(),
      HZ.recentlyViewed
    );
  };

  /* ---------------------------------
     Add product
     --------------------------------- */

  HZ.addRecentlyViewed = (
    productId,
    limit = 12
  ) => {
    if (
      productId === undefined ||
      productId === null ||
      productId === ""
    ) {
      return false;
    }

    HZ.recentlyViewed =
      HZ.recentlyViewed.filter(
        id =>
          String(id) !==
          String(productId)
      );

    HZ.recentlyViewed.unshift(
      productId
    );

    HZ.recentlyViewed =
      HZ.recentlyViewed.slice(
        0,
        Math.max(1, limit)
      );

    HZ.saveRecentlyViewed();

    return true;
  };

  /* ---------------------------------
     Remove
     --------------------------------- */

  HZ.removeRecentlyViewed = (
    productId
  ) => {
    HZ.recentlyViewed =
      HZ.recentlyViewed.filter(
        id =>
          String(id) !==
          String(productId)
      );

    HZ.saveRecentlyViewed();

    return true;
  };

  /* ---------------------------------
     Clear
     --------------------------------- */

  HZ.clearRecentlyViewed = () => {
    HZ.recentlyViewed = [];

    HZ.saveRecentlyViewed();

    return true;
  };

  /* ---------------------------------
     Get products
     --------------------------------- */

  HZ.getRecentlyViewedProducts = (
    products = HZ.products || [],
    limit = 8
  ) => {
    const result = [];

    for (
      const id of HZ.recentlyViewed
    ) {
      const product =
        products.find(
          item =>
            String(item?.id) ===
            String(id)
        );

      if (product) {
        result.push(product);
      }

      if (result.length >= limit) {
        break;
      }
    }

    return result;
  };

  HZ.loadRecentlyViewed();

})();
