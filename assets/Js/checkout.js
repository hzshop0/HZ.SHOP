/* =================================
   HZ.SHOP — Checkout
   Checkout helpers
   ================================= */
(() => {
  "use strict";
  window.HZ = window.HZ || {};
  HZ.DELIVERY_FEE = 4;
  HZ.DISCOUNT_RATE = 0.10;
  /* ---------------------------------
     Delivery
     --------------------------------- */
  HZ.getDeliveryFee = () => {
    const count =
      typeof HZ.getCartCount === "function"
        ? HZ.getCartCount()
        : (
            Array.isArray(HZ.cart)
              ? HZ.cart.reduce(
                  (sum, item) =>
                    sum +
                    Math.max(
                      0,
                      Math.floor(
                        HZ.toNumber(
                          item?.quantity,
                          0
                        )
                      )
                    ),
                  0
                )
              : 0
          );
    return count > 0
      ? HZ.DELIVERY_FEE
      : 0;
  };
  /* ---------------------------------
     Discount
     --------------------------------- */
  HZ.getDiscount = (
    coupon = ""
  ) => {
    const code =
      String(coupon ?? "")
        .trim()
        .toUpperCase();
    const storedRate =
      typeof localStorage !== "undefined"
        ? Number(
            localStorage.getItem(
              "hz_discount_rate"
            )
          )
        : 0;
    const rate =
      code === "HZ10"
        ? HZ.DISCOUNT_RATE
        : (
            !code &&
            Number.isFinite(storedRate) &&
            storedRate > 0
              ? storedRate
              : 0
          );
    const cart =
      Array.isArray(HZ.cart)
        ? HZ.cart
        : [];
    if (!cart.length || rate <= 0) {
      return 0;
    }
    return HZ.getCartSubtotal() * rate;
  };
  /* ---------------------------------
     Totals
     --------------------------------- */
  HZ.getCheckoutTotals = (
    coupon = ""
  ) => {
    const subtotal =
      typeof HZ.getCartSubtotal === "function"
        ? HZ.getCartSubtotal()
        : 0;
    const discount =
      HZ.getDiscount(coupon);
    const delivery =
      subtotal > 0
        ? HZ.DELIVERY_FEE
        : 0;
    const total =
      Math.max(
        0,
        subtotal -
          discount +
          delivery
      );
    return {
      subtotal,
      discount,
      delivery,
      total
    };
  };
  /* ---------------------------------
     Coupon validation
     --------------------------------- */
  HZ.validateCoupon = (
    coupon = ""
  ) => {
    const code =
      String(coupon ?? "")
        .trim()
        .toUpperCase();
    if (!code) {
      return {
        valid: false,
        code: "",
        discount: 0,
        message: ""
      };
    }
    if (code === "HZ10") {
      return {
        valid: true,
        code,
        discount:
          HZ.getDiscount(code),
        message:
          "Coupon applied successfully."
      };
    }
    return {
      valid: false,
      code,
      discount: 0,
      message:
        "Invalid coupon code."
    };
  };
  /* ---------------------------------
     Checkout
     --------------------------------- */
  HZ.checkout = () => {
    const cart =
      Array.isArray(HZ.cart)
        ? HZ.cart
        : [];
    if (!cart.length) {
      if (
        typeof HZ.toast === "function"
      ) {
        HZ.toast(
          "السلة فارغة"
        );
      }
      return false;
    }
    /* Meta Pixel — InitiateCheckout */
    if (
      typeof fbq === "function"
    ) {
      const subtotal =
        cart.reduce(
          (sum, item) =>
            sum +
            Number(item.price) *
              Number(item.quantity),
          0
        );
      const discountRate =
        Number(
          localStorage.getItem(
            "hz_discount_rate"
          )
        ) || 0;
      const discount =
        subtotal * discountRate;
      const delivery =
        subtotal > 0
          ? HZ.DELIVERY_FEE
          : 0;
      const total =
        Math.max(
          0,
          subtotal -
            discount +
            delivery
        );
      fbq(
        "track",
        "InitiateCheckout",
        {
          content_ids:
            cart.map(
              item =>
                String(item.id)
            ),
          content_type:
            "product",
          num_items:
            cart.reduce(
              (sum, item) =>
                sum +
                Number(
                  item.quantity
                ),
              0
            ),
          value:
            Number(
              total.toFixed(2)
            ),
          currency: "USD"
        }
      );
    }
    /*
     * Preserve current Index.html
     * navigation behavior.
     */
    window.location.href =
      "/cart.html";
    return true;
  };
  /* ---------------------------------
     Close checkout
     --------------------------------- */
  HZ.closeCheckout = () => {
    const modal =
      document.getElementById(
        "modal"
      );
    if (modal) {
      modal.classList.remove(
        "show"
      );
    }
    document.body.style.overflow =
      "";
  };
  /* ---------------------------------
     Render order summary
     --------------------------------- */
  HZ.renderCheckoutSummary = () => {
    const box =
      document.getElementById(
        "summary"
      );
    if (!box) {
      return;
    }
    const cart =
      Array.isArray(HZ.cart)
        ? HZ.cart
        : [];
    box.innerHTML = "";
    cart.forEach(item => {
      const row =
        document.createElement(
          "div"
        );
      row.className =
        "summary-row";
      const name =
        document.createElement(
          "span"
        );
      name.textContent =
        `${String(item.name || "")} × ${item.quantity}`;
      const price =
        document.createElement(
          "span"
        );
      price.textContent =
        "$" +
        (
          Number(item.price) *
          Number(item.quantity)
        ).toFixed(2);
      row.appendChild(name);
      row.appendChild(price);
      box.appendChild(row);
    });
    const couponInput =
      document.getElementById(
        "coupon"
      );
    const coupon =
      couponInput
        ? couponInput.value
        : "";
    const totals =
      HZ.getCheckoutTotals(
        coupon
      );
    const subtotalEl =
      document.getElementById(
        "summarySubtotal"
      );
    const discountEl =
      document.getElementById(
        "summaryDiscount"
      );
    const deliveryEl =
      document.getElementById(
        "summaryDelivery"
      );
    const totalEl =
      document.getElementById(
        "summaryTotal"
      );
    if (subtotalEl) {
      subtotalEl.textContent =
        "$" +
        totals.subtotal.toFixed(2);
    }
    if (discountEl) {
      discountEl.textContent =
        "-$" +
        totals.discount.toFixed(2);
    }
    if (deliveryEl) {
      deliveryEl.textContent =
        "$" +
        totals.delivery.toFixed(2);
    }
    if (totalEl) {
      totalEl.textContent =
        "$" +
        totals.total.toFixed(2);
    }
  };
  /* ---------------------------------
     Payment method
     --------------------------------- */
  HZ.selectPayment = (
    element,
    type
  ) => {
    document
      .querySelectorAll(".pay")
      .forEach(item =>
        item.classList.remove(
          "selected"
        )
      );
    if (element) {
      element.classList.add(
        "selected"
      );
    }
    HZ.selectedPayment =
      type;
  };
  /*
   * Current Index.html default
   * payment method.
   */
  if (!HZ.selectedPayment) {
    HZ.selectedPayment =
      "الدفع عند الاستلام";
  }
  /* ---------------------------------
     Build order payload
     --------------------------------- */
  HZ.buildOrderPayload = (
    customer = null,
    checkoutData = {}
  ) => {
    const cart =
      Array.isArray(HZ.cart)
        ? HZ.cart
        : [];
    const coupon =
      checkoutData.coupon || "";
    const totals =
      HZ.getCheckoutTotals(
        coupon
      );
    return {
      customer,
      customer_name:
        checkoutData.customer_name ||
        checkoutData.name ||
        "",
      phone:
        checkoutData.phone ||
        "",
      governorate:
        checkoutData.governorate ||
        "",
      area:
        checkoutData.area ||
        "",
      address:
        checkoutData.address ||
        "",
      notes:
        checkoutData.notes ||
        "",
      payment_method:
        checkoutData.payment_method ||
        checkoutData.payment ||
        HZ.selectedPayment ||
        "الدفع عند الاستلام",
      items:
        cart.map(item => ({
          id:
            Number(item.id),
          name:
            String(
              item.name || ""
            ),
          price:
            Number(item.price),
          quantity:
            Number(item.quantity)
        })),
      subtotal:
        Number(
          totals.subtotal.toFixed(2)
        ),
      discount:
        Number(
          totals.discount.toFixed(2)
        ),
      delivery_fee:
        Number(
          totals.delivery.toFixed(2)
        ),
      total:
        Number(
          totals.total.toFixed(2)
        )
    };
  };
  /* ---------------------------------
     Read order form
     --------------------------------- */
  HZ.getOrderData = () => {
    const getValue = id => {
      const element =
        document.getElementById(
          id
        );
      return element
        ? element.value.trim()
        : "";
    };
    const name =
      getValue(
        "customerName"
      );
    const phone =
      getValue(
        "phone"
      );
    const governorateEl =
      document.getElementById(
        "governorate"
      );
    const governorate =
      governorateEl
        ? governorateEl.value
        : "";
    const area =
      getValue(
        "area"
      );
    const address =
      getValue(
        "address"
      );
    const notes =
      getValue(
        "notes"
      );
    const cart =
      Array.isArray(HZ.cart)
        ? HZ.cart
        : [];
    const toast =
      typeof HZ.toast === "function"
        ? HZ.toast
        : (
            message =>
              console.warn(
                message
              )
          );
    if (!name) {
      toast(
        "أدخل الاسم الكامل"
      );
      return null;
    }
    if (!phone) {
      toast(
        "أدخل رقم الهاتف"
      );
      return null;
    }
    if (!governorate) {
      toast(
        "اختر المحافظة"
      );
      return null;
    }
    if (!area) {
      toast(
        "أدخل المنطقة"
      );
      return null;
    }
    if (!address) {
      toast(
        "أدخل العنوان بالتفصيل"
      );
      return null;
    }
    if (!cart.length) {
      toast(
        "السلة فارغة"
      );
      return null;
    }
    /* ---------------------------------
       Re-check products and stock
       before submitting the order
       --------------------------------- */
    const products =
      Array.isArray(HZ.products)
        ? HZ.products
        : [];
    for (
      const item of cart
    ) {
      const product =
        products.find(
          product =>
            product.id ===
            Number(item.id)
        );
      if (!product) {
        toast(
          "أحد المنتجات لم يعد متوفرًا"
        );
        return null;
      }
      if (
        Number(product.stock) <= 0 ||
        Number(item.quantity) >
          Number(product.stock)
      ) {
        toast(
          "الكمية المطلوبة من أحد المنتجات غير متوفرة"
        );
        return null;
      }
    }
    const subtotal =
      cart.reduce(
        (sum, item) =>
          sum +
          Number(item.price) *
            Number(item.quantity),
        0
      );
    const discountRate =
      Number(
        localStorage.getItem(
          "hz_discount_rate"
        )
      ) || 0;
    const discount =
      subtotal *
      discountRate;
    const delivery =
      subtotal > 0
        ? HZ.DELIVERY_FEE
        : 0;
    const total =
      Math.max(
        0,
        subtotal -
          discount +
          delivery
      );
    return {
      customer_name:
        name,
      phone:
        phone,
      governorate:
        governorate,
      area:
        area,
      address:
        address,
      notes:
        notes,
      payment_method:
        HZ.selectedPayment ||
        "الدفع عند الاستلام",
      items:
        cart.map(item => ({
          id:
            Number(item.id),
          name:
            String(item.name),
          price:
            Number(item.price),
          quantity:
            Number(item.quantity)
        })),
      subtotal:
        Number(
          subtotal.toFixed(2)
        ),
      discount:
        Number(
          discount.toFixed(2)
        ),
      delivery_fee:
        Number(
          delivery.toFixed(2)
        ),
      total:
        Number(
          total.toFixed(2)
        )
    };
  };
  /* ---------------------------------
     Submit order
     --------------------------------- */
  HZ.submitComputerOrder =
    async () => {
      const button =
        document.getElementById(
          "computerOrderButton"
        );
      const order =
        HZ.getOrderData();
      if (!order) {
        return false;
      }
      if (button) {
        button.disabled = true;
        button.textContent =
          "جاري إرسال الطلب...";
      }
      try {
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
        let result = null;
        try {
          result =
            await response.json();
        } catch (error) {
          result = null;
        }
        if (!response.ok) {
          throw new Error(
            result &&
            (
              result.message ||
              result.error
            )
              ? (
                  result.message ||
                  result.error
                )
              : "فشل إرسال الطلب"
          );
        }
        /* ---------------------------------
           Order number
           --------------------------------- */
        const orderNumber =
          result &&
          (
            result.order_number ||
            result.orderNumber ||
            result.id
          );
        /* ---------------------------------
           Meta Pixel — Purchase
           --------------------------------- */
        if (
          typeof fbq === "function"
        ) {
          fbq(
            "track",
            "Purchase",
            {
              content_ids:
                (
                  Array.isArray(
                    HZ.cart
                  )
                    ? HZ.cart
                    : []
                ).map(
                  item =>
                    String(item.id)
                ),
              content_type:
                "product",
              num_items:
                (
                  Array.isArray(
                    HZ.cart
                  )
                    ? HZ.cart
                    : []
                ).reduce(
                  (sum, item) =>
                    sum +
                    Number(
                      item.quantity
                    ),
                  0
                ),
              value:
                Number(
                  result &&
                  result.total != null
                    ? result.total
                    : order.total
                ),
              currency:
                "USD"
            }
          );
        }
        /* ---------------------------------
           Clear cart and discount
           --------------------------------- */
        HZ.cart = [];
        if (
          typeof HZ.saveCart ===
          "function"
        ) {
          HZ.saveCart();
        } else if (
          typeof localStorage !==
          "undefined"
        ) {
          localStorage.setItem(
            "hz_cart",
            "[]"
          );
        }
        if (
          typeof localStorage !==
          "undefined"
        ) {
          localStorage.setItem(
            "hz_discount_rate",
            "0"
          );
        }
        HZ.DISCOUNT_RATE = 0;
        if (
          typeof HZ.renderCart ===
          "function"
        ) {
          HZ.renderCart();
        }
        HZ.closeCheckout();
        const successOrderNumber =
          document.getElementById(
            "successOrderNumber"
          );
        if (successOrderNumber) {
          successOrderNumber.textContent =
            orderNumber
              ? "رقم الطلب: " +
                orderNumber
              : "تم تسجيل طلبك بنجاح";
        }
        const successModal =
          document.getElementById(
            "successModal"
          );
        if (successModal) {
          successModal.classList.add(
            "show"
          );
          document.body.style.overflow =
            "hidden";
        }
        return result;
      } catch (error) {
        console.error(
          "HZ.SHOP order error:",
          error
        );
        if (
          typeof HZ.toast ===
          "function"
        ) {
          HZ.toast(
            error.message ||
            "حدث خطأ أثناء إرسال الطلب"
          );
        }
        return false;
      } finally {
        if (button) {
          button.disabled =
            false;
          button.textContent =
            "✓ تأكيد الطلب";
        }
      }
    };
  /* ---------------------------------
     Success modal
     --------------------------------- */
  HZ.closeSuccess = () => {
    const modal =
      document.getElementById(
        "successModal"
      );
    if (modal) {
      modal.classList.remove(
        "show"
      );
    }
    document.body.style.overflow =
      "";
  };
  /* ---------------------------------
     Coupon UI
     --------------------------------- */
  HZ.applyCoupon = () => {
    const input =
      document.getElementById(
        "coupon"
      );
    if (!input) {
      return;
    }
    const code =
      input.value
        .trim()
        .toUpperCase();
    if (code === "HZ10") {
      HZ.DISCOUNT_RATE =
        0.10;
      localStorage.setItem(
        "hz_discount_rate",
        "0.10"
      );
      if (
        typeof HZ.toast ===
        "function"
      ) {
        HZ.toast(
          "تم تطبيق خصم 10%"
        );
      }
    } else {
      HZ.DISCOUNT_RATE =
        0;
      localStorage.setItem(
        "hz_discount_rate",
        "0"
      );
      if (
        typeof HZ.toast ===
        "function"
      ) {
        HZ.toast(
          "كود الخصم غير صحيح"
        );
      }
    }
    if (
      typeof HZ.renderCheckoutSummary ===
      "function"
    ) {
      HZ.renderCheckoutSummary();
    }
    if (
      typeof HZ.updateTotals ===
      "function"
    ) {
      HZ.updateTotals();
    }
  };
  /* ---------------------------------
     Legacy global compatibility
     --------------------------------- */
  window.checkout =
    HZ.checkout;
  window.closeCheckout =
    HZ.closeCheckout;
  window.renderSummary =
    HZ.renderCheckoutSummary;
  window.payment =
    HZ.selectPayment;
  window.getOrderData =
    HZ.getOrderData;
  window.submitComputerOrder =
    HZ.submitComputerOrder;
  window.closeSuccess =
    HZ.closeSuccess;
  window.applyCoupon =
    HZ.applyCoupon;
  /* ---------------------------------
     Keyboard / ESC
     --------------------------------- */
  document.addEventListener(
    "keydown",
    event => {
      if (
        event.key !== "Escape"
      ) {
        return;
      }
      if (
        typeof HZ.closeCart ===
        "function"
      ) {
        HZ.closeCart();
      }
      HZ.closeCheckout();
      if (
        typeof HZ.closeFavorites ===
        "function"
      ) {
        HZ.closeFavorites();
      }
      HZ.closeSuccess();
    }
  );
})();
