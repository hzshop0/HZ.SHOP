const CART_ITEM = {

  create(item = {}) {

    const template =
      document.querySelector(
        "#cartItemTemplate"
      );

    if (!template) {
      return null;
    }


    const element =
      template.content
        .firstElementChild
        .cloneNode(true);


    this.update(
      element,
      item
    );


    return element;

  },


  update(
    element,
    item = {}
  ) {

    if (!element) return;


    const product =
      item.product ||
      item;


    const id =
      item.id ??
      item.productId ??
      product.id ??
      product.productId ??
      "";


    const quantity =
      Math.max(
        1,
        Number(
          item.quantity ??
          item.qty ??
          1
        ) || 1
      );


    const price =
      Number(
        item.price ??
        product.price ??
        0
      ) || 0;


    const total =
      price * quantity;


    element.dataset.cartItemId =
      id;


    const image =
      element.querySelector(
        ".cart-item-img"
      );


    const title =
      element.querySelector(
        ".cart-item-title"
      );


    const priceElement =
      element.querySelector(
        ".cart-item-price"
      );


    const quantityElement =
      element.querySelector(
        ".cart-item-quantity"
      );


    const totalElement =
      element.querySelector(
        ".cart-item-total"
      );


    if (image) {

      image.src =
        item.image ||
        product.image ||
        "";

      image.alt =
        item.name ||
        product.name ||
        "HZ.shop product";

    }


    if (title) {

      title.textContent =
        item.name ||
        product.name ||
        "";


      if (id) {

        title.href =
          `/pages/product/?id=${encodeURIComponent(id)}`;

      }

    }


    if (priceElement) {

      priceElement.textContent =
        UTILS.formatPrice(
          price
        );

    }


    if (quantityElement) {

      quantityElement.textContent =
        quantity;

    }


    if (totalElement) {

      totalElement.textContent =
        UTILS.formatPrice(
          total
        );

    }


    this.bind(
      element,
      id,
      quantity
    );

  },


  bind(
    element,
    id,
    quantity
  ) {

    const decrease =
      element.querySelector(
        ".cart-item-decrease"
      );


    const increase =
      element.querySelector(
        ".cart-item-increase"
      );


    const remove =
      element.querySelector(
        ".cart-item-remove"
      );


    if (decrease) {

      decrease.addEventListener(
        "click",
        (event) => {

          event.preventDefault();


          if (
            window.HZCart &&
            typeof HZCart.updateQuantity ===
              "function"
          ) {

            HZCart.updateQuantity(
              id,
              Math.max(
                1,
                quantity - 1
              )
            );

          }

        }
      );

    }


    if (increase) {

      increase.addEventListener(
        "click",
        (event) => {

          event.preventDefault();


          if (
            window.HZCart &&
            typeof HZCart.updateQuantity ===
              "function"
          ) {

            HZCart.updateQuantity(
              id,
              quantity + 1
            );

          }

        }
      );

    }


    if (remove) {

      remove.addEventListener(
        "click",
        (event) => {

          event.preventDefault();


          if (
            window.HZCart &&
            typeof HZCart.remove ===
              "function"
          ) {

            HZCart.remove(
              id
            );

          }

        }
      );

    }

  }

};


window.CART_ITEM =
  CART_ITEM;
