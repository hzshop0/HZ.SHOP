const RATING = {

  create(value = 0, count = 0) {

    const template =
      document.querySelector(
        "#ratingTemplate"
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
      value,
      count
    );

    return element;
  },


  update(
    element,
    value = 0,
    count = 0
  ) {

    if (!element) return;


    const stars =
      element.querySelector(
        "[data-rating-stars]"
      );


    const ratingValue =
      element.querySelector(
        "[data-rating-value]"
      );


    const ratingCount =
      element.querySelector(
        "[data-rating-count]"
      );


    const rating =
      Math.min(
        5,
        Math.max(
          0,
          Number(value) || 0
        )
      );


    if (stars) {

      const fullStars =
        Math.round(rating);

      stars.textContent =
        "★".repeat(fullStars) +
        "☆".repeat(
          5 - fullStars
        );

    }


    if (ratingValue) {

      ratingValue.textContent =
        rating > 0
          ? rating.toFixed(1)
          : "";

    }


    if (ratingCount) {

      const total =
        Number(count) || 0;

      ratingCount.textContent =
        total > 0
          ? `(${UTILS.formatNumber(total)})`
          : "";

    }

  }

};


window.RATING =
  RATING;
