const PRODUCT_PAGE = {
  product: null,
  productId: null,

  init() {
    this.productId = this.getProductId();

    const retry =
      document.querySelector(
        "[data-product-retry]"
      );

    if (retry) {
      retry.addEventListener(
        "click",
        () => this.load()
      );
    }

    if (!this.productId) {
      this.showError();
      return;
    }

    this.load();
  },

  getProductId() {
    const params =
      new URLSearchParams(
        window.location.search
      );

    return (
      params.get("id") ||
      params.get("productId") ||
      ""
    ).trim();
  },

  async load() {
    this.showLoading();

    try {
      const product =
        await this.fetchProduct(
          this.productId
        );

      if (!product) {
        throw new Error(
          "Product not found"
        );
      }

      this.product =
        this.normalizeProduct(
          product
        );

      this.render(
        this.product
      );

      this.showContent();

      this.trackView(
        this.product
      );

      this.loadRelated(
        this.product
      );

    } catch (error) {
      console.error(
        "Product page error:",
        error
      );

      this.showError();
    }
  },

  async fetchProduct(id) {
    const endpoints = [
      `/api/products/${encodeURIComponent(id)}`,
      `/api/products?id=${encodeURIComponent(id)}`
    ];

    let lastError = null;

    for (
      const endpoint of endpoints
    ) {
      try {
        const response =
          await fetch(
            endpoint,
            {
              method: "GET",
              cache: "no-store"
            }
          );

        if (
          response.status === 404
        ) {
          continue;
        }

        if (!response.ok) {
          throw new Error(
            `HTTP ${response.status}`
          );
        }

        const data =
          await response.json();

        const product =
          this.extractProduct(
            data,
            id
          );

        if (product) {
          return product;
        }
      } catch (error) {
        lastError = error;
      }
    }

    if (lastError) {
      throw lastError;
    }

    return null;
  },

  extractProduct(data, id) {
    if (!data) {
      return null;
    }

    if (
      Array.isArray(data)
    ) {
      return (
        data.find(
          (item) =>
            String(
              item?.id ??
              item?.productId
            ) === String(id)
        ) || null
      );
    }

    if (
      data.product
    ) {
      return data.product;
    }

    if (
      Array.isArray(
        data.products
      )
    ) {
      return (
        data.products.find(
          (item) =>
            String(
              item?.id ??
              item?.productId
            ) === String(id)
        ) || null
      );
    }

    if (
      data.id != null ||
      data.productId != null
    ) {
      return data;
    }

    return null;
  },

  normalizeProduct(product = {}) {
    const images =
      Array.isArray(
        product.images
      )
        ? product.images
        : [];

    const mainImage =
      product.image ||
      product.imageUrl ||
      product.thumbnail ||
      images[0] ||
      "";

    const normalizedImages =
      [
        mainImage,
        ...images
      ]
        .map((image) => {
          if (
            typeof image ===
            "string"
          ) {
            return image;
          }

          if (
            image &&
            typeof image ===
              "object"
          ) {
            return (
              image.url ||
              image.src ||
              image.image ||
              ""
            );
          }

          return "";
        })
        .filter(Boolean)
        .filter(
          (image, index, list) =>
            list.indexOf(
              image
            ) === index
        );

    return {
      ...product,

      id:
        product.id ??
        product.productId,

      name:
        product.name ||
        product.title ||
        "",

      image:
        mainImage,

      images:
        normalizedImages,

      price:
        Number(
          product.price
        ) || 0,

      oldPrice:
        Number(
          product.oldPrice
        ) || 0,

      discount:
        Number(
          product.discount
        ) || 0,

      rating:
        Number(
          product.rating
        ) || 0,

      ratingCount:
        Number(
          product.ratingCount ??
          product.reviewsCount ??
          product.reviewCount
        ) || 0,

      sales:
        Number(
          product.sales
        ) || 0,

      stock:
        product.stock ??
        product.quantity ??
        null,

      category:
        product.category ||
        product.categoryName ||
        ""
    };
  },

  render(product) {
    const title =
      document.querySelector(
        "[data-product-title]"
      );

    const category =
      document.querySelector(
        "[data-product-category]"
      );

    const description =
      document.querySelector(
        "[data-product-description]"
      );

    const stock =
      document.querySelector(
        "[data-product-stock]"
      );

    const meta =
      document.querySelector(
        "[data-product-meta]"
      );

    if (title) {
      title.textContent =
        product.name;
    }

    if (category) {
      if (product.category) {
        category.textContent =
          product.category;

        category.hidden =
          false;
      } else {
        category.hidden =
          true;
      }
    }

    this.renderGallery(
      product
    );

    this.renderRating(
      product
    );

    this.renderPrice(
      product
    );

    if (description) {
      if (product.description) {
        description.textContent =
          product.description;

        description.hidden =
          false;
      } else {
        description.hidden =
          true;
      }
    }

    if (stock) {
      this.renderStock(
        stock,
        product
      );
    }

    this.renderQuantity(
      product
    );

    this.renderMeta(
      meta,
      product
    );

    this.bindActions(
      product
    );

    document.title =
      product.name
        ? `${product.name} | HZ.shop`
        : "HZ.shop | المنتج";
  },

  renderGallery(product) {
    const container =
      document.querySelector(
        "[data-product-gallery-container]"
      );

    if (!container) {
      return;
    }

    if (
      typeof PRODUCT_GALLERY ===
        "undefined" ||
      typeof PRODUCT_GALLERY.create !==
        "function"
    ) {
      return;
    }

    container.innerHTML =
      "";

    const gallery =
      PRODUCT_GALLERY.create(
        product.images.length
          ? product.images
          : [product.image],
        {
          onChange() {}
        }
      );

    if (gallery) {
      container.appendChild(
        gallery
      );
    }
  },

  renderRating(product) {
    const container =
      document.querySelector(
        "[data-product-rating-container]"
      );

    if (!container) {
      return;
    }

    container.innerHTML =
      "";

    if (
      typeof RATING ===
        "undefined" ||
      typeof RATING.create !==
        "function"
    ) {
      return;
    }

    const rating =
      RATING.create(
        product.rating,
        product.ratingCount
      );

    if (rating) {
      container.appendChild(
        rating
      );
    }
  },

  renderPrice(product) {
    const container =
      document.querySelector(
        "[data-product-price-container]"
      );

    if (!container) {
      return;
    }

    container.innerHTML =
      "";

    if (
      typeof PRICE_DISPLAY ===
        "undefined" ||
      typeof PRICE_DISPLAY.create !==
        "function"
    ) {
      return;
    }

    const price =
      PRICE_DISPLAY.create(
        product.price,
        {
          oldPrice:
            product.oldPrice,
          discount:
            product.discount
        }
      );

    if (price) {
      container.appendChild(
        price
      );
    }
  },

  renderStock(element, product) {
    if (!element) return;

    const stock =
      Number(product.stock);

    if (
      Number.isFinite(stock)
    ) {
      if (stock <= 0) {
        element.textContent =
          "غير متوفر حالياً";

        element.style.color =
          "#c62828";

        return;
      }

      element.textContent =
        `متوفر — ${UTILS.formatNumber(stock)} قطعة`;

      element.style.color =
        "#16803c";

      return;
    }

    element.textContent =
      "متوفر";

    element.style.color =
      "#16803c";
  },

  renderQuantity(product) {
    const container =
      document.querySelector(
        "[data-product-quantity-container]"
      );

    if (!container) {
      return;
    }

    container.innerHTML =
      "";

    if (
      typeof QUANTITY_CONTROL ===
        "undefined" ||
      typeof QUANTITY_CONTROL.create !==
        "function"
    ) {
      return;
    }

    const stock =
      Number(product.stock);

    const options = {
      value: 1,
      min: 1
    };

    if (
      Number.isFinite(stock) &&
      stock > 0
    ) {
      options.max =
        stock;
    }

    const quantity =
      QUANTITY_CONTROL.create(
        options
      );

    if (quantity) {
      container.appendChild(
        quantity
      );
    }
  },

  renderMeta(element, product) {
    if (!element) return;

    const parts = [];

    if (product.id != null) {
      parts.push(
        `رقم المنتج: ${UTILS.escapeHTML(
          product.id
        )}`
      );
    }

    if (
      Number.isFinite(
        Number(product.sales)
      ) &&
      product.sales > 0
    ) {
      parts.push(
        `${UTILS.formatNumber(
          product.sales
        )} مبيع`
      );
    }

    element.innerHTML =
      parts
        .map(
          (part) =>
            `<span>${part}</span>`
        )
        .join("");
  },

  bindActions(product) {
    const addButton =
      document.querySelector(
        "[data-product-add-cart]"
      );

    const wishlistButton =
      document.querySelector(
        "[data-product-wishlist]"
      );

    if (addButton) {
      addButton.onclick = () => {
        let quantity = 1;

        const quantityElement =
          document.querySelector(
            "[data-quantity-control]"
          );

        if (
          quantityElement &&
          typeof QUANTITY_CONTROL !==
            "undefined"
        ) {
          quantity =
            QUANTITY_CONTROL.getValue(
              quantityElement
            );
        }

        if (
          typeof CART !==
            "undefined" &&
          typeof CART.add ===
            "function"
        ) {
          for (
            let index = 0;
            index < quantity;
            index++
          ) {
            CART.add(product);
          }

          if (
            typeof TOAST !==
              "undefined"
          ) {
            TOAST.success(
              "تمت إضافة المنتج إلى السلة"
            );
          }
        }
      };
    }

    if (wishlistButton) {
      wishlistButton.onclick = () => {
        if (
          typeof WISHLIST !==
            "undefined" &&
          typeof WISHLIST.toggle ===
            "function"
        ) {
          WISHLIST.toggle(
            product
          );

          wishlistButton.classList.toggle(
            "active"
          );
        }
      };
    }
  },

  async loadRelated(product) {
    const section =
      document.querySelector(
        "[data-product-related]"
      );

    const grid =
      document.querySelector(
        "[data-product-related-grid]"
      );

    if (!section || !grid) {
      return;
    }

    try {
      const response =
        await fetch(
          "/api/products?limit=10",
          {
            method: "GET",
            cache: "no-store"
          }
        );

      if (!response.ok) {
        return;
      }

      const data =
        await response.json();

      let products =
        Array.isArray(data)
          ? data
          : Array.isArray(
              data.products
            )
            ? data.products
            : [];

      products =
        products
          .filter(
            (item) =>
              String(
                item?.id ??
                item?.productId
              ) !==
              String(product.id)
          )
          .slice(0, 5);

      if (!products.length) {
        return;
      }

      grid.innerHTML =
        "";

      products.forEach(
        (item) => {
          if (
            typeof PRODUCT_CARD ===
              "undefined"
          ) {
            return;
          }

          const card =
            PRODUCT_CARD.create(
              item
            );

          if (card) {
            grid.appendChild(
              card
            );
          }
        }
      );

      section.hidden =
        false;

    } catch (error) {
      console.error(
        "Related products error:",
        error
      );
    }
  },

  trackView(product) {
    try {
      const recent =
        STORAGE.get(
          "hz_recently_viewed",
          []
        );

      const list =
        Array.isArray(recent)
          ? recent
          : [];

      const item = {
        id: product.id,
        name: product.name,
        image: product.image,
        price: product.price
      };

      const filtered =
        list.filter(
          (entry) =>
            String(
              entry?.id
            ) !==
            String(product.id)
        );

      filtered.unshift(
        item
      );

      STORAGE.set(
        "hz_recently_viewed",
        filtered.slice(
          0,
          20
        )
      );

      if (
        typeof APP_STATE !==
        "undefined"
      ) {
        APP_STATE.recentlyViewed =
          filtered.slice(
            0,
            20
          );
      }

    } catch (error) {
      console.error(
        "Recently viewed error:",
        error
      );
    }
  },

  showLoading() {
    const loading =
      document.querySelector(
        "[data-product-loading]"
      );

    const content =
      document.querySelector(
        "[data-product-content]"
      );

    const error =
      document.querySelector(
        "[data-product-error]"
      );

    if (loading) {
      loading.hidden =
        false;
    }

    if (content) {
      content.hidden =
        true;
    }

    if (error) {
      error.hidden =
        true;
    }
  },

  showContent() {
    const loading =
      document.querySelector(
        "[data-product-loading]"
      );

    const content =
      document.querySelector(
        "[data-product-content]"
      );

    const error =
      document.querySelector(
        "[data-product-error]"
      );

    if (loading) {
      loading.hidden =
        true;
    }

    if (content) {
      content.hidden =
        false;
    }

    if (error) {
      error.hidden =
        true;
    }
  },

  showError() {
    const loading =
      document.querySelector(
        "[data-product-loading]"
      );

    const content =
      document.querySelector(
        "[data-product-content]"
      );

    const error =
      document.querySelector(
        "[data-product-error]"
      );

    if (loading) {
      loading.hidden =
        true;
    }

    if (content) {
      content.hidden =
        true;
    }

    if (error) {
      error.hidden =
        false;
    }
  }
};

document.addEventListener(
  "DOMContentLoaded",
  () => {
    PRODUCT_PAGE.init();
  }
);
