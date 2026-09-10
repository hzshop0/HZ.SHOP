/* =================================
   HZ.SHOP — Products
   Product loading and normalization
   ================================= */

(() => {
  "use strict";

  window.HZ = window.HZ || {};

  HZ.products = [];
  HZ.productsLoading = false;

  /* ---------------------------------
     Normalize images
     --------------------------------- */

  HZ.normalizeProductImages = (product) => {
    if (!product || typeof product !== "object") {
      return [];
    }

    let images = [];

    if (Array.isArray(product.images)) {
      images = product.images;
    } else if (typeof product.images === "string") {
      try {
        const parsed = JSON.parse(product.images);
        images = Array.isArray(parsed) ? parsed : [product.images];
      } catch {
        images = product.images
          .split(",")
          .map(image => image.trim())
          .filter(Boolean);
      }
    }

    if (!images.length && product.image) {
      images = [product.image];
    }

    return images
      .map(image => {
        if (typeof image === "string") {
          return image.trim();
        }

        if (image && typeof image === "object") {
          return (
            image.url ||
            image.src ||
            image.image ||
            ""
          );
        }

        return "";
      })
      .filter(Boolean);
  };

  /* ---------------------------------
     Normalize product
     --------------------------------- */

  HZ.normalizeProduct = (product) => {
    if (!product || typeof product !== "object") {
      return null;
    }

    const normalized = {
      ...product,

      id:
        product.id ??
        product.product_id ??
        product.productId ??
        "",

      name:
        product.name ??
        product.title ??
        "",

      price: HZ.toNumber(
        product.price ??
        product.sale_price ??
        product.salePrice,
        0
      ),

      oldPrice: HZ.toNumber(
        product.old_price ??
        product.oldPrice ??
        product.compare_price ??
        product.comparePrice,
        0
      ),

      stock: HZ.toNumber(
        product.stock ??
        product.inventory ??
        product.quantity,
        0
      ),

      category:
        product.category ??
        product.category_name ??
        product.categoryName ??
        "",

      brand:
        product.brand ??
        product.brand_name ??
        product.brandName ??
        "",

      badge:
        product.badge ??
        product.label ??
        "",

      description:
        product.description ??
        product.details ??
        "",

      images: []
    };

    normalized.images =
      HZ.normalizeProductImages(product);

    normalized.image =
      normalized.images[0] ||
      product.image ||
      "";

    normalized.inStock =
      normalized.stock > 0;

    return normalized;
  };

  /* ---------------------------------
     Normalize API response
     --------------------------------- */

  HZ.normalizeProductsResponse = (response) => {
    let list = [];

    if (Array.isArray(response)) {
      list = response;
    } else if (response && typeof response === "object") {
      if (Array.isArray(response.products)) {
        list = response.products;
      } else if (Array.isArray(response.data)) {
        list = response.data;
      } else if (response.product) {
        list = [response.product];
      }
    }

    return list
      .map(HZ.normalizeProduct)
      .filter(Boolean);
  };

  /* ---------------------------------
     Load products
     --------------------------------- */

  HZ.loadProducts = async (options = {}) => {
    if (HZ.productsLoading && !options.force) {
      return HZ.products;
    }

    HZ.productsLoading = true;

    try {
      const query =
        options.query ||
        `?t=${Date.now()}`;

      const response =
        await HZ.apiGet(
          `/products${query}`
        );

      HZ.products =
        HZ.normalizeProductsResponse(response);

      return HZ.products;
    } finally {
      HZ.productsLoading = false;
    }
  };

  /* ---------------------------------
     Find product
     --------------------------------- */

  HZ.getProductById = (id) => {
    if (id === undefined || id === null) {
      return null;
    }

    return (
      HZ.products.find(
        product =>
          String(product.id) === String(id)
      ) || null
    );
  };

  /* ---------------------------------
     Filter products
     --------------------------------- */

  HZ.filterProducts = (
    products = HZ.products,
    filters = {}
  ) => {
    let result = Array.isArray(products)
      ? [...products]
      : [];

    if (filters.category) {
      const category =
        String(filters.category)
          .trim()
          .toLowerCase();

      result = result.filter(product =>
        String(product.category)
          .trim()
          .toLowerCase() === category
      );
    }

    if (filters.brand) {
      const brand =
        String(filters.brand)
          .trim()
          .toLowerCase();

      result = result.filter(product =>
        String(product.brand)
          .trim()
          .toLowerCase() === brand
      );
    }

    if (filters.search) {
      const search =
        String(filters.search)
          .trim()
          .toLowerCase();

      result = result.filter(product => {
        const text = [
          product.name,
          product.category,
          product.brand,
          product.description
        ]
          .join(" ")
          .toLowerCase();

        return text.includes(search);
      });
    }

    if (filters.inStock) {
      result = result.filter(
        product => product.stock > 0
      );
    }

    if (Number.isFinite(filters.minPrice)) {
      result = result.filter(
        product =>
          product.price >= filters.minPrice
      );
    }

    if (Number.isFinite(filters.maxPrice)) {
      result = result.filter(
        product =>
          product.price <= filters.maxPrice
      );
    }

    return result;
  };

})();
