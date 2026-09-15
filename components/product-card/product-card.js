const PRODUCT_CARD = {
  create(product = {}) {
    const template = document.querySelector(
      "#productCardTemplate"
    );

    if (!template) {
      return null;
    }

    const card = template.content
      .firstElementChild
      .cloneNode(true);

    this.update(card, product);

    return card;
  },

  update(card, product = {}) {
    if (!card) return;

    const id = product.id ?? product.productId ?? "";

    card.dataset.productId = id;

    const link = card.querySelector(
      ".product-card-link"
    );

    const image = card.querySelector(
      ".product-card-img"
    );

    const title = card.querySelector(
      ".product-card-title"
    );

    const currentPrice = card.querySelector(
      ".product-card-current-price"
    );

    const oldPrice = card.querySelector(
      ".product-card-old-price"
    );

    const discount = card.querySelector(
      ".product-card-discount"
    );

    const rating = card.querySelector(
      ".product-card-rating-value"
    );

    const sales = card.querySelector(
      ".product-card-sales"
    );

    if (link && id) {
      link.href =
        `/pages/product/?id=${encodeURIComponent(id)}`;
    }

    if (image) {
      image.src = product.image || "";
      image.alt = product.name || "HZ.shop product";
    }

    if (title) {
      title.textContent = product.name || "";
    }

    if (currentPrice) {
      currentPrice.textContent =
        UTILS.formatPrice(product.price);
    }

    if (oldPrice) {
      const oldValue = Number(product.oldPrice);

      if (
        Number.isFinite(oldValue) &&
        oldValue > Number(product.price)
      ) {
        oldPrice.textContent =
          UTILS.formatPrice(oldValue);

        oldPrice.hidden = false;
      } else {
        oldPrice.hidden = true;
      }
    }

    if (discount) {
      const discountValue =
        Number(product.discount);

      if (
        Number.isFinite(discountValue) &&
        discountValue > 0
      ) {
        discount.textContent =
          `-${discountValue}%`;

        discount.hidden = false;
      } else {
        discount.hidden = true;
      }
    }

    if (rating) {
      const value = Number(product.rating);

      rating.textContent =
        Number.isFinite(value)
          ? value.toFixed(1)
          : "";
    }

    if (sales) {
      const value = Number(product.sales);

      if (
        Number.isFinite(value) &&
        value > 0
      ) {
        sales.textContent =
          `${UTILS.formatNumber(value)} مبيع`;

        sales.hidden = false;
      } else {
        sales.hidden = true;
      }
    }

    this.bind(card, product);
  },

  bind(card, product = {}) {
    const wishlistButton =
      card.querySelector(
        ".product-card-wishlist"
      );

    const cartButton =
      card.querySelector(
        ".product-card-cart"
      );

    if (wishlistButton) {
      wishlistButton.addEventListener(
        "click",
        (event) => {
          event.preventDefault();
          event.stopPropagation();

          if (
            typeof WISHLIST !== "undefined" &&
            typeof WISHLIST.toggle === "function"
          ) {
            WISHLIST.toggle(product);
          }
        }
      );
    }

    if (cartButton) {
      cartButton.addEventListener(
        "click",
        (event) => {
          event.preventDefault();
          event.stopPropagation();

          if (
            typeof CART !== "undefined" &&
            typeof CART.add === "function"
          ) {
            CART.add(product);
          }
        }
      );
    }
  }
};
