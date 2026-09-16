const CHECKOUT_PAGE = {
  items: [],
  discountRate: 0,

  init() {
    const submitButton =
      document.querySelector(
        "[data-checkout-submit]"
      );

    if (submitButton) {
      submitButton.addEventListener(
        "click",
        () => this.submit()
      );
    }

    this.load();
  },

  load() {
    this.items =
      this.getCartItems();

    this.discountRate =
      this.getDiscountRate();

    if (!this.items.length) {
      this.showEmptyCart();
      return;
    }

    this.renderSummary();
    this.loadCustomerData();
  },

  getCartItems() {
    if (
      typeof HZCart !== "undefined" &&
      Array.isArray(HZCart.items)
    ) {
      return HZCart.items
        .map(item =>
          this.normalizeItem(item)
        )
        .filter(
          item =>
            item.id !== ""
        );
    }

    const stored =
      typeof STORAGE !== "undefined"
        ? STORAGE.get(
            "hz_cart",
            []
          )
        : [];

    return Array.isArray(stored)
      ? stored
          .map(item =>
            this.normalizeItem(item)
          )
          .filter(
            item =>
              item.id !== ""
          )
      : [];
  },

  normalizeItem(item = {}) {
    const product =
      item.product || item;

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

      price,
      quantity,

      total:
        price * quantity
    };
  },

  getDiscountRate() {
    const value =
      typeof STORAGE !== "undefined"
        ? STORAGE.get(
            "hz_discount_rate",
            0
          )
        : 0;

    const rate =
      Number(value);

    return Number.isFinite(rate)
      ? Math.max(
          0,
          Math.min(100, rate)
        )
      : 0;
  },

  calculate() {
    const subtotal =
      this.items.reduce(
        (sum, item) =>
          sum + item.total,
        0
      );

    const discount =
      subtotal >= 50 &&
      this.discountRate > 0
        ? subtotal *
          (this.discountRate / 100)
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
    }

    const deliveryFee =
      this.items.length > 0
        ? Number(
            configuredDeliveryFee
          ) || 4
        : 0;

    return {
      subtotal,
      discount,
      deliveryFee,
      total:
        Math.max(
          0,
          subtotal -
            discount +
            deliveryFee
        )
    };
  },

  renderSummary() {
    const summary =
      this.calculate();

    const itemsContainer =
      document.querySelector(
        "[data-checkout-items]"
      );

    if (itemsContainer) {
      itemsContainer.innerHTML =
        "";

      this.items.forEach(
        item => {
          const element =
            document.createElement(
              "div"
            );

          element.className =
            "checkout-item";

          element.innerHTML = `
            <span class="checkout-item-name">
              ${this.escapeHTML(
                item.name
              )}
            </span>

            <span class="checkout-item-quantity">
              ×${item.quantity}
            </span>

            <span class="checkout-item-price">
              ${this.formatPrice(
                item.total
              )}
            </span>
          `;

          itemsContainer.appendChild(
            element
          );
        }
      );
    }

    const subtotal =
      document.querySelector(
        "[data-checkout-subtotal]"
      );

    const delivery =
      document.querySelector(
        "[data-checkout-delivery]"
      );

    const discountRow =
      document.querySelector(
        "[data-checkout-discount-row]"
      );

    const discount =
      document.querySelector(
        "[data-checkout-discount]"
      );

    const total =
      document.querySelector(
        "[data-checkout-total]"
      );

    if (subtotal) {
      subtotal.textContent =
        this.formatPrice(
          summary.subtotal
        );
    }

    if (delivery) {
      delivery.textContent =
        this.formatPrice(
          summary.deliveryFee
        );
    }

    if (discount) {
      discount.textContent =
        `-${this.formatPrice(
          summary.discount
        )}`;
    }

    if (discountRow) {
      discountRow.hidden =
        summary.discount <= 0;
    }

    if (total) {
      total.textContent =
        this.formatPrice(
          summary.total
        );
    }
  },

  loadCustomerData() {
    const customer =
      typeof APP_STATE !==
        "undefined"
        ? APP_STATE.customer
        : null;

    if (!customer) {
      return;
    }

    const name =
      document.getElementById(
        "checkoutName"
      );

    const phone =
      document.getElementById(
        "checkoutPhone"
      );

    const email =
      document.getElementById(
        "checkoutEmail"
      );

    if (
      name &&
      !name.value
    ) {
      name.value =
        customer.name ||
        customer.fullName ||
        "";
    }

    if (
      phone &&
      !phone.value
    ) {
      phone.value =
        customer.phone ||
        "";
    }

    if (
      email &&
      !email.value
    ) {
      email.value =
        customer.email ||
        "";
    }
  },

  getFormData() {
    return {
      name:
        this.getValue(
          "checkoutName"
        ),

      phone:
        this.getValue(
          "checkoutPhone"
        ),

      email:
        this.getValue(
          "checkoutEmail"
        ),

      city:
        this.getValue(
          "checkoutCity"
        ),

      address:
        this.getValue(
          "checkoutAddress"
        ),

      notes:
        this.getValue(
          "checkoutNotes"
        ),

      payment:
        document.querySelector(
          'input[name="payment"]:checked'
        )?.value ||
        "cod"
    };
  },

  validate(data) {
    if (!data.name) {
      return "يرجى إدخال الاسم الكامل.";
    }

    if (!data.phone) {
      return "يرجى إدخال رقم الهاتف.";
    }

    if (!data.city) {
      return "يرجى إدخال المدينة.";
    }

    if (!data.address) {
      return "يرجى إدخال العنوان.";
    }

    if (!this.items.length) {
      return "السلة فارغة.";
    }

    return "";
  },

  async submit() {
    const button =
      document.querySelector(
        "[data-checkout-submit]"
      );

    const data =
      this.getFormData();

    const validation =
      this.validate(data);

    if (validation) {
      this.showError(
        validation
      );

      return;
    }

    this.clearError();

    if (button) {
      button.disabled = true;

      button.textContent =
        "جاري إرسال الطلب...";
    }

    try {
      const summary =
        this.calculate();

      const order = {
        customer: data,

        items:
          this.items.map(
            item => ({
              id: item.id,

              productId:
                item.productId,

              name:
                item.name,

              price:
                item.price,

              quantity:
                item.quantity,

              total:
                item.total
            })
          ),

        subtotal:
          summary.subtotal,

        discount:
          summary.discount,

        deliveryFee:
          summary.deliveryFee,

        total:
          summary.total,

        paymentMethod:
          data.payment,

        createdAt:
          new Date().toISOString()
      };

      const response =
        await fetch(
          "/api/orders",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json"
            },

            body:
              JSON.stringify(
                order
              )
          }
        );

      if (!response.ok) {
        throw new Error(
          `Order request failed: ${response.status}`
        );
      }

      const result =
        await response.json();

      this.handleSuccess(
        result,
        order
      );

    } catch (error) {
      console.error(
        "Checkout error:",
        error
      );

      this.showError(
        "تعذر إرسال الطلب حالياً. يرجى المحاولة مرة أخرى."
      );

      if (button) {
        button.disabled =
          false;

        button.textContent =
          "تأكيد الطلب";
      }
    }
  },

  handleSuccess(
    result,
    order
  ) {
    if (
      typeof STORAGE !==
      "undefined"
    ) {
      STORAGE.set(
        "hz_last_order",
        {
          ...order,
          result
        }
      );

      STORAGE.remove(
        "hz_cart"
      );
    }

    if (
      typeof HZCart !==
        "undefined" &&
      typeof HZCart.clear ===
        "function"
    ) {
      HZCart.clear();
    }

    if (
      typeof TOAST !==
        "undefined"
    ) {
      TOAST.success(
        "تم إرسال طلبك بنجاح"
      );
    }

    const orderId =
      result?.orderId ??
      result?.id ??
      result?.order?.id;

    if (
      typeof NAVIGATION !==
        "undefined" &&
      typeof NAVIGATION.orders ===
        "function"
    ) {
      setTimeout(
        () => {
          NAVIGATION.orders();
        },
        900
      );

      return;
    }

    if (orderId) {
      setTimeout(
        () => {
          window.location.href =
            `/pages/orders/?id=${encodeURIComponent(
              orderId
            )}`;
        },
        900
      );

      return;
    }

    setTimeout(
      () => {
        window.location.href =
          "/pages/orders/";
      },
      900
    );
  },

  showEmptyCart() {
    this.showError(
      "السلة فارغة. أضف منتجات قبل إتمام الطلب."
    );

    const button =
      document.querySelector(
        "[data-checkout-submit]"
      );

    if (button) {
      button.disabled =
        true;
    }
  },

  showError(message) {
    const element =
      document.querySelector(
        "[data-checkout-error]"
      );

    if (!element) {
      return;
    }

    element.textContent =
      message || "";

    element.hidden =
      !message;

    if (message) {
      element.scrollIntoView({
        behavior: "smooth",
        block: "center"
      });
    }
  },

  clearError() {
    const element =
      document.querySelector(
        "[data-checkout-error]"
      );

    if (!element) {
      return;
    }

    element.textContent =
      "";

    element.hidden =
      true;
  },

  getValue(id) {
    const element =
      document.getElementById(id);

    return element
      ? element.value.trim()
      : "";
  },

  formatPrice(value) {
    const number =
      Number(value);

    return Number.isFinite(
      number
    )
      ? `$${number.toFixed(2)}`
      : "$0.00";
  },

  escapeHTML(value = "") {
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


window.CHECKOUT_PAGE =
  CHECKOUT_PAGE;


document.addEventListener(
  "DOMContentLoaded",
  () => {
    CHECKOUT_PAGE.init();
  }
);
