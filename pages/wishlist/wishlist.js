const WISHLIST_PAGE = {
  products: [],
  currentPage: 1,
  perPage: 20,

  init() {
    this.bindEvents();
    this.load();
  },

  bindEvents() {
    const clearButton =
      document.querySelector(
        "[data-wishlist-clear]"
      );

    if (clearButton) {
      clearButton.addEventListener(
        "click",
        () => this.clear()
      );
    }
  },

  async load() {
    this.showLoading(true);

    try {
      const wishlistIds =
        this.getWishlistIds();

      if (!wishlistIds.length) {
        this.products = [];
        this.render();
        return;
      }

      const products =
        await this.loadProducts();

      this.products =
        products.filter(product =>
          wishlistIds.includes(
            String(product.id)
          )
        );

      this.render();

    } catch (error) {
      console.error(
        "Wishlist load error:",
        error
      );

      this.products = [];
      this.renderError();

    } finally {
      this.showLoading(false);
    }
  },

  getWishlistIds() {
    let wishlist = [];

    if (
      typeof WISHLIST !==
      "undefined"
    ) {
      if (
        Array.isArray(WISHLIST.items)
      ) {
        wishlist =
          WISHLIST.items;
      } else if (
        Array.isArray(WISHLIST)
      ) {
        wishlist =
          WISHLIST;
      }
    }

    if (!wishlist.length) {
      const stored =
        typeof STORAGE !==
        "undefined"
          ? STORAGE.get(
              "hz_wishlist",
              []
            )
          : [];

      if (Array.isArray(stored)) {
        wishlist = stored;
      }
    }

    return wishlist
      .map(item => {
        if (
          item &&
          typeof item ===
            "object"
        ) {
          return String(
            item.id ??
            item.productId ??
            ""
          );
        }

        return String(item);
      })
      .filter(Boolean);
  },

  async loadProducts() {
    const response =
      await fetch(
        `/api/products?t=${Date.now()}`,
        {
          method: "GET",
          cache: "no-store"
        }
      );

    if (!response.ok) {
      throw new Error(
        `Products request failed: ${response.status}`
      );
    }

    const data =
      await response.json();

    const products =
      Array.isArray(data)
        ? data
        : Array.isArray(data.products)
          ? data.products
          : Array.isArray(data.data)
            ? data.data
            : [];

    return products
      .map(product =>
        this.normalizeProduct(
          product
        )
      )
      .filter(Boolean);
  },

  normalizeProduct(
    product = {}
  ) {
    const id =
      product.id ??
      product.productId ??
      product.ID ??
      "";

    if (!id) {
      return null;
    }

    const price =
      Number(
        product.price ??
        product.salePrice ??
        product.currentPrice ??
        0
      ) || 0;

    const oldPrice =
      Number(
        product.oldPrice ??
        product.comparePrice ??
        product.originalPrice ??
        0
      ) || 0;

    const image =
      product.image ??
      product.imageUrl ??
      product.thumbnail ??
      product.photo ??
      "";

    return {
      ...product,

      id: String(id),

      name:
        product.name ??
        product.title ??
        "منتج",

      price,

      oldPrice,

      image,

      images:
        Array.isArray(
          product.images
        )
          ? product.images
          : image
            ? [image]
            : [],

      rating:
        Number(
          product.rating ??
          product.averageRating ??
          0
        ) || 0,

      ratingCount:
        Number(
          product.ratingCount ??
          product.reviewsCount ??
          product.reviewCount ??
          0
        ) || 0
    };
  },

  render() {
    const container =
      document.querySelector(
        "[data-wishlist-products]"
      );

    const empty =
      document.querySelector(
        "[data-wishlist-empty]"
      );

    const clearButton =
      document.querySelector(
        "[data-wishlist-clear]"
      );

    const subtitle =
      document.querySelector(
        "[data-wishlist-subtitle]"
      );

    if (!container) {
      return;
    }

    container.innerHTML = "";

    if (!this.products.length) {
      container.hidden = true;

      if (empty) {
        empty.hidden = false;
      }

      if (clearButton) {
        clearButton.hidden = true;
      }

      if (subtitle) {
        subtitle.hidden = true;
      }

      this.renderPagination(0);

      return;
    }

    if (empty) {
      empty.hidden = true;
    }

    if (clearButton) {
      clearButton.hidden = false;
    }

    if (subtitle) {
      subtitle.hidden = false;
      subtitle.textContent =
        `${this.products.length} منتج`;
    }

    container.hidden = false;

    const start =
      (this.currentPage - 1) *
      this.perPage;

    const end =
      start + this.perPage;

    const visibleProducts =
      this.products.slice(
        start,
        end
      );

    visibleProducts.forEach(
      product => {
        const element =
          this.createProductCard(
            product
          );

        if (element) {
          container.appendChild(
            element
          );
        }
      }
    );

    this.renderPagination(
      this.products.length
    );
  },

  createProductCard(product) {
    if (
      typeof PRODUCT_CARD !==
      "undefined" &&
      typeof PRODUCT_CARD.create ===
        "function"
    ) {
      return PRODUCT_CARD.create(
        product,
        {
          showWishlist: true,
          showRating: true,
          onWishlist: () =>
            this.removeProduct(
              product.id
            )
        }
      );
    }

    return this.createFallbackCard(
      product
    );
  },

  createFallbackCard(product) {
    const card =
      document.createElement(
        "article"
      );

    card.className =
      "wishlist-fallback-card";

    const image =
      product.image ||
      product.images?.[0] ||
      "";

    const discount =
      product.oldPrice >
      product.price &&
      product.oldPrice > 0
        ? Math.round(
            (
              (product.oldPrice -
                product.price) /
              product.oldPrice
            ) * 100
          )
        : 0;

    card.innerHTML = `
      <a
        href="/pages/product/?id=${encodeURIComponent(
          product.id
        )}"
        class="wishlist-fallback-image"
      >
        ${
          image
            ? `
              <img
                src="${this.escapeHTML(
                  image
                )}"
                alt="${this.escapeHTML(
                  product.name
                )}"
                loading="lazy"
              >
            `
            : `
              <span>لا توجد صورة</span>
            `
        }
      </a>

      <div class="wishlist-fallback-content">

        <h2>
          <a
            href="/pages/product/?id=${encodeURIComponent(
              product.id
            )}"
          >
            ${this.escapeHTML(
              product.name
            )}
          </a>
        </h2>

        <div class="wishlist-fallback-price">
          <strong>
            ${this.formatPrice(
              product.price
            )}
          </strong>

          ${
            product.oldPrice >
            product.price
              ? `
                <del>
                  ${this.formatPrice(
                    product.oldPrice
                  )}
                </del>
              `
              : ""
          }

          ${
            discount > 0
              ? `
                <span>
                  -${discount}%
                </span>
              `
              : ""
          }
        </div>

        <button
          type="button"
          data-remove-wishlist
        >
          إزالة من المفضلة
        </button>

      </div>
    `;

    const removeButton =
      card.querySelector(
        "[data-remove-wishlist]"
      );

    if (removeButton) {
      removeButton.addEventListener(
        "click",
        () =>
          this.removeProduct(
            product.id
          )
      );
    }

    return card;
  },

  removeProduct(id) {
    const target =
      String(id);

    if (
      typeof WISHLIST !==
        "undefined"
    ) {
      if (
        typeof WISHLIST.remove ===
          "function"
      ) {
        WISHLIST.remove(target);
      } else if (
        Array.isArray(
          WISHLIST.items
        )
      ) {
        WISHLIST.items =
          WISHLIST.items.filter(
            item =>
              String(
                item?.id ??
                item?.productId ??
                item
              ) !== target
          );
      }
    }

    const stored =
      this.getWishlistIds()
        .filter(
          item => item !== target
        );

    if (
      typeof STORAGE !==
      "undefined"
    ) {
      STORAGE.set(
        "hz_wishlist",
        stored
      );
    }

    this.products =
      this.products.filter(
        product =>
          String(product.id) !==
          target
      );

    if (
      this.currentPage > 1 &&
      (this.currentPage - 1) *
        this.perPage >=
        this.products.length
    ) {
      this.currentPage--;
    }

    this.render();

    if (
      typeof TOAST !==
      "undefined" &&
      typeof TOAST.success ===
        "function"
    ) {
      TOAST.success(
        "تمت إزالة المنتج من المفضلة"
      );
    }
  },

  clear() {
    if (!this.products.length) {
      return;
    }

    const confirmed =
      window.confirm(
        "هل تريد حذف جميع المنتجات من المفضلة؟"
      );

    if (!confirmed) {
      return;
    }

    if (
      typeof WISHLIST !==
        "undefined"
    ) {
      if (
        typeof WISHLIST.clear ===
          "function"
      ) {
        WISHLIST.clear();
      } else if (
        Array.isArray(
          WISHLIST.items
        )
      ) {
        WISHLIST.items = [];
      }
    }

    if (
      typeof STORAGE !==
      "undefined"
    ) {
      STORAGE.set(
        "hz_wishlist",
        []
      );
    }

    this.products = [];
    this.currentPage = 1;

    this.render();

    if (
      typeof TOAST !==
      "undefined" &&
      typeof TOAST.success ===
        "function"
    ) {
      TOAST.success(
        "تم حذف المفضلة"
      );
    }
  },

  renderPagination(total) {
    const totalPages =
      Math.max(
        1,
        Math.ceil(
          total /
          this.perPage
        )
      );

    if (
      typeof PAGINATION ===
        "undefined"
    ) {
      return;
    }

    PAGINATION.init({
      currentPage:
        this.currentPage,

      totalPages,

      onChange: page => {
        this.currentPage =
          page;

        this.render();

        if (
          typeof SCROLL !==
            "undefined" &&
          typeof SCROLL.top ===
            "function"
        ) {
          SCROLL.top();
        }
      }
    });
  },

  showLoading(show) {
    const element =
      document.querySelector(
        "[data-wishlist-loading]"
      );

    if (element) {
      element.hidden = !show;
    }
  },

  renderError() {
    const container =
      document.querySelector(
        "[data-wishlist-products]"
      );

    const empty =
      document.querySelector(
        "[data-wishlist-empty]"
      );

    if (container) {
      container.hidden = true;
    }

    if (empty) {
      empty.hidden = false;

      const title =
        empty.querySelector(
          "h2"
        );

      const text =
        empty.querySelector(
          "p"
        );

      if (title) {
        title.textContent =
          "تعذر تحميل المفضلة";
      }

      if (text) {
        text.textContent =
          "حدث خطأ أثناء تحميل المنتجات. حاول مرة أخرى.";
      }
    }
  },

  formatPrice(value) {
    if (
      typeof UTILS !==
        "undefined" &&
      typeof UTILS.formatPrice ===
        "function"
    ) {
      return UTILS.formatPrice(
        value
      );
    }

    const number =
      Number(value);

    return Number.isFinite(number)
      ? `$${number.toFixed(2)}`
      : "$0.00";
  },

  escapeHTML(value = "") {
    if (
      typeof UTILS !==
        "undefined" &&
      typeof UTILS.escapeHTML ===
        "function"
    ) {
      return UTILS.escapeHTML(
        value
      );
    }

    return String(value)
      .replace(
        /&/g,
        "&amp;"
      )
      .replace(
        /</g,
        "&lt;"
      )
      .replace(
        />/g,
        "&gt;"
      )
      .replace(
        /"/g,
        "&quot;"
      )
      .replace(
        /'/g,
        "&#039;"
      );
  }
};

document.addEventListener(
  "DOMContentLoaded",
  () => {
    WISHLIST_PAGE.init();
  }
);
