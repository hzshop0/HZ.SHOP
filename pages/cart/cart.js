const CART_PAGE = {
  items: [],
  discountRate: 0,

  init() {
    const checkoutButton =
      document.querySelector(
        "[data-cart-checkout]"
      );

    if (checkoutButton) {
      checkoutButton.addEventListener(
        "click",
        () => {
          this.goToCheckout();
        }
      );
    }

    this.load();
  },

  load() {
    this.showLoading();

    try {
      this.items =
        this.getCartItems();

      this.discountRate =
        this.getDiscountRate();

      this.render();

    } catch (error) {
      console.error(
        "Cart page error:",
        error
      );

      this.items = [];
      this.render();
    }
  },

  getCartItems() {
    if (
      typeof HZCart !==
        "undefined" &&
      Array.isArray(HZCart.items)
    ) {
      return HZCart.items;
    }

    const stored =
      STORAGE.get(
        "hz_cart",
        []
      );

    return Array.isArray(stored)
      ? stored
      : [];
  },

  getDiscountRate() {
    const value =
      STORAGE.get(
        "hz_discount_rate",
        0
      );

    const rate =
      Number(value);

    return Number.isFinite(rate)
      ? Math.max(
          0,
          Math.min(100, rate)
        )
      : 0;
  },

  normalizeItem(item = {}) {
    const product =
      item.product ||
      item;

    const id =
      item.id ??
      item.productId ??
      product.id ??
      product.productId ??
      "";

    const quantity =
      Math.max(
        1,
        Number(
          item.quantity ??
          item.qty ??
          1
        ) || 1
      );

    const price =
      Number(
        item.price ??
        product.price ??
        0
      ) || 0;

    return {
      ...item,

      id,
      productId: id,

      name:
        item.name ||
        product.name ||
        product.title ||
        "",

      image:
        item.image ||
        product.image ||
        product.imageUrl ||
        "",

      price,
      quantity,

      total:
        price * quantity
    };
  },

  getNormalizedItems() {
    return this.items
      .map(
        (item) =>
          this.normalizeItem(
            item
          )
      )
      .filter(
        (item) =>
          item.id !== ""
      );
  },

  calculate() {
    const items =
      this.getNormalizedItems();

    const subtotal =
      items.reduce(
        (sum, item) =>
          sum + item.total,
        0
      );

    const discount =
      subtotal >= 50 &&
      this.discountRate > 0
        ? subtotal *
          (this.discountRate /
            100)
        : 0;

    let configuredDeliveryFee =
      4;

    if (
      typeof APP_CONSTANTS !==
      "undefined" &&
      APP_CONSTANTS &&
      APP_CONSTANTS.DELIVERY_FEE != null
    ) {
      configuredDeliveryFee =
        APP_CONSTANTS.DELIVERY_FEE;
    } else if (
      typeof STORE_CONFIG !==
      "undefined" &&
      STORE_CONFIG &&
      STORE_CONFIG.deliveryFee != null
    ) {
      configuredDeliveryFee =
        STORE_CONFIG.deliveryFee;
    }

    const deliveryFee =
      items.length > 0
        ? Number(
            configuredDeliveryFee
          ) || 4
        : 0;

    const total =
      Math.max(
        0,
        subtotal -
          discount +
          deliveryFee
      );

    return {
      items,
      subtotal,
      discount,
      deliveryFee,
      total
    };
  },

  render() {
    const summary =
      this.calculate();

    this.renderItems(
      summary.items
    );

    this.renderSummary(
      summary
    );

    this.updateState(
      summary
    );

    this.showContent(
      summary.items.length > 0
    );
  },

  renderItems(items) {
    const container =
      document.querySelector(
        "[data-cart-items]"
      );

    if (!container) {
      return;
    }

    container.innerHTML =
      "";

    const fragment =
      document.createDocumentFragment();

    items.forEach(
      (item) => {
        if (
          typeof CART_ITEM ===
            "undefined" ||
          typeof CART_ITEM.create !==
            "function"
        ) {
          return;
        }

        const element =
          CART_ITEM.create(
            item
          );

        if (!element) {
          return;
        }

        this.bindItemActions(
          element,
          item
        );

        fragment.appendChild(
          element
        );
      }
    );

    container.appendChild(
      fragment
    );
  },

  bindItemActions(
    element,
    item
  ) {
    const decrease =
      element.querySelector(
        ".cart-item-decrease"
      );

    const increase =
      element.querySelector(
        ".cart-item-increase"
      );

    const remove =
      element.querySelector(
        ".cart-item-remove"
      );

    if (decrease) {
      decrease.onclick = (
        event
      ) => {
        event.preventDefault();

        this.updateQuantity(
          item.id,
          item.quantity - 1
        );
      };
    }

    if (increase) {
      increase.onclick = (
        event
      ) => {
        event.preventDefault();

        this.updateQuantity(
          item.id,
          item.quantity + 1
        );
      };
    }

    if (remove) {
      remove.onclick = (
        event
      ) => {
        event.preventDefault();

        this.remove(
          item.id
        );
      };
    }
  },

  updateQuantity(
    id,
    quantity
  ) {
    const target =
      Math.max(
        1,
        Number(quantity) || 1
      );

    if (
      typeof HZCart !==
        "undefined" &&
      typeof HZCart.update ===
        "function"
    ) {
      HZCart.update(
        id,
        target
      );

      this.load();
      return;
    }

    this.items =
      this.getNormalizedItems()
        .map(
          (item) =>
            String(item.id) ===
            String(id)
              ? {
                  ...item,
                  quantity:
                    target
                }
              : item
        );

    this.saveLocalCart();
    this.load();
  },

  remove(id) {
    if (
      typeof HZCart !==
        "undefined" &&
      typeof HZCart.remove ===
        "function"
    ) {
      HZCart.remove(id);

      this.load();
      return;
    }

    this.items =
      this.getNormalizedItems()
        .filter(
          (item) =>
            String(item.id) !==
            String(id)
        );

    this.saveLocalCart();
    this.load();
  },

  saveLocalCart() {
    STORAGE.set(
      "hz_cart",
      this.items
    );
  },

  renderSummary(
    summary
  ) {
    const subtotal =
      document.querySelector(
        "[data-cart-subtotal]"
      );

    const delivery =
      document.querySelector(
        "[data-cart-delivery]"
      );

    const discountRow =
      document.querySelector(
        "[data-cart-discount-row]"
      );

    const discount =
      document.querySelector(
        "[data-cart-discount]"
      );

    const total =
      document.querySelector(
        "[data-cart-total]"
      );

    const count =
      document.querySelector(
        "[data-cart-page-count]"
      );

    if (subtotal) {
      subtotal.textContent =
        UTILS.formatPrice(
          summary.subtotal
        );
    }

    if (delivery) {
      delivery.textContent =
        UTILS.formatPrice(
          summary.deliveryFee
        );
    }

    if (discount) {
      discount.textContent =
        `-${UTILS.formatPrice(
          summary.discount
        )}`;
    }

    if (discountRow) {
      discountRow.hidden =
        summary.discount <= 0;
    }

    if (total) {
      total.textContent =
        UTILS.formatPrice(
          summary.total
        );
    }

    if (count) {
      const quantity =
        summary.items.reduce(
          (sum, item) =>
            sum + item.quantity,
          0
        );

      count.textContent =
        `${UTILS.formatNumber(
          quantity
        )} منتج`;

      count.hidden =
        quantity <= 0;
    }

    const checkout =
      document.querySelector(
        "[data-cart-checkout]"
      );

    if (checkout) {
      checkout.disabled =
        summary.items.length ===
        0;
    }
  },

  updateState(summary) {
    if (
      typeof APP_STATE ===
      "undefined"
    ) {
      return;
    }

    const count =
      summary.items.reduce(
        (sum, item) =>
          sum + item.quantity,
        0
      );

    APP_STATE.cart = {
      items:
        summary.items,
      count,
      subtotal:
        summary.subtotal,
      deliveryFee:
        summary.deliveryFee,
      total:
        summary.total
    };

    if (
      typeof HEADER !==
        "undefined" &&
      typeof HEADER.updateCartCount ===
        "function"
    ) {
      HEADER.updateCartCount(
        count
      );
    }
  },

  showLoading() {
    const loading =
      document.querySelector(
        "[data-cart-loading]"
      );

    const items =
      document.querySelector(
        "[data-cart-items]"
      );

    const empty =
      document.querySelector(
        "[data-cart-empty]"
      );

    if (loading) {
      loading.hidden =
        false;
    }

    if (items) {
      items.innerHTML =
        "";
    }

    if (empty) {
      empty.hidden =
        true;
    }
  },

  showContent(
    hasItems
  ) {
    const loading =
      document.querySelector(
        "[data-cart-loading]"
      );

    const items =
      document.querySelector(
        "[data-cart-items]"
      );

    const empty =
      document.querySelector(
        "[data-cart-empty]"
      );

    if (loading) {
      loading.hidden =
        true;
    }

    if (items) {
      items.hidden =
        !hasItems;
    }

    if (empty) {
      empty.hidden =
        hasItems;
    }
  },

  goToCheckout() {
    if (!this.items.length) {
      return;
    }

    if (
      typeof NAVIGATION !==
        "undefined" &&
      typeof NAVIGATION.checkout ===
        "function"
    ) {
      NAVIGATION.checkout();
      return;
    }

    window.location.href =
      "/pages/checkout/";
  }
};


window.CART_PAGE =
  CART_PAGE;


document.addEventListener(
  "DOMContentLoaded",
  () => {
    CART_PAGE.init();
  }
);
