const PRODUCT_CARD = {

  async init() {

    if (
      document.querySelector(
        "#productCardTemplate"
      )
    ) {
      return;
    }

    try {

      const response =
        await fetch(
          "/components/product-card/product-card.html"
        );

      if (!response.ok) {
        throw new Error(
          "Failed to load product card template"
        );
      }

      const html =
        await response.text();

      const wrapper =
        document.createElement("div");

      wrapper.innerHTML = html;

      const template =
        wrapper.querySelector(
          "#productCardTemplate"
        );

      if (template) {

        document.body.appendChild(
          template
        );

      }

    } catch (error) {

      console.error(
        "HZ.SHOP Product Card:",
        error
      );

    }

  },


  create(product = {}) {

    const template =
      document.querySelector(
        "#productCardTemplate"
      );

    if (!template) {
      return null;
    }

    const card =
      template.content
        .firstElementChild
        .cloneNode(true);

    this.update(
      card,
      product
    );

    return card;

  },


  update(card, product = {}) {

    if (!card) {
      return;
    }

    const id =
      product.id ??
      product.productId ??
      "";

    card.dataset.productId =
      String(id);


    const link =
      card.querySelector(
        ".product-card-link"
      );

    const image =
      card.querySelector(
        ".product-card-img"
      );

    const title =
      card.querySelector(
        ".product-card-title"
      );

    const currentPrice =
      card.querySelector(
        ".product-card-current-price"
      );

    const oldPrice =
      card.querySelector(
        ".product-card-old-price"
      );

    const discount =
      card.querySelector(
        ".product-card-discount"
      );

    const rating =
      card.querySelector(
        ".product-card-rating-value"
      );

    const sales =
      card.querySelector(
        ".product-card-sales"
      );


    if (link) {

      if (id !== "") {

        link.href =
          `/pages/product/?id=${encodeURIComponent(id)}`;

        link.removeAttribute(
          "aria-disabled"
        );

      } else {

        link.removeAttribute(
          "href"
        );

        link.setAttribute(
          "aria-disabled",
          "true"
        );

      }

    }


    if (image) {

      const imageSource =
        product.image ||
        product.imageUrl ||
        product.thumbnail ||
        "";

      image.src =
        imageSource;

      image.alt =
        product.name ||
        product.title ||
        "HZ.SHOP product";

      image.loading =
        image.loading ||
        "lazy";

      image.decoding =
        "async";

      if (!image.dataset.fallbackBound) {

        image.addEventListener(
          "error",
          () => {

            if (
              image.dataset.fallbackApplied
            ) {
              return;
            }

            image.dataset.fallbackApplied =
              "true";

            image.removeAttribute(
              "src"
            );

            image.classList.add(
              "is-image-missing"
            );

          }
        );

        image.dataset.fallbackBound =
          "true";

      }

    }


    if (title) {

      title.textContent =
        product.name ||
        product.title ||
        "";

    }


    if (currentPrice) {

      const price =
        Number(
          product.price
        );

      if (
        Number.isFinite(price)
      ) {

        currentPrice.textContent =
          this.formatPrice(price);

        currentPrice.hidden =
          false;

      } else {

        currentPrice.textContent =
          "";

        currentPrice.hidden =
          true;

      }

    }


    if (oldPrice) {

      const price =
        Number(
          product.price
        );

      const oldValue =
        Number(
          product.oldPrice
        );

      if (
        Number.isFinite(oldValue) &&
        oldValue > 0 &&
        (
          !Number.isFinite(price) ||
          oldValue > price
        )
      ) {

        oldPrice.textContent =
          this.formatPrice(oldValue);

        oldPrice.hidden =
          false;

      } else {

        oldPrice.textContent =
          "";

        oldPrice.hidden =
          true;

      }

    }


    if (discount) {

      let discountValue =
        Number(
          product.discount
        );

      if (
        !Number.isFinite(discountValue) ||
        discountValue <= 0
      ) {

        const price =
          Number(
            product.price
          );

        const oldValue =
          Number(
            product.oldPrice
          );

        if (
          Number.isFinite(price) &&
          Number.isFinite(oldValue) &&
          oldValue > price &&
          oldValue > 0
        ) {

          discountValue =
            Math.round(
              (
                (oldValue - price) /
                oldValue
              ) * 100
            );

        }

      }

      if (
        Number.isFinite(discountValue) &&
        discountValue > 0
      ) {

        discount.textContent =
          `-${Math.round(discountValue)}%`;

        discount.hidden =
          false;

      } else {

        discount.textContent =
          "";

        discount.hidden =
          true;

      }

    }


    if (rating) {

      const value =
        Number(
          product.rating
        );

      if (
        Number.isFinite(value) &&
        value > 0
      ) {

        rating.textContent =
          value.toFixed(1);

        rating.hidden =
          false;

      } else {

        rating.textContent =
          "";

        rating.hidden =
          true;

      }

    }


    if (sales) {

      const value =
        Number(
          product.sales
        );

      if (
        Number.isFinite(value) &&
        value > 0
      ) {

        sales.textContent =
          `${this.formatNumber(value)} مبيع`;

        sales.hidden =
          false;

      } else {

        sales.textContent =
          "";

        sales.hidden =
          true;

      }

    }


    this.bind(
      card,
      product
    );

  },


  bind(card, product = {}) {

    if (!card) {
      return;
    }

    if (
      card.dataset.eventsBound ===
      "true"
    ) {
      return;
    }

    const wishlistButton =
      card.querySelector(
        ".product-card-wishlist"
      );

    const cartButton =
      card.querySelector(
        ".product-card-cart"
      );


    if (wishlistButton) {

      wishlistButton.type =
        "button";

      wishlistButton.setAttribute(
        "aria-label",
        wishlistButton.getAttribute(
          "aria-label"
        ) ||
        "إضافة إلى المفضلة"
      );

      wishlistButton.addEventListener(
        "click",
        (event) => {

          event.preventDefault();
          event.stopPropagation();

          if (
            window.HZFavorites &&
            typeof window.HZFavorites.toggle ===
            "function"
          ) {

            window.HZFavorites.toggle(
              product
            );

          } else {

            card.dispatchEvent(
              new CustomEvent(
                "hz:favorite-toggle",
                {
                  bubbles: true,
                  detail: {
                    product
                  }
                }
              )
            );

          }

        }
      );

    }


    if (cartButton) {

      cartButton.type =
        "button";

      cartButton.setAttribute(
        "aria-label",
        cartButton.getAttribute(
          "aria-label"
        ) ||
        "إضافة إلى السلة"
      );

      cartButton.addEventListener(
        "click",
        (event) => {

          event.preventDefault();
          event.stopPropagation();

          if (
            window.HZCart &&
            typeof window.HZCart.add ===
            "function"
          ) {

            window.HZCart.add(
              product
            );

          } else {

            card.dispatchEvent(
              new CustomEvent(
                "hz:cart-add",
                {
                  bubbles: true,
                  detail: {
                    product
                  }
                }
              )
            );

          }

        }
      );

    }


    card.dataset.eventsBound =
      "true";

  },


  formatPrice(value) {

    if (
      window.UTILS &&
      typeof window.UTILS.formatPrice ===
      "function"
    ) {

      return window.UTILS.formatPrice(
        value
      );

    }

    const number =
      Number(value);

    if (
      !Number.isFinite(number)
    ) {
      return "";
    }

    return `$${number.toFixed(2)}`;

  },


  formatNumber(value) {

    if (
      window.UTILS &&
      typeof window.UTILS.formatNumber ===
      "function"
    ) {

      return window.UTILS.formatNumber(
        value
      );

    }

    const number =
      Number(value);

    if (
      !Number.isFinite(number)
    ) {
      return "0";
    }

    return number.toLocaleString(
      "ar-LB"
    );

  }

};


window.PRODUCT_CARD =
  PRODUCT_CARD;


if (
  document.readyState ===
  "loading"
) {

  document.addEventListener(
    "DOMContentLoaded",
    () => {

      PRODUCT_CARD.init();

    },
    {
      once: true
    }
  );

} else {

  PRODUCT_CARD.init();

}
