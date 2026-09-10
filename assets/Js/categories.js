/* =================================
   HZ.SHOP — Categories
   Category helpers
   ================================= */

(() => {
  "use strict";

  window.HZ = window.HZ || {};

  HZ.categories = [];

  /* ---------------------------------
     Normalize category
     --------------------------------- */

  HZ.normalizeCategory = (category) => {
    if (typeof category === "string") {
      return {
        id: category,
        name: category,
        image: ""
      };
    }

    if (!category || typeof category !== "object") {
      return null;
    }

    return {
      ...category,
      id:
        category.id ??
        category.category_id ??
        category.slug ??
        category.name ??
        "",

      name:
        category.name ??
        category.title ??
        category.category_name ??
        "",

      image:
        category.image ??
        category.image_url ??
        category.imageUrl ??
        ""
    };
  };

  /* ---------------------------------
     Build categories from products
     --------------------------------- */

  HZ.buildCategoriesFromProducts = (
    products = HZ.products
  ) => {
    const map = new Map();

    if (!Array.isArray(products)) {
      HZ.categories = [];
      return HZ.categories;
    }

    products.forEach(product => {
      const category =
        product?.category;

      if (
        category === undefined ||
        category === null ||
        String(category).trim() === ""
      ) {
        return;
      }

      const name = String(category).trim();
      const key = name.toLowerCase();

      if (!map.has(key)) {
        map.set(key, {
          id: key,
          name,
          image:
            product.image ||
            product.images?.[0] ||
            ""
        });
      }
    });

    HZ.categories =
      Array.from(map.values());

    return HZ.categories;
  };

  /* ---------------------------------
     Load categories
     --------------------------------- */

  HZ.loadCategories = async () => {
    try {
      const response =
        await HZ.apiGet(
          `/categories?t=${Date.now()}`
        );

      let categories = [];

      if (Array.isArray(response)) {
        categories = response;
      } else if (
        response &&
        Array.isArray(response.categories)
      ) {
        categories = response.categories;
      } else if (
        response &&
        Array.isArray(response.data)
      ) {
        categories = response.data;
      }

      HZ.categories = categories
        .map(HZ.normalizeCategory)
        .filter(category =>
          category && category.name
        );

      return HZ.categories;
    } catch (error) {
      /*
       * The store can still operate from
       * product category data if the
       * categories endpoint is unavailable.
       */
      if (Array.isArray(HZ.products)) {
        return HZ.buildCategoriesFromProducts();
      }

      throw error;
    }
  };

  /* ---------------------------------
     Find category
     --------------------------------- */

  HZ.getCategoryById = (id) => {
    if (
      id === undefined ||
      id === null
    ) {
      return null;
    }

    return (
      HZ.categories.find(category =>
        String(category.id) === String(id)
      ) || null
    );
  };

  /* ---------------------------------
     Products by category
     --------------------------------- */

  HZ.getProductsByCategory = (
    category
  ) => {
    const value =
      String(category ?? "")
        .trim()
        .toLowerCase();

    if (!value) {
      return [];
    }

    return (HZ.products || []).filter(product =>
      String(product.category ?? "")
        .trim()
        .toLowerCase() === value
    );
  };

})();
