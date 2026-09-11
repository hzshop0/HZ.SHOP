/* =================================
   HZ.SHOP — Recommendations
   Product recommendation helpers
   ================================= */
(() => {
  "use strict";
  window.HZ = window.HZ || {};
  /* ---------------------------------
     Product recommendations
     --------------------------------- */
  HZ.getRecommendedProducts = (
    products = HZ.products || [],
    currentProduct = null,
    limit = 8
  ) => {
    if (!Array.isArray(products) || !products.length) {
      return [];
    }
    const currentCategory = HZ.normalizeCategory
      ? HZ.normalizeCategory(currentProduct?.category)
      : String(currentProduct?.category || "")
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
        const category = HZ.normalizeCategory
          ? HZ.normalizeCategory(product?.category)
          : String(product?.category || "")
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
        if (
          HZ.toNumber(product?.stock, 0) > 0
        ) {
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
    const value = HZ.normalizeCategory
      ? HZ.normalizeCategory(category)
      : String(category || "")
          .trim()
          .toLowerCase();
    if (!value) {
      return [];
    }
    return products
      .filter(product => {
        const productCategory =
          HZ.normalizeCategory
            ? HZ.normalizeCategory(product?.category)
            : String(product?.category || "")
                .trim()
                .toLowerCase();
        return productCategory === value;
      })
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
    /*
      إذا لم توجد مفضلة للعميل،
      نعيد المنتجات المتوفرة حسب ترتيب
      المنتجات الحالي بدل اختراع ترتيب جديد.
    */
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
          HZ.normalizeCategory
            ? HZ.normalizeCategory(product?.category)
            : String(product?.category || "")
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
      .filter(product => {
        const category =
          HZ.normalizeCategory
            ? HZ.normalizeCategory(product?.category)
            : String(product?.category || "")
                .trim()
                .toLowerCase();
        return categories.has(category);
      })
      .filter(product =>
        HZ.toNumber(product?.stock, 0) > 0
      )
      .slice(0, Math.max(0, limit));
  };
})();
