const PRICE_DISPLAY = {

  create(
    price = 0,
    options = {}
  ) {

    const template =
      document.querySelector(
        "#priceDisplayTemplate"
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
      price,
      options
    );


    return element;

  },


  update(
    element,
    price = 0,
    options = {}
  ) {

    if (!element) return;


    const current =
      element.querySelector(
        "[data-price-current]"
      );


    const oldPrice =
      element.querySelector(
        "[data-price-old]"
      );


    const discount =
      element.querySelector(
        "[data-price-discount]"
      );


    const currentValue =
      Number(price) || 0;


    if (current) {

      current.textContent =
        UTILS.formatPrice(
          currentValue
        );

    }


    const oldValue =
      Number(
        options.oldPrice
      );


    if (
      oldPrice &&
      Number.isFinite(oldValue) &&
      oldValue > currentValue
    ) {

      oldPrice.textContent =
        UTILS.formatPrice(
          oldValue
        );


      oldPrice.hidden =
        false;

    } else if (oldPrice) {

      oldPrice.hidden =
        true;

    }


    let discountValue =
      Number(
        options.discount
      );


    if (
      !Number.isFinite(
        discountValue
      ) &&
      Number.isFinite(oldValue) &&
      oldValue > currentValue &&
      oldValue > 0
    ) {

      discountValue =
        Math.round(
          (
            (oldValue -
              currentValue) /
            oldValue
          ) *
          100
        );

    }


    if (
      discount &&
      Number.isFinite(
        discountValue
      ) &&
      discountValue > 0
    ) {

      discount.textContent =
        `-${Math.round(
          discountValue
        )}%`;


      discount.hidden =
        false;

    } else if (discount) {

      discount.hidden =
        true;

    }

  }

};


window.PRICE_DISPLAY =
  PRICE_DISPLAY;
