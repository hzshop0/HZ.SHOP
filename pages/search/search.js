const SEARCH_PAGE = {
  products: [],
  query: "",
  currentPage: 1,
  perPage: 20,

  init() {
    this.query =
      this.getQuery();

    this.bindEvents();
    this.setInputValue();
    this.load();
  },

  getQuery() {
    const params =
      new URLSearchParams(
        window.location.search
      );

    return (
      params.get("q") ||
      params.get("query") ||
      ""
    ).trim();
  },

  bindEvents() {
    const form =
      document.querySelector(
        "[data-search-form]"
      );

    if (form) {
      form.addEventListener(
        "submit",
        event => {
          event.preventDefault();

          const input =
            document.querySelector(
              "[data-search-input]"
            );

          const query =
            input?.value.trim() ||
            "";

          this.search(query);
        }
      );
    }
  },

  setInputValue() {
    const input =
      document.querySelector(
        "[data-search-input]"
      );

    if (input) {
      input.value =
        this.query;
    }
  },

  search(query) {
    const value =
      String(query || "")
        .trim();

    if (
      typeof NAVIGATION !==
        "undefined" &&
      typeof NAVIGATION.search ===
        "function"
    ) {
      NAVIGATION.search(
        value
      );

      return;
    }

    const path =
      value
        ? `/pages/search/?q=${encodeURIComponent(
            value
          )}`
        : "/pages/search/";

    window.location.href =
      path;
  },

  async load() {
    this.showLoading(true);
    this.hideEmpty();

    if (!this.query) {
      this.products = [];

      this.renderEmpty(
        "ابدأ البحث عن المنتجات",
        "اكتب اسم المنتج أو الكلمة التي تبحث عنها."
      );

      this.showLoading(false);

      return;
    }

    this.updateHeader();

    try {
      const products =
        await this.loadProducts();

      this.products =
        products.filter(product =>
          this.matchesQuery(
            product,
            this.query
          )
        );

      this.currentPage = 1;

      this.render();

    } catch (error) {
      console.error(
        "Search error:",
        error
      );

      this.products = [];

      this.renderEmpty(
        "تعذر إتمام البحث",
        "حدث خطأ أثناء تحميل المنتجات. حاول مرة أخرى."
      );

    } finally {
      this.showLoading(false);
    }
  },

  async loadProducts() {
    const url =
      `/api/products?q=${encodeURIComponent(
        this.query
      )}&search=${encodeURIComponent(
        this.query
      )}&t=${Date.now()}`;

    const response =
      await fetch(
        url,
        {
          method: "GET",
          cache: "no-store"
        }
      );

    if (!response.ok) {
      throw new Error(
        `Search request failed: ${response.status}`
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

      title:
        product.title ??
        product.name ??
        "منتج",

      description:
        product.description ??
        "",

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
        ) || 0,

      category:
        product.category ??
        product.categoryName ??
        ""
    };
  },

  matchesQuery(
    product,
    query
  ) {
    const value =
      String(query)
        .trim()
        .toLocaleLowerCase();

    if (!value) {
      return true;
    }

    const searchable = [
      product.name,
      product.title,
      product.description,
      product.category,
      product.brand,
      product.sku
    ]
      .filter(Boolean)
      .join(" ")
      .toLocaleLowerCase();

    return searchable.includes(
      value
    );
  },

  render() {
    const container =
      document.querySelector(
        "[data-search-results]"
      );

    if (!container) {
      return;
    }

    container.innerHTML = "";

    if (!this.products.length) {
      container.hidden = true;

      this.renderEmpty(
        "لم يتم العثور على منتجات",
        `لم نجد نتائج مطابقة لـ "${this.query}". جرّب كلمة أخرى.`
      );

      this.renderPagination(0);

      return;
    }

    this.hideEmpty();

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
        const card =
          this.createProductCard(
            product
          );

        if (card) {
          container.appendChild(
            card
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
          showRating: true
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
      "search-fallback-card";

    const image =
      product.image ||
      product.images?.[0] ||
      "";

    card.innerHTML = `
      <a
        href="/pages/product/?id=${encodeURIComponent(
          product.id
        )}"
        class="search-fallback-image"
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
              <span>
                لا توجد صورة
              </span>
            `
        }
      </a>

      <div class="search-fallback-content">

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

        <strong>
          ${this.formatPrice(
            product.price
          )}
        </strong>

      </div>
    `;

    return card;
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

  updateHeader() {
    const title =
      document.querySelector(
        "[data-search-title]"
      );

    const query =
      document.querySelector(
        "[data-search-query]"
      );

    if (title) {
      title.textContent =
        "نتائج البحث";
    }

    if (query) {
      query.hidden = false;

      query.textContent =
        `نتائج البحث عن: "${this.query}"`;
    }
  },

  renderEmpty(
    titleText,
    descriptionText
  ) {
    const container =
      document.querySelector(
        "[data-search-results]"
      );

    const empty =
      document.querySelector(
        "[data-search-empty]"
      );

    const title =
      document.querySelector(
        "[data-search-empty-title]"
      );

    const text =
      document.querySelector(
        "[data-search-empty-text]"
      );

    if (container) {
      container.innerHTML = "";
      container.hidden = true;
    }

    if (empty) {
      empty.hidden = false;
    }

    if (title) {
      title.textContent =
        titleText || "";
    }

    if (text) {
      text.textContent =
        descriptionText || "";
    }
  },

  hideEmpty() {
    const empty =
      document.querySelector(
        "[data-search-empty]"
      );

    if (empty) {
      empty.hidden = true;
    }
  },

  showLoading(show) {
    const loading =
      document.querySelector(
        "[data-search-loading]"
      );

    if (loading) {
      loading.hidden = !show;
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

window.SEARCH_PAGE =
  SEARCH_PAGE;

document.addEventListener(
  "DOMContentLoaded",
  () => {
    SEARCH_PAGE.init();
  }
);
