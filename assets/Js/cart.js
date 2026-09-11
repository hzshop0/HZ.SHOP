/* =================================
   HZ.SHOP — Cart
   Local shopping cart management
   ================================= */
(() => {
  "use strict";
  window.HZ = window.HZ || {};
  /* ---------------------------------
     Configuration
     --------------------------------- */
  HZ.CART_KEY =
    HZ.CART_KEY ||
    "hz_cart";
  HZ.DELIVERY_FEE =
    HZ.DELIVERY_FEE != null
      ? HZ.DELIVERY_FEE
      : 4;
  HZ.discountRate =
    Number(
      localStorage.getItem(
        "hz_discount_rate"
      ) || 0
    ) || 0;
  HZ.cart = [];
  /* ---------------------------------
     Load cart
     --------------------------------- */
  HZ.loadCart = () => {
    const cart =
      typeof HZ.storageGetJSON ===
      "function"
        ? HZ.storageGetJSON(
            HZ.CART_KEY,
            []
          )
        : JSON.parse(
            localStorage.getItem(
              HZ.CART_KEY
            ) || "[]"
          );
    HZ.cart =
      Array.isArray(cart)
        ? cart
        : [];
    return HZ.cart;
  };
  /* ---------------------------------
     Save cart
     --------------------------------- */
  HZ.saveCart = () => {
    if (
      typeof HZ.storageSetJSON ===
      "function"
    ) {
      HZ.storageSetJSON(
        HZ.CART_KEY,
        HZ.cart
      );
    } else {
      localStorage.setItem(
        HZ.CART_KEY,
        JSON.stringify(HZ.cart)
      );
    }
    document.dispatchEvent(
      new CustomEvent(
        "hz:cart-updated",
        {
          detail: {
            cart: HZ.cart
          }
        }
      )
    );
    return HZ.cart;
  };
  /* ---------------------------------
     Find item
     --------------------------------- */
  HZ.getCartItem = (
    productId
  ) => {
    return HZ.cart.find(
      item =>
        String(item.id) ===
        String(productId)
    ) || null;
  };
  /* ---------------------------------
     Add product
     --------------------------------- */
  HZ.addToCart = (
    product,
    quantity = 1
  ) => {
    if (
      !product ||
      product.id == null
    ) {
      return false;
    }
    const qty =
      Math.max(
        1,
        Math.floor(
          typeof HZ.toNumber ===
          "function"
            ? HZ.toNumber(
                quantity,
                1
              )
            : Number(quantity) || 1
        )
      );
    const stock =
      Math.max(
        0,
        Math.floor(
          typeof HZ.toNumber ===
          "function"
            ? HZ.toNumber(
                product.stock,
                0
              )
            : Number(product.stock) || 0
        )
      );
    if (stock <= 0) {
      return false;
    }
    const existing =
      HZ.getCartItem(
        product.id
      );
    if (existing) {
      const currentQuantity =
        typeof HZ.toNumber ===
        "function"
          ? HZ.toNumber(
              existing.quantity,
              0
            )
          : Number(
              existing.quantity
            ) || 0;
      if (
        currentQuantity >=
        stock
      ) {
        return false;
      }
      existing.quantity =
        Math.min(
          currentQuantity + qty,
          stock
        );
      existing.price =
        typeof HZ.toNumber ===
        "function"
          ? HZ.toNumber(
              product.price,
              existing.price
            )
          : Number(product.price) ||
            existing.price ||
            0;
      existing.name =
        product.name ||
        existing.name;
      existing.image =
        product.image ||
        existing.image;
      existing.stock =
        stock;
    } else {
      HZ.cart.push({
        id: product.id,
        name:
          product.name ||
          "",
        price:
          typeof HZ.toNumber ===
          "function"
            ? HZ.toNumber(
                product.price,
                0
              )
            : Number(product.price) ||
              0,
        image:
          product.image ||
          "",
        quantity:
          Math.min(
            qty,
            stock
          ),
        stock
      });
    }
    HZ.saveCart();
    return true;
  };
  /* ---------------------------------
     Remove item
     --------------------------------- */
  HZ.removeFromCart = (
    productId
  ) => {
    const before =
      HZ.cart.length;
    HZ.cart =
      HZ.cart.filter(
        item =>
          String(item.id) !==
          String(productId)
      );
    if (
      HZ.cart.length !==
      before
    ) {
      HZ.saveCart();
    }
    return true;
  };
  /* ---------------------------------
     Update quantity
     --------------------------------- */
  HZ.updateCartQuantity = (
    productId,
    quantity
  ) => {
    const item =
      HZ.getCartItem(
        productId
      );
    if (!item) {
      return false;
    }
    let qty =
      Math.floor(
        typeof HZ.toNumber ===
        "function"
          ? HZ.toNumber(
              quantity,
              1
            )
          : Number(quantity) || 1
      );
    const stock =
      Math.max(
        0,
        Math.floor(
          typeof HZ.toNumber ===
          "function"
            ? HZ.toNumber(
                item.stock,
                0
              )
            : Number(item.stock) || 0
        )
      );
    if (qty <= 0) {
      HZ.removeFromCart(
        productId
      );
      return true;
    }
    if (stock > 0) {
      qty =
        Math.min(
          qty,
          stock
        );
    }
    item.quantity =
      qty;
    HZ.saveCart();
    return true;
  };
  /* ---------------------------------
     Increase quantity
     --------------------------------- */
  HZ.increaseCartQuantity = (
    productId
  ) => {
    const item =
      HZ.getCartItem(
        productId
      );
    if (!item) {
      return false;
    }
    const quantity =
      typeof HZ.toNumber ===
      "function"
        ? HZ.toNumber(
            item.quantity,
            0
          )
        : Number(item.quantity) ||
          0;
    return HZ.updateCartQuantity(
      productId,
      quantity + 1
    );
  };
  /* ---------------------------------
     Decrease quantity
     --------------------------------- */
  HZ.decreaseCartQuantity = (
    productId
  ) => {
    const item =
      HZ.getCartItem(
        productId
      );
    if (!item) {
      return false;
    }
    const quantity =
      typeof HZ.toNumber ===
      "function"
        ? HZ.toNumber(
            item.quantity,
            0
          )
        : Number(item.quantity) ||
          0;
    return HZ.updateCartQuantity(
      productId,
      quantity - 1
    );
  };
  /* ---------------------------------
     Clear cart
     --------------------------------- */
  HZ.clearCart = () => {
    HZ.cart = [];
    HZ.saveCart();
    return true;
  };
  /* ---------------------------------
     Cart count
     --------------------------------- */
  HZ.getCartCount = () => {
    return HZ.cart.reduce(
      (
        total,
        item
      ) => {
        const quantity =
          typeof HZ.toNumber ===
          "function"
            ? HZ.toNumber(
                item.quantity,
                0
              )
            : Number(
                item.quantity
              ) || 0;
        return (
          total +
          Math.max(
            0,
            quantity
          )
        );
      },
      0
    );
  };
  /* ---------------------------------
     Cart subtotal
     --------------------------------- */
  HZ.getCartSubtotal = () => {
    return HZ.cart.reduce(
      (
        total,
        item
      ) => {
        const price =
          typeof HZ.toNumber ===
          "function"
            ? HZ.toNumber(
                item.price,
                0
              )
            : Number(item.price) ||
              0;
        const quantity =
          typeof HZ.toNumber ===
          "function"
            ? HZ.toNumber(
                item.quantity,
                0
              )
            : Number(
                item.quantity
              ) || 0;
        return (
          total +
          price * quantity
        );
      },
      0
    );
  };
  /* =================================
     LEGACY INDEX COMPATIBILITY
     Keeps existing Index.html buttons
     and cart controls working.
     ================================= */
  /* ---------------------------------
     Add
     --------------------------------- */
  window.add = (
    id
  ) => {
    if (window.__hzAddLock) {
      return;
    }
    window.__hzAddLock =
      true;
    setTimeout(
      () => {
        window.__hzAddLock =
          false;
      },
      450
    );
    const product =
      Array.isArray(HZ.products)
        ? HZ.products.find(
            product =>
              String(product.id) ===
              String(id)
          )
        : null;
    if (!product) {
      if (
        typeof window.showToast ===
        "function"
      ) {
        window.showToast(
          "المنتج غير موجود"
        );
      }
      return;
    }
    const stock =
      typeof HZ.toNumber ===
      "function"
        ? HZ.toNumber(
            product.stock,
            0
          )
        : Number(product.stock) ||
          0;
    if (stock <= 0) {
      if (
        typeof window.showToast ===
        "function"
      ) {
        window.showToast(
          "المنتج غير متوفر"
        );
      }
      return;
    }
    const existing =
      HZ.getCartItem(
        product.id
      );
    if (
      existing &&
      (
        typeof HZ.toNumber ===
        "function"
          ? HZ.toNumber(
              existing.quantity,
              0
            )
          : Number(
              existing.quantity
            ) || 0
      ) >= stock
    ) {
      if (
        typeof window.showToast ===
        "function"
      ) {
        window.showToast(
          "لا يمكن إضافة كمية أكبر من المخزون"
        );
      }
      return;
    }
    const success =
      HZ.addToCart(
        product,
        1
      );
    if (!success) {
      if (
        typeof window.showToast ===
        "function"
      ) {
        window.showToast(
          "المنتج غير متوفر"
        );
      }
      return;
    }
    if (
      typeof window.showToast ===
      "function"
    ) {
      window.showToast(
        (
          product.name ||
          ""
        ) +
        " تمت إضافته إلى السلة"
      );
    }
    window.renderCart();
    if (
      typeof window.fbq ===
      "function"
    ) {
      const updatedItem =
        HZ.getCartItem(
          product.id
        );
      const quantity =
        updatedItem
          ? (
              typeof HZ.toNumber ===
              "function"
                ? HZ.toNumber(
                    updatedItem.quantity,
                    1
                  )
                : Number(
                    updatedItem.quantity
                  ) || 1
            )
          : 1;
      window.fbq(
        "track",
        "AddToCart",
        {
          content_ids: [
            String(product.id)
          ],
          content_type:
            "product",
          content_name:
            product.name || "",
          value:
            (
              Number(
                product.price
              ) || 0
            ) * quantity,
          currency:
            "USD"
        }
      );
    }
  };
  /* ---------------------------------
     Change quantity
     --------------------------------- */
  window.change = (
    id,
    num
  ) => {
    const item =
      HZ.getCartItem(id);
    if (!item) {
      return;
    }
    const amount =
      Number(num) || 0;
    const quantity =
      typeof HZ.toNumber ===
      "function"
        ? HZ.toNumber(
            item.quantity,
            0
          )
        : Number(
            item.quantity
          ) || 0;
    HZ.updateCartQuantity(
      id,
      quantity + amount
    );
    window.renderCart();
  };
  /* ---------------------------------
     Remove item
     --------------------------------- */
  window.removeItem = (
    id
  ) => {
    HZ.removeFromCart(id);
    window.renderCart();
    if (
      typeof window.showToast ===
      "function"
    ) {
      window.showToast(
        "تم حذف المنتج من السلة"
      );
    }
  };
  /* ---------------------------------
     Render cart
     --------------------------------- */
  window.renderCart = () => {
    const cartBody =
      document.getElementById(
        "cartItems"
      );
    const cartCount =
      document.getElementById(
        "cartCount"
      );
    const floatingCartCount =
      document.getElementById(
        "floatingCartCount"
      );
    const bottomCartCount =
      document.getElementById(
        "bottomCartCount"
      );
    if (cartCount) {
      const count =
        HZ.getCartCount();
      cartCount.textContent =
        count;
    }
    if (floatingCartCount) {
      floatingCartCount.textContent =
        HZ.getCartCount();
    }
    if (bottomCartCount) {
      bottomCartCount.textContent =
        HZ.getCartCount();
    }
    if (!cartBody) {
      return;
    }
    const cart =
      HZ.cart;
    if (!cart.length) {
      cartBody.innerHTML = `
        <div class="empty">
          السلة فارغة 🛒
          <br><br>
          أضف المنتجات التي تريد شراءها.
        </div>
      `;
      window.updateTotals();
      return;
    }
    cartBody.innerHTML =
      cart.map(
        item => {
          const quantity =
            Math.max(
              1,
              typeof HZ.toNumber ===
              "function"
                ? HZ.toNumber(
                    item.quantity,
                    1
                  )
                : Number(
                    item.quantity
                  ) || 1
            );
          const price =
            typeof HZ.toNumber ===
            "function"
              ? HZ.toNumber(
                  item.price,
                  0
                )
              : Number(item.price) ||
                0;
          const total =
            price *
            quantity;
          const name =
            typeof HZ.escapeHtml ===
            "function"
              ? HZ.escapeHtml(
                  item.name || ""
                )
              : String(
                  item.name || ""
                );
          const image =
            typeof HZ.escapeHtml ===
            "function"
              ? HZ.escapeHtml(
                  item.image || ""
                )
              : String(
                  item.image || ""
                );
          const stock =
            typeof HZ.toNumber ===
            "function"
              ? HZ.toNumber(
                  item.stock,
                  quantity
                )
              : Number(
                  item.stock
                ) || quantity;
          return `
            <div class="cart-item">
              <div class="cart-top">
                <div class="cart-product">
                  ${
                    image
                      ? `
                        <img
                          src="${image}"
                          alt="${name}"
                          onerror="this.style.display='none'"
                        >
                      `
                      : ""
                  }
                  <div>
                    <div class="cart-name">
                      ${name}
                    </div>
                    <div class="cart-price">
                      $${price.toFixed(2)} للقطعة
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  class="remove"
                  onclick="removeItem(${JSON.stringify(String(item.id))})"
                  aria-label="حذف"
                >
                  حذف
                </button>
              </div>
              <div class="qty">
                <button
                  type="button"
                  onclick="change(${JSON.stringify(String(item.id))},1)"
                  ${
                    stock > 0 &&
                    quantity >= stock
                      ? "disabled"
                      : ""
                  }
                >
                  +
                </button>
                <strong>
                  ${quantity}
                </strong>
                <button
                  type="button"
                  onclick="change(${JSON.stringify(String(item.id))},-1)"
                >
                  −
                </button>
                <span class="item-total">
                  $${total.toFixed(2)}
                </span>
              </div>
            </div>
          `;
        }
      ).join("");
    window.updateTotals();
  };
  /* ---------------------------------
     Update totals
     --------------------------------- */
  window.updateTotals = () => {
    const subtotalEl =
      document.getElementById(
        "subtotal"
      );
    const discountEl =
      document.getElementById(
        "discount"
      );
    const deliveryEl =
      document.getElementById(
        "delivery"
      );
    const totalEl =
      document.getElementById(
        "total"
      );
    const subtotal =
      HZ.getCartSubtotal();
    const discount =
      subtotal *
      (
        Number(
          HZ.discountRate
        ) || 0
      );
    const delivery =
      subtotal > 0
        ? Number(
            HZ.DELIVERY_FEE
          ) || 0
        : 0;
    const total =
      Math.max(
        0,
        subtotal -
        discount +
        delivery
      );
    if (subtotalEl) {
      subtotalEl.textContent =
        "$" +
        subtotal.toFixed(2);
    }
    if (discountEl) {
      discountEl.textContent =
        "-$" +
        discount.toFixed(2);
    }
    if (deliveryEl) {
      deliveryEl.textContent =
        "$" +
        delivery.toFixed(2);
    }
    if (totalEl) {
      totalEl.textContent =
        "$" +
        total.toFixed(2);
    }
  };
  /* ---------------------------------
     Open cart
     --------------------------------- */
  window.openCart = () => {
    window.location.href =
      "//Cart.html";
  };
  /* ---------------------------------
     Close cart
     --------------------------------- */
  window.closeCart = () => {
    const cartPanel =
      document.getElementById(
        "cart"
      );
    const overlay =
      document.getElementById(
        "overlay"
      );
    if (cartPanel) {
      cartPanel.classList.remove(
        "open"
      );
    }
    if (overlay) {
      overlay.classList.remove(
        "show"
      );
    }
    document.body.style.overflow =
      "";
  };
  /* ---------------------------------
     Apply coupon
     --------------------------------- */
  window.applyCoupon = () => {
    const input =
      document.getElementById(
        "coupon"
      );
    if (!input) {
      return;
    }
    const code =
      input.value
        .trim()
        .toUpperCase();
    if (code === "HZ10") {
      HZ.discountRate =
        0.10;
      localStorage.setItem(
        "hz_discount_rate",
        "0.10"
      );
      if (
        typeof window.showToast ===
        "function"
      ) {
        window.showToast(
          "تم تطبيق خصم 10%"
        );
      }
    } else {
      HZ.discountRate =
        0;
      localStorage.setItem(
        "hz_discount_rate",
        "0"
      );
      if (
        typeof window.showToast ===
        "function"
      ) {
        window.showToast(
          "كود الخصم غير صحيح"
        );
      }
    }
    window.updateTotals();
  };
  /* ---------------------------------
     Cart update listener
     --------------------------------- */
  document.addEventListener(
    "hz:cart-updated",
    () => {
      if (
        typeof window.renderCart ===
        "function"
      ) {
        window.renderCart();
      }
      const count =
        HZ.getCartCount();
      document
        .querySelectorAll(
          "[data-cart-count]"
        )
        .forEach(
          element => {
            element.textContent =
              count;
            element.hidden =
              count <= 0;
          }
        );
    }
  );
  /* ---------------------------------
     Initialize
     --------------------------------- */
  HZ.loadCart();
})();
