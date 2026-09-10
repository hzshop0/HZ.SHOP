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
    return HZ.getCartCount() > 0
      ? HZ.DELIVERY_FEE
      : 0;
  };

  /* ---------------------------------
     Discount
     --------------------------------- */

  HZ.getDiscount = (coupon = "") => {
    const code = String(coupon ?? "")
      .trim()
      .toUpperCase();

    if (
      code === "HZ10" &&
      HZ.getCartCount() > 0
    ) {
      return HZ.getCartSubtotal() *
        HZ.DISCOUNT_RATE;
    }

    return 0;
  };

  /* ---------------------------------
     Totals
     --------------------------------- */

  HZ.getCheckoutTotals = (
    coupon = ""
  ) => {
    const subtotal =
      HZ.getCartSubtotal();

    const discount =
      HZ.getDiscount(coupon);

    const delivery =
      HZ.getDeliveryFee();

    const total = Math.max(
      0,
      subtotal - discount + delivery
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

  HZ.validateCoupon = (coupon = "") => {
    const code = String(coupon ?? "")
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
        message: "Coupon applied successfully."
      };
    }

    return {
      valid: false,
      code,
      discount: 0,
      message: "Invalid coupon code."
    };
  };

  /* ---------------------------------
     Build order payload
     --------------------------------- */

  HZ.buildOrderPayload = (
    customer = null,
    checkoutData = {}
  ) => {
    const coupon =
      checkoutData.coupon || "";

    const totals =
      HZ.getCheckoutTotals(coupon);

    return {
      customer,
      items: HZ.cart.map(item => ({
        id: item.id,
        name: item.name,
        price: HZ.toNumber(item.price, 0),
        quantity: Math.max(
          1,
          Math.floor(
            HZ.toNumber(item.quantity, 1)
          )
        )
      })),

      recipient:
        checkoutData.recipient || "",

      phone:
        checkoutData.phone || "",

      address:
        checkoutData.address || "",

      city:
        checkoutData.city || "",

      notes:
        checkoutData.notes || "",

      payment:
        checkoutData.payment ||
        "الدفع عند الاستلام",

      coupon:
        String(coupon)
          .trim()
          .toUpperCase(),

      discount:
        totals.discount,

      delivery_fee:
        totals.delivery,

      subtotal:
        totals.subtotal,

      total:
        totals.total
    };
  };

  /* ---------------------------------
     Submit order
     --------------------------------- */

  HZ.submitOrder = async (
    customer,
    checkoutData = {}
  ) => {
    if (!HZ.cart.length) {
      throw new Error(
        "Cart is empty."
      );
    }

    const payload =
      HZ.buildOrderPayload(
        customer,
        checkoutData
      );

    return HZ.apiPost(
      "/orders",
      payload
    );
  };

})();
