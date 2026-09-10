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

  HZ.CART_KEY = HZ.CART_KEY || "hz_cart";
  HZ.DELIVERY_FEE =
    HZ.DELIVERY_FEE != null
      ? HZ.DELIVERY_FEE
      : 0;

  HZ.discountRate =
    Number(HZ.discountRate) || 0;

  HZ.cart = [];


  /* ---------------------------------
     Load cart
     --------------------------------- */

  HZ.loadCart = () => {

    const cart = HZ.storageGetJSON(
      HZ.CART_KEY,
      []
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

    HZ.storageSetJSON(
      HZ.CART_KEY,
      HZ.cart
    );

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
          HZ.toNumber(
            quantity,
            1
          )
        )
      );

    const stock =
      Math.max(
        0,
        Math.floor(
          HZ.toNumber(
            product.stock,
            0
          )
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

      existing.quantity =
        Math.min(
          HZ.toNumber(
            existing.quantity,
            0
          ) + qty,
          stock
        );

      existing.price =
        HZ.toNumber(
          product.price,
          existing.price
        );

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
        name: product.name || "",
        price:
          HZ.toNumber(
            product.price,
            0
          ),
        image:
          product.image || "",
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
        HZ.toNumber(
          quantity,
          1
        )
      );

    const stock =
      Math.max(
        0,
        Math.floor(
          HZ.toNumber(
            item.stock,
            0
          )
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

    return HZ.updateCartQuantity(
      productId,
      HZ.toNumber(
        item.quantity,
        0
      ) + 1
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

    return HZ.updateCartQuantity(
      productId,
      HZ.toNumber(
        item.quantity,
        0
      ) - 1
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
      ) =>
        total +
        Math.max(
          0,
          HZ.toNumber(
            item.quantity,
            0
          )
        ),
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
          HZ.toNumber(
            item.price,
            0
          );

        const quantity =
          Math.max(
            0,
            HZ.toNumber(
              item.quantity,
              0
            )
          );

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

    const product =
      Array.isArray(HZ.products)
        ? HZ.products.find(
            p =>
              String(p.id) ===
              String(id)
          )
        : null;

    if (!product) {
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
        "تمت إضافة المنتج إلى السلة"
      );
    }

    window.renderCart();

    if (
      typeof window.fbq ===
      "function"
    ) {
      window.fbq(
        "track",
        "AddToCart",
        {
          content_ids: [
            String(product.id)
          ],
          content_name:
            product.name || "",
          value:
            Number(product.price) || 0,
          currency: "USD"
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

    HZ.updateCartQuantity(
      id,
      HZ.toNumber(
        item.quantity,
        0
      ) + amount
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
  };


  /* ---------------------------------
     Render cart drawer
     --------------------------------- */

  window.renderCart = () => {

    const cartBody =
      document.getElementById(
        "cartBody"
      );

    const cartCount =
      document.getElementById(
        "cartCount"
      );

    if (!cartBody) {
      return;
    }

    const cart =
      HZ.cart;

    if (cartCount) {

      const count =
        HZ.getCartCount();

      cartCount.textContent =
        count;

      cartCount.hidden =
        count <= 0;
    }

    if (!cart.length) {

      cartBody.innerHTML = `
        <div class="empty">
          السلة فارغة
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
              HZ.toNumber(
                item.quantity,
                1
              )
            );

          const price =
            HZ.toNumber(
              item.price,
              0
            );

          const total =
            price * quantity;

          const name =
            HZ.escapeHtml
              ? HZ.escapeHtml(
                  item.name || ""
                )
              : item.name || "";

          const image =
            HZ.escapeHtml
              ? HZ.escapeHtml(
                  item.image || ""
                )
              : item.image || "";

          return `
            <div class="cart-item">

              <div class="cart-top">

                <div class="cart-product">

                  <img
                    src="${image}"
                    alt="${name}"
                  >

                  <div>

                    <div class="cart-name">
                      ${name}
                    </div>

                    <div class="cart-price">
                      ${price.toFixed(2)} $
                    </div>

                  </div>

                </div>

                <button
                  type="button"
                  class="remove"
                  onclick="removeItem('${String(item.id)}')"
                  aria-label="حذف"
                >
                  ×
                </button>

              </div>

              <div class="qty">

                <button
                  type="button"
                  onclick="change('${String(item.id)}',1)"
                  ${
                    item.stock > 0 &&
                    quantity >= item.stock
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
                  onclick="change('${String(item.id)}',-1)"
                >
                  −
                </button>

              </div>

              <div class="item-total">
                ${total.toFixed(2)} $
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
      (Number(
        HZ.discountRate
      ) || 0);

    const delivery =
      subtotal > 0
        ? Number(
            HZ.DELIVERY_FEE
          ) || 0
        : 0;

    const total =
      subtotal -
      discount +
      delivery;

    if (subtotalEl) {

      subtotalEl.textContent =
        subtotal.toFixed(2) +
        " $";
    }

    if (discountEl) {

      discountEl.textContent =
        "-" +
        discount.toFixed(2) +
        " $";
    }

    if (deliveryEl) {

      deliveryEl.textContent =
        delivery.toFixed(2) +
        " $";
    }

    if (totalEl) {

      totalEl.textContent =
        total.toFixed(2) +
        " $";
    }
  };


  /* ---------------------------------
     Open cart
     --------------------------------- */

  window.openCart = () => {

    const overlay =
      document.getElementById(
        "overlay"
      );

    const cartPanel =
      document.getElementById(
        "cart"
      );

    if (overlay) {

      overlay.classList.add(
        "show"
      );
    }

    if (cartPanel) {

      cartPanel.classList.add(
        "open"
      );
    }

    document.body.classList.add(
      "cart-open"
    );

    window.renderCart();
  };


  /* ---------------------------------
     Close cart
     --------------------------------- */

  window.closeCart = () => {

    const overlay =
      document.getElementById(
        "overlay"
      );

    const cartPanel =
      document.getElementById(
        "cart"
      );

    if (overlay) {

      overlay.classList.remove(
        "show"
      );
    }

    if (cartPanel) {

      cartPanel.classList.remove(
        "open"
      );
    }

    document.body.classList.remove(
      "cart-open"
    );
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

      if (
        typeof window.showToast ===
        "function"
      ) {
        window.showToast(
          "تم تطبيق الخصم 10%"
        );
      }

    } else {

      HZ.discountRate =
        0;

      if (
        typeof window.showToast ===
        "function"
      ) {
        window.showToast(
          "كود الخصم غير صالح"
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

      document
        .querySelectorAll(
          "[data-cart-count]"
        )
        .forEach(
          element => {

            const count =
              HZ.getCartCount();

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
