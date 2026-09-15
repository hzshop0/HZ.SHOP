const COUPONS_API = {
  async validate(code, subtotal = 0) {
    const value =
      String(code || "").trim();

    if (!value) {
      throw new Error(
        "Coupon code is required"
      );
    }

    return API.post(
      "/api/coupons/validate",
      {
        code: value,
        subtotal:
          Number(subtotal) || 0
      }
    );
  },

  async getAvailable() {
    return API.get(
      `/api/coupons?t=${Date.now()}`
    );
  },

  normalize(coupon = {}) {
    return {
      id:
        coupon.id ??
        coupon.couponId ??
        coupon.code ??
        "",

      code:
        coupon.code ??
        "",

      name:
        coupon.name ??
        coupon.title ??
        coupon.code ??
        "",

      description:
        coupon.description ??
        "",

      discountType:
        coupon.discountType ??
        coupon.discount_type ??
        "percentage",

      discountValue:
        Number(
          coupon.discountValue ??
          coupon.discount_value ??
          coupon.discountRate ??
          coupon.discount_rate ??
          0
        ),

      minimumSubtotal:
        Number(
          coupon.minimumSubtotal ??
          coupon.minimum_subtotal ??
          coupon.minSubtotal ??
          coupon.min_subtotal ??
          0
        ),

      maximumDiscount:
        Number(
          coupon.maximumDiscount ??
          coupon.maximum_discount ??
          0
        ),

      active:
        coupon.active ??
        coupon.enabled ??
        true,

      expiresAt:
        coupon.expiresAt ??
        coupon.expires_at ??
        null,

      raw: coupon
    };
  },

  normalizeList(data) {
    const coupons =
      Array.isArray(data)
        ? data
        : Array.isArray(data?.coupons)
          ? data.coupons
          : Array.isArray(data?.data)
            ? data.data
            : [];

    return coupons.map(
      coupon =>
        this.normalize(coupon)
    );
  }
};
