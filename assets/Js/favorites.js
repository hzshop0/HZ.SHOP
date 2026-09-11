/* =================================
   HZ.SHOP — Favorites
   Customer favorites
   ================================= */
(() => {
  "use strict";
  window.HZ = window.HZ || {};
  /* =========================
     STATE
     ========================= */
  if (!Array.isArray(HZ.favorites)) {
    HZ.favorites = [];
  }
  HZ.FAVORITES_KEY =
    HZ.FAVORITES_KEY || "hz_fav";
  /* =========================
     LOAD / SAVE
     ========================= */
  HZ.loadFavorites = () => {
    let favorites = [];
    try {
      if (
        typeof HZ.storageGetJSON === "function"
      ) {
        favorites = HZ.storageGetJSON(
          HZ.FAVORITES_KEY,
          []
        );
      } else {
        const raw =
          localStorage.getItem(
            HZ.FAVORITES_KEY
          );
        favorites = raw
          ? JSON.parse(raw)
          : [];
      }
    } catch {
      favorites = [];
    }
    HZ.favorites =
      Array.isArray(favorites)
        ? favorites
        : [];
    return HZ.favorites;
  };
  HZ.saveFavorites = () => {
    try {
      if (
        typeof HZ.storageSetJSON === "function"
      ) {
        HZ.storageSetJSON(
          HZ.FAVORITES_KEY,
          HZ.favorites
        );
      } else {
        localStorage.setItem(
          HZ.FAVORITES_KEY,
          JSON.stringify(HZ.favorites)
        );
      }
      return true;
    } catch {
      return false;
    }
  };
  /* =========================
     FAVORITE CHECK
     ========================= */
  HZ.isFavorite = (productId) => {
    if (
      productId === undefined ||
      productId === null
    ) {
      return false;
    }
    return HZ.favorites.some(
      id =>
        String(id) === String(productId)
    );
  };
  /* =========================
     ADD
     ========================= */
  HZ.addFavorite = (productId) => {
    if (
      productId === undefined ||
      productId === null
    ) {
      return false;
    }
    if (!HZ.isFavorite(productId)) {
      HZ.favorites.push(
        Number(productId)
      );
      HZ.saveFavorites();
    }
    return true;
  };
  /* =========================
     REMOVE
     ========================= */
  HZ.removeFavorite = (productId) => {
    if (
      productId === undefined ||
      productId === null
    ) {
      return false;
    }
    HZ.favorites =
      HZ.favorites.filter(
        id =>
          String(id) !==
          String(productId)
      );
    HZ.saveFavorites();
    return true;
  };
  /* =========================
     TOGGLE
     ========================= */
  HZ.toggleFavorite = (productId) => {
    if (
      productId === undefined ||
      productId === null
    ) {
      return false;
    }
    if (HZ.isFavorite(productId)) {
      HZ.removeFavorite(productId);
      return false;
    }
    HZ.addFavorite(productId);
    return true;
  };
  /* =========================
     CLEAR
     ========================= */
  HZ.clearFavorites = () => {
    HZ.favorites = [];
    return HZ.saveFavorites();
  };
  /* =========================
     GET FAVORITE PRODUCTS
     ========================= */
  HZ.getFavoriteProducts = (
    products = HZ.products || []
  ) => {
    return products.filter(product =>
      HZ.isFavorite(product.id)
    );
  };
  /* =========================
     FAVORITES COUNT
     ========================= */
  HZ.updateFavoriteCount = () => {
    const count =
      HZ.favorites.length;
    const favCount =
      document.getElementById(
        "favCount"
      );
    if (favCount) {
      favCount.textContent = count;
    }
    const bottomFavCount =
      document.getElementById(
        "bottomFavCount"
      );
    if (bottomFavCount) {
      bottomFavCount.textContent = count;
    }
    return count;
  };
  /* =========================
     INDEX COMPATIBILITY
     ========================= */
  window.updateFavoriteCount =
    HZ.updateFavoriteCount;
  window.toggleFav = (id) => {
    id = Number(id);
    if (
      !Number.isFinite(id)
    ) {
      return;
    }
    if (
      HZ.favorites.includes(id)
    ) {
      HZ.favorites =
        HZ.favorites.filter(
          x => x !== id
        );
      if (
        typeof HZ.toast === "function"
      ) {
        HZ.toast(
          "تمت إزالة المنتج من المفضلة"
        );
      }
    } else {
      HZ.favorites.push(id);
      if (
        typeof HZ.toast === "function"
      ) {
        HZ.toast(
          "تمت إضافة المنتج إلى المفضلة"
        );
      }
    }
    HZ.saveFavorites();
    HZ.updateFavoriteCount();
    if (
      typeof window.render === "function"
    ) {
      window.render();
    }
    if (
      typeof window.renderSmartSections ===
      "function"
    ) {
      window.renderSmartSections();
    }
  };
  /* =========================
     OPEN FAVORITES
     ========================= */
  window.openFavorites = () => {
    const modal =
      document.getElementById(
        "favoritesModal"
      );
    const box =
      document.getElementById(
        "favoritesList"
      );
    if (!modal || !box) {
      return;
    }
    const products =
      Array.isArray(HZ.products)
        ? HZ.products
        : [];
    const list =
      products.filter(product =>
        HZ.favorites.includes(
          Number(product.id)
        )
      );
    if (!list.length) {
      box.innerHTML = `
        <div class="empty">
          لا توجد منتجات في المفضلة ♡
          <br><br>
          أضف المنتجات التي تعجبك لتجدها هنا.
        </div>
      `;
    } else {
      box.innerHTML = "";
      list.forEach(product => {
        const safeName =
          typeof HZ.escapeHtml === "function"
            ? HZ.escapeHtml(product.name)
            : String(product.name ?? "");
        const price =
          Number(product.price);
        box.innerHTML += `
          <div class="favorite-item">
            <div class="favorite-item-info">
              <div class="favorite-item-name">
                ${safeName}
              </div>
              <div class="favorite-item-price">
                $${Number.isFinite(price)
                  ? price.toFixed(2)
                  : "0.00"}
              </div>
            </div>
            <div class="favorite-actions">
              <button
                class="small-btn"
                onclick="add(${Number(product.id)})">
                🛒
              </button>
              <button
                class="small-btn"
                onclick="removeFavoriteFromModal(${Number(product.id)})">
                حذف
              </button>
            </div>
          </div>
        `;
      });
    }
    modal.classList.add("show");
    document.body.style.overflow =
      "hidden";
  };
  /* =========================
     REMOVE FROM MODAL
     ========================= */
  window.removeFavoriteFromModal =
    (id) => {
      id = Number(id);
      if (
        !Number.isFinite(id)
      ) {
        return;
      }
      HZ.favorites =
        HZ.favorites.filter(
          x => x !== id
        );
      HZ.saveFavorites();
      HZ.updateFavoriteCount();
      window.openFavorites();
      if (
        typeof window.render === "function"
      ) {
        window.render();
      }
    };
  /* =========================
     CLOSE FAVORITES
     ========================= */
  window.closeFavorites =
    (event) => {
      if (
        event &&
        event.target !==
          event.currentTarget
      ) {
        return;
      }
      const modal =
        document.getElementById(
          "favoritesModal"
        );
      if (modal) {
        modal.classList.remove(
          "show"
        );
      }
      const cart =
        document.getElementById(
          "cart"
        );
      if (
        !cart ||
        !cart.classList.contains(
          "open"
        )
      ) {
        document.body.style.overflow =
          "";
      }
    };
  /* =========================
     INITIALIZE
     ========================= */
  HZ.loadFavorites();
  HZ.updateFavoriteCount();
})();
