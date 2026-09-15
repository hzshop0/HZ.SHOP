const WISHLIST_API = {
  async get() {
    return API.get(
      `/api/wishlist?t=${Date.now()}`
    );
  },

  async add(productId) {
    if (
      productId === undefined ||
      productId === null ||
      productId === ""
    ) {
      throw new Error(
        "Product ID is required"
      );
    }

    return API.post(
      "/api/wishlist",
      {
        productId
      }
    );
  },

  async remove(productId) {
    if (
      productId === undefined ||
      productId === null ||
      productId === ""
    ) {
      throw new Error(
        "Product ID is required"
      );
    }

    return API.delete(
      `/api/wishlist/${encodeURIComponent(
        productId
      )}`
    );
  },

  async clear() {
    return API.delete(
      "/api/wishlist"
    );
  },

  async check(productId) {
    if (
      productId === undefined ||
      productId === null ||
      productId === ""
    ) {
      return false;
    }

    try {
      const data =
        await API.get(
          `/api/wishlist/${encodeURIComponent(
            productId
          )}?t=${Date.now()}`
        );

      return Boolean(
        data?.exists ??
        data?.isFavorite ??
        data?.inWishlist ??
        false
      );
    } catch {
      return false;
    }
  },

  normalize(data) {
    const items =
      Array.isArray(data)
        ? data
        : Array.isArray(data?.items)
          ? data.items
          : Array.isArray(data?.wishlist)
            ? data.wishlist
            : Array.isArray(data?.data)
              ? data.data
              : [];

    return items
      .map(item => {
        if (
          item &&
          typeof item === "object"
        ) {
          return (
            item.productId ??
            item.product_id ??
            item.id ??
            item.product?.id ??
            ""
          );
        }

        return item;
      })
      .filter(
        id =>
          id !== undefined &&
          id !== null &&
          id !== ""
      );
  }
};
