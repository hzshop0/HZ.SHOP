/* =================================
   HZ.SHOP — Account
   Customer Hub helpers
   ================================= */

(() => {
  "use strict";

  window.HZ = window.HZ || {};

  HZ.account = {
    initialized: false,
    loading: false
  };

  /* ---------------------------------
     Initialize account
     --------------------------------- */

  HZ.initAccount = async () => {
    if (HZ.account.loading) {
      return HZ.customer;
    }

    HZ.account.loading = true;

    try {
      const customer =
        await HZ.loadCustomer();

      HZ.customer = customer;

      if (customer) {
        HZ.loadFavorites();

        if (typeof HZ.loadCart === "function") {
          HZ.loadCart();
        }

        if (typeof HZ.loadOrders === "function") {
          try {
            await HZ.loadOrders();
          } catch (error) {
            console.error(
              "HZ.SHOP orders load error:",
              error
            );
          }
        }
      }

      HZ.account.initialized = true;

      document.dispatchEvent(
        new CustomEvent("hz:account-ready", {
          detail: {
            customer: HZ.customer
          }
        })
      );

      return HZ.customer;
    } finally {
      HZ.account.loading = false;
    }
  };

  /* ---------------------------------
     Customer information
     --------------------------------- */

  HZ.getAccountInfo = () => {
    const customer = HZ.customer;

    if (!customer) {
      return {
        name: "",
        phone: "",
        email: ""
      };
    }

    return {
      name:
        customer.name ||
        customer.fullName ||
        customer.full_name ||
        "",

      phone:
        customer.phone ||
        customer.mobile ||
        "",

      email:
        customer.email ||
        ""
    };
  };

  /* ---------------------------------
     Account statistics
     --------------------------------- */

  HZ.getAccountStats = () => {
    return {
      orders: Array.isArray(HZ.orders)
        ? HZ.orders.length
        : 0,

      favorites: Array.isArray(HZ.favorites)
        ? HZ.favorites.length
        : 0,

      cartItems:
        typeof HZ.getCartCount === "function"
          ? HZ.getCartCount()
          : 0
    };
  };

  /* ---------------------------------
     Account navigation
     --------------------------------- */

  HZ.goAccountSection = (
    section
  ) => {
    const value =
      String(section ?? "").trim();

    if (!value) {
      HZ.go("/Account.html");
      return;
    }

    HZ.go(
      `/Account.html#${encodeURIComponent(
        value
      )}`
    );
  };

})();
