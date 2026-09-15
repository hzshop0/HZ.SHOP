const PRODUCT_GRID = {
  init(products = []) {
    this.render(products);
  },

  render(products = []) {
    const grid = document.getElementById("productGrid");

    if (!grid) return;

    grid.innerHTML = "";

    if (!Array.isArray(products) || products.length === 0) {
      this.showEmpty();
      return;
    }

    const fragment = document.createDocumentFragment();

    products.forEach((product) => {
      if (
        typeof PRODUCT_CARD === "undefined" ||
        typeof PRODUCT_CARD.create !== "function"
      ) {
        return;
      }

      const card = PRODUCT_CARD.create(product);

      if (card) {
        fragment.appendChild(card);
      }
    });

    grid.appendChild(fragment);
  },

  append(products = []) {
    const grid = document.getElementById("productGrid");

    if (!grid || !Array.isArray(products)) {
      return;
    }

    const fragment = document.createDocumentFragment();

    products.forEach((product) => {
      if (
        typeof PRODUCT_CARD === "undefined" ||
        typeof PRODUCT_CARD.create !== "function"
      ) {
        return;
      }

      const card = PRODUCT_CARD.create(product);

      if (card) {
        fragment.appendChild(card);
      }
    });

    grid.appendChild(fragment);
  },

  clear() {
    const grid = document.getElementById("productGrid");

    if (!grid) return;

    grid.innerHTML = "";
  },

  showLoading() {
    const grid = document.getElementById("productGrid");

    if (!grid) return;

    grid.innerHTML = `
      <div class="product-grid-loading">
        جاري تحميل المنتجات...
      </div>
    `;
  },

  showEmpty() {
    const grid = document.getElementById("productGrid");

    if (!grid) return;

    grid.innerHTML = `
      <div class="product-grid-empty">
        لا توجد منتجات حالياً.
      </div>
    `;
  }
};
