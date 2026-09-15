const FILTERS = {
  state: {
    category: "",
    minPrice: "",
    maxPrice: "",
    sort: "default"
  },

  init(options = {}) {
    this.options = options;

    const resetButton =
      document.querySelector(
        "[data-filters-reset]"
      );

    const applyButton =
      document.querySelector(
        "[data-filters-apply]"
      );

    const sortSelect =
      document.querySelector(
        "[data-filter-sort]"
      );

    if (resetButton) {
      resetButton.addEventListener(
        "click",
        () => {
          this.reset();
        }
      );
    }

    if (applyButton) {
      applyButton.addEventListener(
        "click",
        () => {
          this.apply();
        }
      );
    }

    if (sortSelect) {
      sortSelect.addEventListener(
        "change",
        (event) => {
          this.state.sort =
            event.target.value;
        }
      );
    }
  },

  setCategories(categories = []) {
    const container =
      document.querySelector(
        '[data-filter="category"]'
      );

    if (!container) return;

    container.innerHTML = "";

    if (!Array.isArray(categories)) {
      return;
    }

    categories.forEach((category) => {
      const id =
        category.id ??
        category.categoryId ??
        "";

      const name =
        category.name || "";

      if (!id || !name) return;

      const label =
        document.createElement("label");

      label.className =
        "filter-option";

      label.innerHTML = `
        <input
          type="radio"
          name="category"
          value="${UTILS.escapeHTML(id)}"
        />

        <span>
          ${UTILS.escapeHTML(name)}
        </span>
      `;

      container.appendChild(label);
    });
  },

  read() {
    const category =
      document.querySelector(
        '[data-filter="category"] input:checked'
      );

    const minPrice =
      document.querySelector(
        "[data-price-min]"
      );

    const maxPrice =
      document.querySelector(
        "[data-price-max]"
      );

    const sort =
      document.querySelector(
        "[data-filter-sort]"
      );

    this.state.category =
      category?.value || "";

    this.state.minPrice =
      minPrice?.value || "";

    this.state.maxPrice =
      maxPrice?.value || "";

    this.state.sort =
      sort?.value || "default";

    return {
      ...this.state
    };
  },

  apply() {
    const filters =
      this.read();

    if (
      this.options &&
      typeof this.options.onApply ===
        "function"
    ) {
      this.options.onApply(filters);
    }
  },

  reset() {
    this.state = {
      category: "",
      minPrice: "",
      maxPrice: "",
      sort: "default"
    };

    const checked =
      document.querySelector(
        '[data-filter="category"] input:checked'
      );

    if (checked) {
      checked.checked = false;
    }

    const minPrice =
      document.querySelector(
        "[data-price-min]"
      );

    const maxPrice =
      document.querySelector(
        "[data-price-max]"
      );

    const sort =
      document.querySelector(
        "[data-filter-sort]"
      );

    if (minPrice) {
      minPrice.value = "";
    }

    if (maxPrice) {
      maxPrice.value = "";
    }

    if (sort) {
      sort.value = "default";
    }

    if (
      this.options &&
      typeof this.options.onApply ===
        "function"
    ) {
      this.options.onApply({
        ...this.state
      });
    }
  },

  getState() {
    return {
      ...this.state
    };
  }
};
