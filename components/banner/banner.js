const BANNER = {

  create(banner = {}) {

    const template =
      document.querySelector(
        "#bannerTemplate"
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
      banner
    );


    return element;
  },


  update(
    element,
    banner = {}
  ) {

    if (!element) return;


    const id =
      banner.id ??
      banner.bannerId ??
      "";


    element.dataset.bannerId =
      id;


    const link =
      element.querySelector(
        ".store-banner-link"
      );


    const image =
      element.querySelector(
        ".store-banner-image"
      );


    if (link) {

      link.href =
        banner.link || "#";

    }


    if (image) {

      image.src =
        banner.image || "";

      image.alt =
        banner.alt ||
        banner.title ||
        "HZ.shop";

    }

  }

};


window.BANNER =
  BANNER;
