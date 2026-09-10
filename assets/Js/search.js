/* =================================
   HZ.SHOP — Search
   Product search and filtering
   ================================= */

(() => {
  "use strict";

  window.HZ = window.HZ || {};

  HZ.searchResults = [];

  HZ.searchProducts = (
    query,
    products = HZ.products || []
  ) => {
    const search = String(query ?? "")
      .trim()
      .toLowerCase();

    if (!search) {
      HZ.searchResults = [...products];
      return HZ.searchResults;
    }

    HZ.searchResults = products.filter(product => {
      const searchableText = [
        product?.name,
        product?.category,
        product?.brand,
        product?.description
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return searchableText.includes(search);
    });

    return HZ.searchResults;
  };

  HZ.getSearchQuery = () => {
    const params = new URLSearchParams(
      window.location.search
    );

    return params.get("q") || "";
  };

  HZ.goSearch = (query) => {
    const value = String(query ?? "").trim();

    if (!value) {
      HZ.go("/Search.html");
      return;
    }

    HZ.go(
      `/Search.html?q=${encodeURIComponent(value)}`
    );
  };

  HZ.clearSearch = () => {
    HZ.searchResults = [];
  };

})();
