/* =================================
   HZ.SHOP — Recommendations
   Product recommendation helpers
   ================================= */

(() => {
  "use strict";

  window.HZ = window.HZ || {};

  HZ.getRecommendedProducts = (
    products = HZ.products || [],
    currentProduct = null,
    limit = 8
  ) => {
    if (!Array.isArray(products) || !products.length) {
      return [];
    }

    const currentCategory =
      String(currentProduct?.category || "")
        .trim()
        .toLowerCase();

    const currentBrand =
      String(currentProduct?.brand || "")
        .trim()
        .toLowerCase();

    const currentId =
      currentProduct?.id;

    const scored = products
      .filter(product =>
        String(product?.id) !== String(currentId)
      )
      .map(product => {
        let score = 0;

        const category =
          String(product?.category || "")
            .trim()
            .toLowerCase();

        const brand =
          String(product?.brand || "")
            .trim()
            .toLowerCase();

        if (
          currentCategory &&
          category === currentCategory
        ) {
          score += 5;
        }

        if (
          currentBrand &&
          brand === currentBrand
        ) {
          score += 3;
        }

        if (product?.stock > 0) {
          score += 1;
        }

        return {
          product,
          score
        };
      });

    scored.sort(
      (a, b) => b.score - a.score
    );

    return scored
      .slice(0, Math.max(0, limit))
      .map(item => item.product);
  };

  /* ---------------------------------
     Category recommendations
     --------------------------------- */

  HZ.getCategoryRecommendations = (
    category,
    products = HZ.products || [],
    limit = 8
  ) => {
    const value =
      String(category || "")
        .trim()
        .toLowerCase();

    if (!value) {
      return [];
    }

    return products
      .filter(product =>
        String(product?.category || "")
          .trim()
          .toLowerCase() === value
      )
      .filter(product =>
        HZ.toNumber(product?.stock, 0) > 0
      )
      .slice(0, Math.max(0, limit));
  };

  /* ---------------------------------
     Personalized recommendations
     --------------------------------- */

  HZ.getPersonalizedRecommendations = (
    products = HZ.products || [],
    limit = 8
  ) => {
    const favorites =
      Array.isArray(HZ.favorites)
        ? HZ.favorites
        : [];

    const favoriteProducts =
      products.filter(product =>
        favorites.some(
          id =>
            String(id) ===
            String(product?.id)
        )
      );

    if (!favoriteProducts.length) {
      return products
        .filter(product =>
          HZ.toNumber(product?.stock, 0) > 0
        )
        .slice(0, Math.max(0, limit));
    }

    const categories = new Set(
      favoriteProducts
        .map(product =>
          String(product?.category || "")
            .trim()
            .toLowerCase()
        )
        .filter(Boolean)
    );

    return products
      .filter(product =>
        !favorites.some(
          id =>
            String(id) ===
            String(product?.id)
        )
      )
      .filter(product =>
        categories.has(
          String(product?.category || "")
            .trim()
            .toLowerCase()
        )
      )
      .filter(product =>
        HZ.toNumber(product?.stock, 0) > 0
      )
      .slice(0, Math.max(0, limit));
  };

})();
