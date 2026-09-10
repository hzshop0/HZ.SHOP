/* =================================
   HZ.SHOP — Authentication
   Customer authentication helpers
   ================================= */

(() => {
  "use strict";

  window.HZ = window.HZ || {};

  /* ---------------------------------
     State
     --------------------------------- */

  HZ.customer = null;
  HZ.customerLoading = false;

  /* ---------------------------------
     Login
     --------------------------------- */

  HZ.login = async (phone, password) => {
    return HZ.apiPost("/customer-login", {
      phone,
      password
    });
  };

  /* ---------------------------------
     Register
     --------------------------------- */

  HZ.register = async (data) => {
    return HZ.apiPost("/customer-register", data);
  };

  /* ---------------------------------
     Logout
     --------------------------------- */

  HZ.logout = async () => {
    const result = await HZ.apiPost("/customer-logout", {});

    HZ.customer = null;

    return result;
  };

  /* ---------------------------------
     Current customer
     --------------------------------- */

  HZ.loadCustomer = async () => {
    if (HZ.customerLoading) {
      return HZ.customer;
    }

    HZ.customerLoading = true;

    try {
      const result = await HZ.apiGet("/customer-me");

      HZ.customer =
        result?.customer ??
        result?.user ??
        result ??
        null;

      return HZ.customer;
    } catch (error) {
      if (error.status === 401) {
        HZ.customer = null;
        return null;
      }

      throw error;
    } finally {
      HZ.customerLoading = false;
    }
  };

  /* ---------------------------------
     Authentication state
     --------------------------------- */

  HZ.isLoggedIn = () => {
    return !!HZ.customer;
  };

  /* ---------------------------------
     Require login
     --------------------------------- */

  HZ.requireLogin = async (redirect = "/Login.html") => {
    const customer = await HZ.loadCustomer();

    if (!customer) {
      HZ.go(redirect);
      return false;
    }

    return true;
  };

  /* ---------------------------------
     Customer display name
     --------------------------------- */

  HZ.getCustomerName = () => {
    if (!HZ.customer) {
      return "";
    }

    return (
      HZ.customer.name ||
      HZ.customer.fullName ||
      HZ.customer.full_name ||
      HZ.customer.phone ||
      ""
    );
  };

})();
