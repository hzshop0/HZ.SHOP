const ORDERS_API = {
  async create(data = {}) {
    return API.post(
      "/api/orders",
      data
    );
  },

  async getAll(options = {}) {
    const params =
      new URLSearchParams();

    if (options.status) {
      params.set(
        "status",
        options.status
      );
    }

    if (options.page) {
      params.set(
        "page",
        String(options.page)
      );
    }

    if (options.limit) {
      params.set(
        "limit",
        String(options.limit)
      );
    }

    params.set(
      "t",
      Date.now().toString()
    );

    return API.get(
      `/api/orders?${params.toString()}`
    );
  },

  async getById(id) {
    if (
      id === undefined ||
      id === null ||
      id === ""
    ) {
      throw new Error(
        "Order ID is required"
      );
    }

    return API.get(
      `/api/orders/${encodeURIComponent(
        id
      )}?t=${Date.now()}`
    );
  },

  async cancel(id) {
    if (
      id === undefined ||
      id === null ||
      id === ""
    ) {
      throw new Error(
        "Order ID is required"
      );
    }

    return API.put(
      `/api/orders/${encodeURIComponent(
        id
      )}/cancel`,
      {
        status: "cancelled"
      }
    );
  },

  normalize(order = {}) {
    const items =
      Array.isArray(order.items)
        ? order.items
        : [];

    return {
      id:
        order.id ??
        order.orderId ??
        order.order_id ??
        "",

      customerId:
        order.customerId ??
        order.customer_id ??
        "",

      status:
        order.status ??
        "pending",

      items: items.map(
        item => ({
          id:
            item.id ??
            item.productId ??
            "",

          productId:
            item.productId ??
            item.product_id ??
            item.id ??
            "",

          name:
            item.name ??
            item.productName ??
            item.product_name ??
            "",

          image:
            item.image ??
            item.imageUrl ??
            "",

          price:
            Number(
              item.price ?? 0
            ),

          quantity:
            Math.max(
              1,
              Number(
                item.quantity ??
                item.qty ??
                1
              ) || 1
            )
        })
      ),

      subtotal:
        Number(
          order.subtotal ?? 0
        ),

      discount:
        Number(
          order.discount ?? 0
        ),

      deliveryFee:
        Number(
          order.deliveryFee ??
          order.delivery_fee ??
          4
        ),

      total:
        Number(
          order.total ?? 0
        ),

      paymentMethod:
        order.paymentMethod ??
        order.payment_method ??
        "cod",

      customerName:
        order.customerName ??
        order.customer_name ??
        "",

      customerPhone:
        order.customerPhone ??
        order.customer_phone ??
        "",

      address:
        order.address ??
        order.deliveryAddress ??
        order.delivery_address ??
        "",

      createdAt:
        order.createdAt ??
        order.created_at ??
        null,

      updatedAt:
        order.updatedAt ??
        order.updated_at ??
        null,

      raw: order
    };
  },

  normalizeList(data) {
    const orders =
      Array.isArray(data)
        ? data
        : Array.isArray(data?.orders)
          ? data.orders
          : Array.isArray(data?.data)
            ? data.data
            : [];

    return orders.map(
      order =>
        this.normalize(order)
    );
  }
};
