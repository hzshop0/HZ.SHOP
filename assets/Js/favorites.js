/* =================================
   HZ.SHOP — Favorites
   Customer favorites
   ================================= */

(() => {
  "use strict";

  window.HZ = window.HZ || {};

  HZ.favorites = [];

  HZ.getFavoritesKey = () => {
    const customer = HZ.customer;

    if (customer) {
      const id =
        customer.id ??
        customer.customer_id ??
        customer.phone;

      if (id !== undefined && id !== null) {
        return `hz_favorites_${id}`;
      }
    }

    return HZ.FAVORITES_KEY || "hz_fav";
  };

  HZ.loadFavorites = () => {
    HZ.favorites =
      HZ.storageGetJSON(
        HZ.getFavoritesKey(),
        []
      );

    if (!Array.isArray(HZ.favorites)) {
      HZ.favorites = [];
    }

    return HZ.favorites;
  };

  HZ.saveFavorites = () => {
    return HZ.storageSetJSON(
      HZ.getFavoritesKey(),
      HZ.favorites
    );
  };

  HZ.isFavorite = (productId) => {
    return HZ.favorites.some(
      id => String(id) === String(productId)
    );
  };

  HZ.addFavorite = (productId) => {
    if (
      productId === undefined ||
      productId === null
    ) {
      return false;
    }

    if (!HZ.isFavorite(productId)) {
      HZ.favorites.push(productId);
      HZ.saveFavorites();
    }

    return true;
  };

  HZ.removeFavorite = (productId) => {
    HZ.favorites =
      HZ.favorites.filter(
        id => String(id) !== String(productId)
      );

    HZ.saveFavorites();

    return true;
  };

  HZ.toggleFavorite = (productId) => {
    if (HZ.isFavorite(productId)) {
      HZ.removeFavorite(productId);
      return false;
    }

    HZ.addFavorite(productId);
    return true;
  };

  HZ.clearFavorites = () => {
    HZ.favorites = [];
    return HZ.saveFavorites();
  };

  HZ.getFavoriteProducts = (
    products = HZ.products || []
  ) => {
    return products.filter(product =>
      HZ.isFavorite(product.id)
    );
  };

  HZ.loadFavorites();

})();
