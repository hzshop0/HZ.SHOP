const PAGINATION = {
  currentPage: 1,
  totalPages: 1,
  onChange: null,

  init(options = {}) {
    this.currentPage =
      Math.max(
        1,
        Number(options.currentPage) || 1
      );

    this.totalPages =
      Math.max(
        1,
        Number(options.totalPages) || 1
      );

    this.onChange =
      typeof options.onChange ===
      "function"
        ? options.onChange
        : null;

    this.render();
  },

  render() {
    const template =
      document.querySelector(
        "#paginationTemplate"
      );

    if (!template) return;

    const existing =
      document.querySelector(
        ".store-pagination"
      );

    if (existing) {
      existing.remove();
    }

    const element =
      template.content
        .firstElementChild
        .cloneNode(true);

    const pagesContainer =
      element.querySelector(
        "[data-pagination-pages]"
      );

    const previous =
      element.querySelector(
        "[data-pagination-prev]"
      );

    const next =
      element.querySelector(
        "[data-pagination-next]"
      );

    if (pagesContainer) {
      this.renderPages(
        pagesContainer
      );
    }

    if (previous) {
      previous.disabled =
        this.currentPage <= 1;

      previous.addEventListener(
        "click",
        () => {
          this.go(
            this.currentPage - 1
          );
        }
      );
    }

    if (next) {
      next.disabled =
        this.currentPage >=
        this.totalPages;

      next.addEventListener(
        "click",
        () => {
          this.go(
            this.currentPage + 1
          );
        }
      );
    }

    const container =
      document.querySelector(
        "[data-pagination-container]"
      ) ||
      document.body;

    container.appendChild(element);
  },

  renderPages(container) {
    const pages =
      this.getPages();

    pages.forEach((page) => {
      if (page === "...") {
        const ellipsis =
          document.createElement(
            "span"
          );

        ellipsis.className =
          "pagination-ellipsis";

        ellipsis.textContent =
          "…";

        container.appendChild(
          ellipsis
        );

        return;
      }

      const button =
        document.createElement(
          "button"
        );

      button.type = "button";

      button.className =
        "pagination-page";

      button.textContent =
        page;

      if (
        page === this.currentPage
      ) {
        button.classList.add(
          "active"
        );

        button.setAttribute(
          "aria-current",
          "page"
        );
      }

      button.addEventListener(
        "click",
        () => {
          this.go(page);
        }
      );

      container.appendChild(
        button
      );
    });
  },

  getPages() {
    const total =
      this.totalPages;

    const current =
      this.currentPage;

    if (total <= 7) {
      return Array.from(
        { length: total },
        (_, index) => index + 1
      );
    }

    const pages = [1];

    if (current > 4) {
      pages.push("...");
    }

    const start =
      Math.max(2, current - 1);

    const end =
      Math.min(
        total - 1,
        current + 1
      );

    for (
      let page = start;
      page <= end;
      page++
    ) {
      pages.push(page);
    }

    if (current < total - 3) {
      pages.push("...");
    }

    pages.push(total);

    return pages;
  },

  go(page) {
    const target =
      Number(page);

    if (
      !Number.isFinite(target) ||
      target < 1 ||
      target > this.totalPages ||
      target === this.currentPage
    ) {
      return;
    }

    this.currentPage =
      target;

    this.render();

    if (this.onChange) {
      this.onChange(
        this.currentPage
      );
    }
  }
};
