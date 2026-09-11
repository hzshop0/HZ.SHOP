/* =================================
   HZ.SHOP — Orders
   Customer order helpers
   ================================= */
(() => {
  "use strict";
  window.HZ = window.HZ || {};
  HZ.orders = [];
  /* ---------------------------------
     Normalize order
     --------------------------------- */
  HZ.normalizeOrder = (order) => {
    if (!order || typeof order !== "object") {
      return null;
    }
    return {
      ...order,
      id:
        order.id ??
        order.order_id ??
        order.orderId ??
        "",
      status:
        order.status ??
        order.order_status ??
        "pending",
      total: HZ.toNumber(
        order.total ??
        order.amount ??
        order.total_amount,
        0
      ),
      created_at:
        order.created_at ??
        order.createdAt ??
        order.date ??
        "",
      items:
        Array.isArray(order.items)
          ? order.items
          : []
    };
  };
  /* ---------------------------------
     Load customer orders
     --------------------------------- */
  HZ.loadOrders = async () => {
    const response =
      await HZ.apiGet(
        `/customer-orders?t=${Date.now()}`
      );
    let orders = [];
    if (Array.isArray(response)) {
      orders = response;
    } else if (
      response &&
      Array.isArray(response.orders)
    ) {
      orders = response.orders;
    } else if (
      response &&
      Array.isArray(response.data)
    ) {
      orders = response.data;
    }
    HZ.orders = orders
      .map(HZ.normalizeOrder)
      .filter(Boolean);
    return HZ.orders;
  };
  /* ---------------------------------
     Find order
     --------------------------------- */
  HZ.getOrderById = (orderId) => {
    if (
      orderId === undefined ||
      orderId === null
    ) {
      return null;
    }
    return (
      HZ.orders.find(
        order =>
          String(order.id) ===
          String(orderId)
      ) || null
    );
  };
  /* ---------------------------------
     Order status label
     --------------------------------- */
  HZ.getOrderStatusLabel = (status) => {
    const value =
      String(status ?? "")
        .trim()
        .toLowerCase();
    const labels = {
      pending: "قيد الانتظار",
      confirmed: "تم التأكيد",
      processing: "قيد التجهيز",
      shipped: "تم الشحن",
      delivered: "تم التسليم",
      cancelled: "ملغي",
      canceled: "ملغي",
      completed: "مكتمل"
    };
    return (
      labels[value] ||
      status ||
      "غير محدد"
    );
  };
  /* ---------------------------------
     Order status class
     --------------------------------- */
  HZ.getOrderStatusClass = (status) => {
    const value =
      String(status ?? "")
        .trim()
        .toLowerCase();
    return `status-${value || "unknown"}`;
  };
  /* ---------------------------------
     Order total
     --------------------------------- */
  HZ.getOrderTotal = (order) => {
    if (!order) {
      return 0;
    }
    return HZ.toNumber(
      order.total ??
      order.amount ??
      order.total_amount,
      0
    );
  };
  /* ---------------------------------
     Navigate to order
     --------------------------------- */
  HZ.openOrder = (orderId) => {
    if (
      orderId === undefined ||
      orderId === null ||
      orderId === ""
    ) {
      return;
    }
    HZ.go(
      `/Order.html?id=${encodeURIComponent(
        orderId
      )}`
    );
  };
})();
