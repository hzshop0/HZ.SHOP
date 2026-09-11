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
     Matches current Index.html
     --------------------------------- */
  HZ.normalizeProductImages = (product) => {
    if (!product || typeof product !== "object") {
      return [];
    }
    let raw = null;
    if (product.images !== undefined) {
      raw = product.images;
    } else if (product.image !== undefined) {
      raw = product.image;
    }
    if (raw === null || raw === undefined) {
      return [];
    }
    if (typeof raw === "string") {
      const value = raw.trim();
      if (!value) {
        return [];
      }
      if (
        value.startsWith("[") &&
        value.endsWith("]")
      ) {
        try {
          const parsed = JSON.parse(value);
          if (Array.isArray(parsed)) {
            raw = parsed;
          } else {
            raw = [value];
          }
        } catch {
          raw = [value];
        }
      } else if (value.includes("\n")) {
        raw = value
          .split(/\r?\n/)
          .map(image => image.trim())
          .filter(Boolean);
      } else if (value.includes(",")) {
        raw = value
          .split(",")
          .map(image => image.trim())
          .filter(Boolean);
      } else {
        raw = [value];
      }
    }
    if (!Array.isArray(raw)) {
      raw = [raw];
    }
    return raw
      .map(image => {
        if (typeof image === "string") {
          return image.trim();
        }
        if (image && typeof image === "object") {
          return String(
            image.url ||
            image.image ||
            image.src ||
            image.path ||
            ""
          ).trim();
        }
        return "";
      })
      .filter(Boolean);
  };
  /* ---------------------------------
     Normalize product
     Matches current Index.html
     --------------------------------- */
  HZ.normalizeProduct = (product) => {
    if (!product || typeof product !== "object") {
      return null;
    }
    const images =
      HZ.normalizeProductImages(product);
    const category =
      typeof HZ.normalizeCategory === "function"
        ? HZ.normalizeCategory(product.category)
        : String(product.category || "")
            .trim()
            .toLowerCase();
    const categoryName =
      typeof HZ.categoryName === "function"
        ? HZ.categoryName(product.category)
        : category;
    const salesValue =
      product.sales ??
      product.sold ??
      product.sold_count ??
      product.soldCount ??
      product.orders_count ??
      product.ordersCount ??
      product.purchases ??
      product.purchase_count ??
      product.purchaseCount;
    const createdAt =
      product.created_at ??
      product.createdAt ??
      product.created ??
      product.date_added ??
      product.dateAdded ??
      product.published_at ??
      product.publishedAt;
    return {
      ...product,
      id: Number(product.id),
      name: String(
        product.name || ""
      ),
      category,
      categoryName,
      description: String(
        product.description || ""
      ),
      price: Number(
        product.price || 0
      ),
      old:
        product.old_price !== null &&
        product.old_price !== undefined &&
        product.old_price !== ""
          ? Number(product.old_price)
          : null,
      image:
        images[0] ||
        String(product.image || ""),
      images,
      stock: Math.max(
        0,
        Number(product.stock || 0)
      ),
      badge: String(
        product.badge || ""
      ),
      /* Optional real backend metadata */
      salesCount:
        salesValue !== undefined &&
        salesValue !== null
          ? Number(salesValue)
          : null,
      createdAt:
        createdAt || null
    };
  };
  /* ---------------------------------
     Normalize API response
     --------------------------------- */
  HZ.normalizeProductsResponse = (response) => {
    let list = [];
    if (Array.isArray(response)) {
      list = response;
    } else if (
      response &&
      typeof response === "object"
    ) {
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
     Matches current Index.html
     --------------------------------- */
  HZ.loadProducts = async (options = {}) => {
    if (
      HZ.productsLoading &&
      !options.force
    ) {
      return HZ.products;
    }
    HZ.productsLoading = true;
    const box =
      document.getElementById("products");
    if (box) {
      box.innerHTML =
        '<div class="loading">جاري تحميل المنتجات...</div>';
    }
    const controller =
      new AbortController();
    const timeout =
      setTimeout(() => {
        controller.abort();
      }, 12000);
    try {
      const query =
        options.query ||
        `?t=${Date.now()}`;
      const response =
        await fetch(
          `/api/products${query}`,
          {
            method: "GET",
            cache: "no-store",
            signal: controller.signal
          }
        );
      clearTimeout(timeout);
      if (!response.ok) {
        throw new Error(
          "تعذر تحميل المنتجات"
        );
      }
      const data =
        await response.json();
      if (!Array.isArray(data)) {
        throw new Error(
          "بيانات المنتجات غير صحيحة"
        );
      }
      HZ.products =
        data
          .map(HZ.normalizeProduct)
          .filter(Boolean);
      /*
       * Keep the current Index.html
       * post-load behavior.
       */
      if (
        typeof window.cleanupCart ===
        "function"
      ) {
        window.cleanupCart();
      } else if (
        typeof HZ.cleanupCart ===
        "function"
      ) {
        HZ.cleanupCart();
      }
      if (
        typeof window.render ===
        "function"
      ) {
        window.render();
      }
      if (
        typeof window.renderSmartSections ===
        "function"
      ) {
        window.renderSmartSections();
      }
      if (
        typeof window.renderCart ===
        "function"
      ) {
        window.renderCart();
      }
      if (
        typeof window.updateFavoriteCount ===
        "function"
      ) {
        window.updateFavoriteCount();
      } else if (
        typeof HZ.updateFavoriteCount ===
        "function"
      ) {
        HZ.updateFavoriteCount();
      }
      return HZ.products;
    } catch (error) {
      console.error(error);
      if (box) {
        box.innerHTML =
          '<div class="empty-products">' +
          '<strong>تعذر تحميل المنتجات</strong>' +
          'حاول تحديث الصفحة مرة أخرى.' +
          '</div>';
      }
      const results =
        document.getElementById(
          "results"
        );
      if (results) {
        results.textContent =
          "حدث خطأ في تحميل المنتجات";
      }
      return HZ.products;
    } finally {
      clearTimeout(timeout);
      HZ.productsLoading = false;
    }
  };
  /* ---------------------------------
     Find product
     --------------------------------- */
  HZ.getProductById = (id) => {
    if (
      id === undefined ||
      id === null
    ) {
      return null;
    }
    return (
      HZ.products.find(
        product =>
          String(product.id) ===
          String(id)
      ) || null
    );
  };
  /* ---------------------------------
     Filter products
     Additional helper
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
        typeof HZ.normalizeCategory ===
        "function"
          ? HZ.normalizeCategory(
              filters.category
            )
          : String(filters.category)
              .trim()
              .toLowerCase();
      result = result.filter(product =>
        String(product.category)
          .trim()
          .toLowerCase() ===
        String(category)
          .trim()
          .toLowerCase()
      );
    }
    if (filters.brand) {
      const brand =
        String(filters.brand)
          .trim()
          .toLowerCase();
      result = result.filter(product =>
        String(product.brand || "")
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
          product.categoryName,
          product.brand,
          product.description
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return text.includes(search);
      });
    }
    if (filters.inStock) {
      result = result.filter(
        product =>
          Number(product.stock) > 0
      );
    }
    if (Number.isFinite(filters.minPrice)) {
      result = result.filter(
        product =>
          Number(product.price) >=
          filters.minPrice
      );
    }
    if (Number.isFinite(filters.maxPrice)) {
      result = result.filter(
        product =>
          Number(product.price) <=
          filters.maxPrice
      );
    }
    return result;
  };
})();
