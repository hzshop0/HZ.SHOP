/* =================================
   HZ.SHOP — Search
   Product search and filtering
   ================================= */
(() => {
  "use strict";
  window.HZ = window.HZ || {};
  HZ.searchResults = [];
  /* ---------------------------------
     Search products
     --------------------------------- */
  HZ.searchProducts = (
    query,
    products = HZ.products || []
  ) => {
    const search = String(query ?? "")
      .trim()
      .toLowerCase();
    if (!Array.isArray(products)) {
      HZ.searchResults = [];
      return HZ.searchResults;
    }
    if (!search) {
      HZ.searchResults = [...products];
      return HZ.searchResults;
    }
    HZ.searchResults = products.filter(product => {
      const name =
        String(product?.name || "")
          .toLowerCase();
      const description =
        String(product?.description || "")
          .toLowerCase();
      const categoryName =
        String(product?.categoryName || "")
          .toLowerCase();
      return (
        name.includes(search) ||
        description.includes(search) ||
        categoryName.includes(search)
      );
    });
    return HZ.searchResults;
  };
  /* ---------------------------------
     Index — desktop search
     --------------------------------- */
  window.searchProducts = () => {
    const searchInput =
      document.getElementById("search");
    const mobileInput =
      document.getElementById("mobileSearch");
    if (!searchInput) return;
    const value = searchInput.value;
    if (mobileInput) {
      mobileInput.value = value;
    }
    const clear =
      document.getElementById("searchClear");
    if (clear) {
      clear.style.display =
        value ? "block" : "none";
    }
    /*
      Search resets the active category,
      exactly as the current Index does.
    */
    if (typeof window.current !== "undefined") {
      window.current = "all";
    }
    document
      .querySelectorAll(".nav button")
      .forEach(button =>
        button.classList.remove("active")
      );
    document
      .querySelectorAll(".filter")
      .forEach(button =>
        button.classList.remove("active")
      );
    const products =
      Array.isArray(window.products)
        ? window.products
        : (Array.isArray(HZ.products)
            ? HZ.products
            : []);
    HZ.searchProducts(
      value,
      products
    );
    if (typeof window.render === "function") {
      window.render();
    }
  };
  /* ---------------------------------
     Index — mobile search
     --------------------------------- */
  window.mobileSearchProducts = () => {
    const mobileInput =
      document.getElementById("mobileSearch");
    const desktopInput =
      document.getElementById("search");
    if (!mobileInput) return;
    const value =
      mobileInput.value;
    if (desktopInput) {
      desktopInput.value = value;
    }
    window.searchProducts();
  };
  /* ---------------------------------
     Index — clear search
     --------------------------------- */
  window.clearSearch = () => {
    const desktopInput =
      document.getElementById("search");
    const mobileInput =
      document.getElementById("mobileSearch");
    if (desktopInput) {
      desktopInput.value = "";
    }
    if (mobileInput) {
      mobileInput.value = "";
    }
    const clear =
      document.getElementById("searchClear");
    if (clear) {
      clear.style.display = "none";
    }
    HZ.searchResults = [];
    if (typeof window.render === "function") {
      window.render();
    }
  };
  /* ---------------------------------
     Index — clear mobile search
     --------------------------------- */
  window.clearMobileSearch = () => {
    window.clearSearch();
  };
  /* ---------------------------------
     Read query string
     ---------------------------------
     Kept as a generic helper for future
     pages. Index itself does not currently
     use URLSearchParams for search.
     */
  HZ.getSearchQuery = () => {
    const params =
      new URLSearchParams(
        window.location.search
      );
    return params.get("q") || "";
  };
  /* ---------------------------------
     Clear HZ search state
     --------------------------------- */
  HZ.clearSearch = () => {
    HZ.searchResults = [];
  };
})();
