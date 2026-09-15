const CATEGORY_PAGE = {
  categoryId: "",
  category: null,
  products: [],
  filteredProducts: [],
  currentPage: 1,
  pageSize: 20,

  init() {
    this.categoryId =
      this.getCategoryId();

    const sort =
      document.querySelector(
        "[data-category-sort]"
      );

    const filterButton =
      document.querySelector(
        "[data-category-filter-button]"
      );

    if (sort) {
      sort.addEventListener(
        "change",
        () => {
          this.applyFilters();
        }
      );
    }

    if (filterButton) {
      filterButton.addEventListener(
        "click",
        () => {
          this.toggleFilters();
        }
      );
    }

    if (!this.categoryId) {
      this.loadAllProducts();
      return;
    }

    this.load();
  },

  getCategoryId() {
    const params =
      new URLSearchParams(
        window.location.search
      );

    return (
      params.get("id") ||
      params.get("categoryId") ||
      ""
    ).trim();
  },

  async load() {
    this.showLoading();

    try {
      const category =
        await this.fetchCategory(
          this.categoryId
        );

      this.category =
        category;

      this.renderCategory(
        category
      );

      const products =
        await this.fetchProducts(
          this.categoryId
        );

      this.products =
        this.normalizeProducts(
          products
        );

      this.applyFilters();

    } catch (error) {
      console.error(
        "Category page error:",
        error
      );

      this.products = [];
      this.applyFilters();
    }
  },

  async loadAllProducts() {
    this.showLoading();

    try {
      const products =
        await this.fetchProducts();

      this.products =
        this.normalizeProducts(
          products
        );

      this.renderCategory(
        null
      );

      this.applyFilters();

    } catch (error) {
      console.error(
        "Products loading error:",
        error
      );

      this.products = [];
      this.applyFilters();
    }
  },

  async fetchCategory(id) {
    const endpoints = [
      `/api/categories/${encodeURIComponent(id)}`,
      `/api/categories?id=${encodeURIComponent(id)}`
    ];

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
          continue;
        }

        const data =
          await response.json();

        if (data?.category) {
          return data.category;
        }

        if (
          data &&
          !Array.isArray(data) &&
          !Array.isArray(data.categories)
        ) {
          return data;
        }

        if (
          Array.isArray(
            data?.categories
          )
        ) {
          return (
            data.categories.find(
              (item) =>
                String(
                  item?.id ??
                  item?.categoryId
                ) === String(id)
            ) || null
          );
        }

      } catch {}
    }

    return null;
  },

  async fetchProducts(
    categoryId = ""
  ) {
    const endpoints = [];

    if (categoryId) {
      endpoints.push(
        `/api/products?category=${encodeURIComponent(categoryId)}`
      );

      endpoints.push(
        `/api/products?categoryId=${encodeURIComponent(categoryId)}`
      );
    }

    endpoints.push(
      "/api/products"
    );

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

        if (!response.ok) {
          continue;
        }

        const data =
          await response.json();

        let products = [];

        if (
          Array.isArray(data)
        ) {
          products = data;
        } else if (
          Array.isArray(
            data?.products
          )
        ) {
          products =
            data.products;
        } else if (
          Array.isArray(
            data?.data
          )
        ) {
          products =
            data.data;
        }

        if (
          categoryId &&
          endpoint ===
            "/api/products"
        ) {
          products =
            products.filter(
              (product) =>
                this.matchesCategory(
                  product,
                  categoryId
                )
            );
        }

        return products;
      } catch {}
    }

    return [];
  },

  matchesCategory(
    product,
    categoryId
  ) {
    const values = [
      product?.categoryId,
      product?.category_id,
      product?.category?.id,
      product?.category
    ];

    return values.some(
      (value) =>
        String(value) ===
        String(categoryId)
    );
  },

  normalizeProducts(
    products = []
  ) {
    if (!Array.isArray(products)) {
      return [];
    }

    return products.map(
      (product) => ({
        ...product,

        id:
          product.id ??
          product.productId,

        name:
          product.name ||
          product.title ||
          "",

        image:
          product.image ||
          product.imageUrl ||
          product.thumbnail ||
          "",

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

        sales:
          Number(
            product.sales
          ) || 0
      })
    );
  },

  renderCategory(
    category
  ) {
    const title =
      document.querySelector(
        "[data-category-title]"
      );

    const breadcrumb =
      document.querySelector(
        "[data-category-breadcrumb]"
      );

    const description =
      document.querySelector(
        "[data-category-description]"
      );

    const count =
      document.querySelector(
        "[data-category-count]"
      );

    const name =
      category?.name ||
      category?.title ||
      "المنتجات";

    if (title) {
      title.textContent =
        name;
    }

    if (breadcrumb) {
      breadcrumb.textContent =
        "الرئيسية";
    }

    if (description) {
      const value =
        category?.description ||
        "";

      if (value) {
        description.textContent =
          value;

        description.hidden =
          false;
      } else {
        description.hidden =
          true;
      }
    }

    if (count) {
      count.textContent =
        `${UTILS.formatNumber(
          this.products.length
        )} منتج`;

      count.hidden =
        false;
    }

    document.title =
      `${name} | HZ.shop`;
  },

  applyFilters() {
    const sort =
      document.querySelector(
        "[data-category-sort]"
      );

    const sortValue =
      sort?.value ||
      "default";

    let products =
      [...this.products];

    switch (sortValue) {
      case "newest":
        products.sort(
          (a, b) =>
            this.getDateValue(b) -
            this.getDateValue(a)
        );
        break;

      case "price-low":
        products.sort(
          (a, b) =>
            Number(a.price) -
            Number(b.price)
        );
        break;

      case "price-high":
        products.sort(
          (a, b) =>
            Number(b.price) -
            Number(a.price)
        );
        break;

      case "rating":
        products.sort(
          (a, b) =>
            Number(b.rating) -
            Number(a.rating)
        );
        break;

      case "sales":
        products.sort(
          (a, b) =>
            Number(b.sales) -
            Number(a.sales)
        );
        break;

      default:
        break;
    }

    this.filteredProducts =
      products;

    this.currentPage = 1;

    this.renderProducts();
  },

  getDateValue(product) {
    const value =
      product?.createdAt ||
      product?.created_at ||
      product?.date ||
      product?.updatedAt ||
      product?.updated_at;

    const time =
      Date.parse(value || "");

    return Number.isFinite(time)
      ? time
      : 0;
  },

  renderProducts() {
    const grid =
      document.querySelector(
        "[data-category-product-grid]"
      );

    const loading =
      document.querySelector(
        "[data-category-loading]"
      );

    const empty =
      document.querySelector(
        "[data-category-empty]"
      );

    const count =
      document.querySelector(
        "[data-category-count]"
      );

    if (loading) {
      loading.hidden =
        true;
    }

    if (count) {
      count.textContent =
        `${UTILS.formatNumber(
          this.filteredProducts.length
        )} منتج`;

      count.hidden =
        false;
    }

    if (!grid) {
      return;
    }

    grid.innerHTML =
      "";

    if (
      !this.filteredProducts.length
    ) {
      if (empty) {
        empty.hidden =
          false;
      }

      this.renderPagination(
        0
      );

      return;
    }

    if (empty) {
      empty.hidden =
        true;
    }

    const start =
      (this.currentPage - 1) *
      this.pageSize;

    const end =
      start +
      this.pageSize;

    const pageProducts =
      this.filteredProducts.slice(
        start,
        end
      );

    const fragment =
      document.createDocumentFragment();

    pageProducts.forEach(
      (product) => {
        if (
          typeof PRODUCT_CARD ===
            "undefined" ||
          typeof PRODUCT_CARD.create !==
            "function"
        ) {
          return;
        }

        const card =
          PRODUCT_CARD.create(
            product
          );

        if (card) {
          fragment.appendChild(
            card
          );
        }
      }
    );

    grid.appendChild(
      fragment
    );

    this.renderPagination(
      Math.ceil(
        this.filteredProducts.length /
          this.pageSize
      )
    );
  },

  renderPagination(
    totalPages
  ) {
    const container =
      document.querySelector(
        "[data-pagination-container]"
      );

    if (!container) {
      return;
    }

    container.innerHTML =
      "";

    if (
      !totalPages ||
      totalPages <= 1
    ) {
      return;
    }

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

      onChange:
        (page) => {
          this.currentPage =
            page;

          this.renderProducts();

          SCROLL.top();
        }
    });
  },

  toggleFilters() {
    const container =
      document.querySelector(
        "[data-category-filters-container]"
      );

    if (!container) {
      return;
    }

    container.style.display =
      container.style.display ===
      "block"
        ? ""
        : "block";
  },

  showLoading() {
    const loading =
      document.querySelector(
        "[data-category-loading]"
      );

    const grid =
      document.querySelector(
        "[data-category-product-grid]"
      );

    const empty =
      document.querySelector(
        "[data-category-empty]"
      );

    if (loading) {
      loading.hidden =
        false;
    }

    if (grid) {
      grid.innerHTML =
        "";
    }

    if (empty) {
      empty.hidden =
        true;
    }
  }
};

document.addEventListener(
  "DOMContentLoaded",
  () => {
    CATEGORY_PAGE.init();
  }
);
