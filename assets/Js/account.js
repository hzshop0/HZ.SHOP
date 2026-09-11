/* =================================
   HZ.SHOP — Account
   Customer Hub + Customer Auth
   ================================= */

(() => {
  "use strict";

  window.HZ = window.HZ || {};

  /* ---------------------------------
     Account state
     --------------------------------- */

  HZ.account = HZ.account || {
    initialized: false,
    loading: false
  };

  /*
     Keep customer data in the modular
     HZ namespace while preserving the
     old Index.html compatibility.
  */
  if (!Object.prototype.hasOwnProperty.call(HZ, "customer")) {
    HZ.customer = null;
  }

  /* ---------------------------------
     Current customer compatibility
     --------------------------------- */

  Object.defineProperty(window, "currentCustomer", {
    configurable: true,

    get() {
      return HZ.customer || null;
    },

    set(value) {
      HZ.customer = value || null;
    }
  });

  /* ---------------------------------
     Load customer
     --------------------------------- */

  HZ.loadCustomer = async () => {
    try {
      const response = await fetch(
        "/api/customer-me",
        {
          method: "GET",
          credentials: "include"
        }
      );

      const data = await response.json();

      if (response.ok && data.customer) {
        HZ.customer = data.customer;

        return HZ.customer;
      }

      HZ.customer = null;

      return null;

    } catch (error) {

      console.error(
        "Customer session error:",
        error
      );

      HZ.customer = null;

      return null;
    }
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

        if (
          typeof HZ.loadFavorites === "function"
        ) {
          HZ.loadFavorites();
        }

        if (
          typeof HZ.loadCart === "function"
        ) {
          HZ.loadCart();
        }

        if (
          typeof HZ.loadOrders === "function"
        ) {
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
        new CustomEvent(
          "hz:account-ready",
          {
            detail: {
              customer: HZ.customer
            }
          }
        )
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

      orders:
        Array.isArray(HZ.orders)
          ? HZ.orders.length
          : 0,

      favorites:
        Array.isArray(HZ.favorites)
          ? HZ.favorites.length
          : 0,

      cartItems:
        typeof HZ.getCartCount === "function"
          ? HZ.getCartCount()
          : 0

    };
  };

  /* =================================
     CUSTOMER AUTH
     Migrated from Index.html
     ================================= */

  /* ---------------------------------
     Open customer authentication
     --------------------------------- */

  window.openCustomerAuth = () => {

    const modal =
      document.getElementById(
        "customerAuthModal"
      );

    if (!modal) {

      console.error(
        "Customer auth modal not found"
      );

      return;
    }

    modal.classList.add("show");

    document.body.style.overflow =
      "hidden";

    window.checkCustomerSession();
  };

  /* ---------------------------------
     Close customer authentication
     --------------------------------- */

  window.closeCustomerAuth = (
    event
  ) => {

    if (
      event &&
      event.target !== event.currentTarget
    ) {
      return;
    }

    const modal =
      document.getElementById(
        "customerAuthModal"
      );

    if (!modal) {
      return;
    }

    modal.classList.remove("show");

    document.body.style.overflow = "";
  };

  /* ---------------------------------
     Switch authentication mode
     --------------------------------- */

  window.switchAuthMode = (
    mode
  ) => {

    const loginPanel =
      document.getElementById(
        "customerLoginPanel"
      );

    const registerPanel =
      document.getElementById(
        "customerRegisterPanel"
      );

    const accountPanel =
      document.getElementById(
        "customerAccountPanel"
      );

    const loginTab =
      document.getElementById(
        "customerLoginTab"
      );

    const registerTab =
      document.getElementById(
        "customerRegisterTab"
      );

    const tabs =
      document.getElementById(
        "customerAuthTabs"
      );

    const title =
      document.getElementById(
        "customerAuthTitle"
      );

    if (
      !loginPanel ||
      !registerPanel ||
      !accountPanel ||
      !tabs ||
      !title
    ) {
      return;
    }

    if (HZ.customer) {

      loginPanel.style.display =
        "none";

      registerPanel.style.display =
        "none";

      accountPanel.style.display =
        "block";

      tabs.style.display =
        "none";

      title.textContent =
        "حساب العميل";

      return;
    }

    accountPanel.style.display =
      "none";

    tabs.style.display =
      "grid";

    if (mode === "register") {

      loginPanel.style.display =
        "none";

      registerPanel.style.display =
        "block";

      if (loginTab) {
        loginTab.classList.remove(
          "active"
        );
      }

      if (registerTab) {
        registerTab.classList.add(
          "active"
        );
      }

      title.textContent =
        "إنشاء حساب";

    } else {

      loginPanel.style.display =
        "block";

      registerPanel.style.display =
        "none";

      if (loginTab) {
        loginTab.classList.add(
          "active"
        );
      }

      if (registerTab) {
        registerTab.classList.remove(
          "active"
        );
      }

      title.textContent =
        "تسجيل الدخول";
    }
  };

  /* ---------------------------------
     Check customer session
     --------------------------------- */

  window.checkCustomerSession =
    async () => {

      try {

        const response =
          await fetch(
            "/api/customer-me",
            {
              method: "GET",
              credentials: "include"
            }
          );

        const data =
          await response.json();

        if (
          response.ok &&
          data.customer
        ) {

          HZ.customer =
            data.customer;

          const nameElement =
            document.getElementById(
              "customerAccountName"
            );

          const phoneElement =
            document.getElementById(
              "customerAccountPhone"
            );

          if (nameElement) {
            nameElement.textContent =
              data.customer.name ||
              "العميل";
          }

          if (phoneElement) {
            phoneElement.textContent =
              data.customer.phone ||
              "—";
          }

          window.switchAuthMode(
            "account"
          );

        } else {

          HZ.customer = null;

          window.switchAuthMode(
            "login"
          );
        }

        return HZ.customer;

      } catch (error) {

        console.error(
          "Customer session error:",
          error
        );

        HZ.customer = null;

        window.switchAuthMode(
          "login"
        );

        return null;
      }
    };

  /* ---------------------------------
     Customer login
     --------------------------------- */

  window.submitCustomerLogin =
    async () => {

      const phoneElement =
        document.getElementById(
          "customerLoginPhone"
        );

      const passwordElement =
        document.getElementById(
          "customerLoginPassword"
        );

      if (
        !phoneElement ||
        !passwordElement
      ) {
        return;
      }

      const phone =
        phoneElement.value.trim();

      const password =
        passwordElement.value;

      if (!phone || !password) {

        alert(
          "يرجى إدخال رقم الهاتف وكلمة المرور."
        );

        return;
      }

      const button =
        document.getElementById(
          "customerLoginButton"
        );

      if (button) {

        button.disabled = true;

        button.textContent =
          "جاري تسجيل الدخول...";
      }

      try {

        const response =
          await fetch(
            "/api/customer-login",
            {
              method: "POST",
              credentials: "include",

              headers: {
                "Content-Type":
                  "application/json"
              },

              body: JSON.stringify({
                phone: phone,
                password: password
              })
            }
          );

        const data =
          await response.json();

        if (!response.ok) {

          alert(
            data.error ||
            data.message ||
            "فشل تسجيل الدخول."
          );

          return;
        }

        HZ.customer =
          data.customer || null;

        await window.checkCustomerSession();

        alert(
          "تم تسجيل الدخول بنجاح."
        );

      } catch (error) {

        console.error(
          "Customer login error:",
          error
        );

        alert(
          "حدث خطأ أثناء تسجيل الدخول."
        );

      } finally {

        if (button) {

          button.disabled = false;

          button.textContent =
            "تسجيل الدخول";
        }
      }
    };

  /* ---------------------------------
     Customer registration
     --------------------------------- */

  window.submitCustomerRegister =
    async () => {

      const nameElement =
        document.getElementById(
          "customerRegisterName"
        );

      const phoneElement =
        document.getElementById(
          "customerRegisterPhone"
        );

      const passwordElement =
        document.getElementById(
          "customerRegisterPassword"
        );

      const passwordConfirmElement =
        document.getElementById(
          "customerRegisterPasswordConfirm"
        );

      if (
        !nameElement ||
        !phoneElement ||
        !passwordElement ||
        !passwordConfirmElement
      ) {
        return;
      }

      const name =
        nameElement.value.trim();

      const phone =
        phoneElement.value.trim();

      const password =
        passwordElement.value;

      const passwordConfirm =
        passwordConfirmElement.value;

      if (
        !name ||
        !phone ||
        !password ||
        !passwordConfirm
      ) {

        alert(
          "يرجى تعبئة جميع الحقول."
        );

        return;
      }

      if (password.length < 6) {

        alert(
          "كلمة المرور يجب أن تكون 6 أحرف على الأقل."
        );

        return;
      }

      if (
        password !== passwordConfirm
      ) {

        alert(
          "كلمتا المرور غير متطابقتين."
        );

        return;
      }

      const button =
        document.getElementById(
          "customerRegisterButton"
        );

      if (button) {

        button.disabled = true;

        button.textContent =
          "جاري إنشاء الحساب...";
      }

      try {

        const response =
          await fetch(
            "/api/customer-register",
            {
              method: "POST",
              credentials: "include",

              headers: {
                "Content-Type":
                  "application/json"
              },

              body: JSON.stringify({
                name: name,
                phone: phone,
                password: password
              })
            }
          );

        const data =
          await response.json();

        if (!response.ok) {

          alert(
            data.error ||
            data.message ||
            "فشل إنشاء الحساب."
          );

          return;
        }

        HZ.customer =
          data.customer || null;

        await window.checkCustomerSession();

        alert(
          "تم إنشاء الحساب بنجاح."
        );

      } catch (error) {

        console.error(
          "Customer register error:",
          error
        );

        alert(
          "حدث خطأ أثناء إنشاء الحساب."
        );

      } finally {

        if (button) {

          button.disabled = false;

          button.textContent =
            "إنشاء الحساب";
        }
      }
    };

  /* ---------------------------------
     Customer logout
     --------------------------------- */

  window.customerLogout =
    async () => {

      try {

        await fetch(
          "/api/customer-logout",
          {
            method: "POST",
            credentials: "include"
          }
        );

      } catch (error) {

        console.error(
          "Customer logout error:",
          error
        );
      }

      HZ.customer = null;

      window.switchAuthMode(
        "login"
      );

      const phoneElement =
        document.getElementById(
          "customerLoginPhone"
        );

      const passwordElement =
        document.getElementById(
          "customerLoginPassword"
        );

      if (phoneElement) {
        phoneElement.value = "";
      }

      if (passwordElement) {
        passwordElement.value = "";
      }

      alert(
        "تم تسجيل الخروج بنجاح."
      );
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

      if (
        typeof HZ.go === "function"
      ) {
        HZ.go(
          "/Account.html"
        );
      } else {
        window.location.href =
          "/Account.html";
      }

      return;
    }

    const url =
      `/Account.html#${encodeURIComponent(
        value
      )}`;

    if (
      typeof HZ.go === "function"
    ) {
      HZ.go(url);
    } else {
      window.location.href = url;
    }
  };

})();
