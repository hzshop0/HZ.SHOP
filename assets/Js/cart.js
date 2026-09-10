/* =================================
   HZ.SHOP — Cart
   Local shopping cart management
   ================================= */

(() => {
  "use strict";

  window.HZ = window.HZ || {};

  HZ.CART_KEY = HZ.CART_KEY || "hz_cart";
  HZ.cart = [];

  /* ---------------------------------
     Load cart
     --------------------------------- */

  HZ.loadCart = () => {
    const cart = HZ.storageGetJSON(
      HZ.CART_KEY,
      []
    );

    HZ.cart = Array.isArray(cart)
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
      new CustomEvent("hz:cart-updated", {
        detail: {
          cart: HZ.cart
        }
      })
    );

    return HZ.cart;
  };

  /* ---------------------------------
     Find item
     --------------------------------- */

  HZ.getCartItem = (productId) => {
    return HZ.cart.find(
      item =>
        String(item.id) === String(productId)
    ) || null;
  };

  /* ---------------------------------
     Add product
     --------------------------------- */

  HZ.addToCart = (
    product,
    quantity = 1
  ) => {
    if (!product || product.id == null) {
      return false;
    }

    const qty = Math.max(
      1,
      Math.floor(HZ.toNumber(quantity, 1))
    );

    const stock = Math.max(
      0,
      Math.floor(HZ.toNumber(product.stock, 0))
    );

    if (stock <= 0) {
      return false;
    }

    const existing =
      HZ.getCartItem(product.id);

    if (existing) {
      existing.quantity = Math.min(
        existing.quantity + qty,
        stock
      );

      existing.price =
        HZ.toNumber(product.price, existing.price);

      existing.name =
        product.name || existing.name;

      existing.image =
        product.image || existing.image;

      existing.stock = stock;
    } else {
      HZ.cart.push({
        id: product.id,
        name: product.name || "",
        price: HZ.toNumber(product.price, 0),
        image: product.image || "",
        quantity: Math.min(qty, stock),
        stock
      });
    }

    HZ.saveCart();
    return true;
  };

  /* ---------------------------------
     Remove item
     --------------------------------- */

  HZ.removeFromCart = (productId) => {
    const before = HZ.cart.length;

    HZ.cart = HZ.cart.filter(
      item =>
        String(item.id) !== String(productId)
    );

    if (HZ.cart.length !== before) {
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
      HZ.getCartItem(productId);

    if (!item) {
      return false;
    }

    let qty = Math.floor(
      HZ.toNumber(quantity, 1)
    );

    const stock = Math.max(
      0,
      Math.floor(
        HZ.toNumber(item.stock, 0)
      )
    );

    if (qty <= 0) {
      HZ.removeFromCart(productId);
      return true;
    }

    if (stock > 0) {
      qty = Math.min(qty, stock);
    }

    item.quantity = qty;

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
      HZ.getCartItem(productId);

    if (!item) {
      return false;
    }

    return HZ.updateCartQuantity(
      productId,
      item.quantity + 1
    );
  };

  /* ---------------------------------
     Decrease quantity
     --------------------------------- */

  HZ.decreaseCartQuantity = (
    productId
  ) => {
    const item =
      HZ.getCartItem(productId);

    if (!item) {
      return false;
    }

    return HZ.updateCartQuantity(
      productId,
      item.quantity - 1
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
      (total, item) =>
        total +
        Math.max(
          0,
          HZ.toNumber(item.quantity, 0)
        ),
      0
    );
  };

  /* ---------------------------------
     Cart subtotal
     --------------------------------- */

  HZ.getCartSubtotal = () => {
    return HZ.cart.reduce(
      (total, item) => {
        const price =
          HZ.toNumber(item.price, 0);

        const quantity =
          Math.max(
            0,
            HZ.toNumber(item.quantity, 0)
          );

        return total + price * quantity;
      },
      0
    );
  };

  /* ---------------------------------
     Initialize
     --------------------------------- */

  HZ.loadCart();

})();
