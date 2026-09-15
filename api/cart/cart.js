const CART_API = {
  async get() {
    return API.get(
      `/api/cart?t=${Date.now()}`
    );
  },

  async add(productId, quantity = 1) {
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
      "/api/cart",
      {
        productId,
        quantity: Math.max(
          1,
          Number(quantity) || 1
        )
      }
    );
  },

  async update(
    productId,
    quantity
  ) {
    if (
      productId === undefined ||
      productId === null ||
      productId === ""
    ) {
      throw new Error(
        "Product ID is required"
      );
    }

    return API.put(
      `/api/cart/${encodeURIComponent(
        productId
      )}`,
      {
        quantity: Math.max(
          0,
          Number(quantity) || 0
        )
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
      `/api/cart/${encodeURIComponent(
        productId
      )}`
    );
  },

  async clear() {
    return API.delete(
      "/api/cart"
    );
  },

  normalizeItem(item = {}) {
    const product =
      item.product ??
      item;

    return {
      id:
        item.id ??
        item.productId ??
        product.id ??
        "",

      productId:
        item.productId ??
        product.id ??
        "",

      name:
        item.name ??
        product.name ??
        product.title ??
        "",

      image:
        item.image ??
        product.image ??
        product.imageUrl ??
        "",

      price:
        Number(
          item.price ??
          product.price ??
          0
        ),

      quantity:
        Math.max(
          1,
          Number(
            item.quantity ??
            item.qty ??
            1
          ) || 1
        ),

      stock:
        Number(
          item.stock ??
          product.stock ??
          0
        ),

      raw: item
    };
  },

  normalize(data) {
    const items =
      Array.isArray(data)
        ? data
        : Array.isArray(data?.items)
          ? data.items
          : Array.isArray(data?.cart)
            ? data.cart
            : Array.isArray(data?.data)
              ? data.data
              : [];

    return {
      items: items.map(
        item =>
          this.normalizeItem(item)
      ),

      count:
        Number(
          data?.count ??
          data?.itemCount ??
          items.reduce(
            (total, item) =>
              total +
              Math.max(
                1,
                Number(
                  item.quantity ??
                  item.qty ??
                  1
                ) || 1
              ),
            0
          )
        ) || 0,

      subtotal:
        Number(
          data?.subtotal ??
          items.reduce(
            (total, item) => {
              const product =
                item.product ??
                item;

              const price =
                Number(
                  item.price ??
                  product.price ??
                  0
                ) || 0;

              const quantity =
                Math.max(
                  1,
                  Number(
                    item.quantity ??
                    item.qty ??
                    1
                  ) || 1
                );

              return (
                total +
                price *
                  quantity
              );
            },
            0
          )
        ) || 0,

      raw: data
    };
  }
};
