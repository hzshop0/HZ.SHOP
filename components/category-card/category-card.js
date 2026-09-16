const CATEGORY_CARD = {

  create(category = {}) {

    const template =
      document.querySelector(
        "#categoryCardTemplate"
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
      category
    );


    return card;

  },


  update(
    card,
    category = {}
  ) {

    if (!card) return;


    const id =
      category.id ??
      category.categoryId ??
      "";


    card.dataset.categoryId =
      id;


    const link =
      card.querySelector(
        ".category-card-link"
      );


    const image =
      card.querySelector(
        ".category-card-img"
      );


    const title =
      card.querySelector(
        ".category-card-title"
      );


    const count =
      card.querySelector(
        ".category-card-count"
      );


    if (
      link &&
      id
    ) {

      link.href =
        `/pages/category/?id=${encodeURIComponent(id)}`;

    }


    if (image) {

      image.src =
        category.image || "";

      image.alt =
        category.name ||
        "HZ.shop category";

    }


    if (title) {

      title.textContent =
        category.name || "";

    }


    if (count) {

      const value =
        Number(
          category.productCount ??
          category.count
        );


      if (
        Number.isFinite(value) &&
        value > 0
      ) {

        count.textContent =
          `${UTILS.formatNumber(value)} منتج`;

        count.hidden =
          false;

      } else {

        count.hidden =
          true;

      }

    }

  }

};


window.CATEGORY_CARD =
  CATEGORY_CARD;
