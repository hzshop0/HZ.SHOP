const PRODUCT_GALLERY = {
  create(images = [], options = {}) {
    const template =
      document.querySelector(
        "#productGalleryTemplate"
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
      images,
      options
    );

    return element;
  },

  update(
    element,
    images = [],
    options = {}
  ) {
    if (!element) return;

    const normalized =
      this.normalizeImages(images);

    element._galleryImages =
      normalized;

    element._galleryIndex = 0;

    element._galleryOptions =
      options || {};

    this.render(element);
    this.bind(element);
  },

  normalizeImages(images = []) {
    if (!Array.isArray(images)) {
      images = [images];
    }

    return images
      .map((image) => {
        if (
          typeof image ===
          "string"
        ) {
          return {
            src: image,
            alt: "HZ.shop product"
          };
        }

        if (
          image &&
          typeof image ===
            "object"
        ) {
          return {
            src:
              image.src ||
              image.image ||
              image.url ||
              "",
            alt:
              image.alt ||
              image.name ||
              "HZ.shop product"
          };
        }

        return null;
      })
      .filter(
        (image) =>
          image &&
          image.src
      );
  },

  render(element) {
    const images =
      element._galleryImages ||
      [];

    const index =
      Math.min(
        Math.max(
          0,
          Number(
            element._galleryIndex
          ) || 0
        ),
        Math.max(
          0,
          images.length - 1
        )
      );

    element._galleryIndex =
      index;

    const mainImage =
      element.querySelector(
        "[data-gallery-main-image]"
      );

    const thumbnails =
      element.querySelector(
        "[data-gallery-thumbnails]"
      );

    const previous =
      element.querySelector(
        "[data-gallery-prev]"
      );

    const next =
      element.querySelector(
        "[data-gallery-next]"
      );

    if (mainImage) {
      const current =
        images[index];

      if (current) {
        mainImage.src =
          current.src;

        mainImage.alt =
          current.alt;
      } else {
        mainImage.removeAttribute(
          "src"
        );

        mainImage.alt = "";
      }
    }

    if (thumbnails) {
      thumbnails.innerHTML =
        "";

      images.forEach(
        (image, imageIndex) => {
          const button =
            document.createElement(
              "button"
            );

          button.type =
            "button";

          button.className =
            "product-gallery-thumbnail";

          button.setAttribute(
            "role",
            "listitem"
          );

          button.setAttribute(
            "aria-label",
            `عرض الصورة ${
              imageIndex + 1
            }`
          );

          if (
            imageIndex ===
            index
          ) {
            button.classList.add(
              "active"
            );

            button.setAttribute(
              "aria-current",
              "true"
            );
          }

          const thumbnail =
            document.createElement(
              "img"
            );

          thumbnail.src =
            image.src;

          thumbnail.alt =
            image.alt;

          thumbnail.loading =
            "lazy";

          button.appendChild(
            thumbnail
          );

          button.addEventListener(
            "click",
            () => {
              this.goTo(
                element,
                imageIndex
              );
            }
          );

          thumbnails.appendChild(
            button
          );
        }
      );
    }

    const hasMultiple =
      images.length > 1;

    if (previous) {
      previous.hidden =
        !hasMultiple;
    }

    if (next) {
      next.hidden =
        !hasMultiple;
    }
  },

  bind(element) {
    if (!element) return;

    const previous =
      element.querySelector(
        "[data-gallery-prev]"
      );

    const next =
      element.querySelector(
        "[data-gallery-next]"
      );

    if (previous) {
      previous.addEventListener(
        "click",
        () => {
          this.previous(element);
        }
      );
    }

    if (next) {
      next.addEventListener(
        "click",
        () => {
          this.next(element);
        }
      );
    }
  },

  goTo(element, index) {
    if (!element) return;

    const images =
      element._galleryImages ||
      [];

    if (!images.length) return;

    const target =
      Number(index);

    if (
      !Number.isInteger(
        target
      ) ||
      target < 0 ||
      target >= images.length
    ) {
      return;
    }

    element._galleryIndex =
      target;

    this.render(element);

    const options =
      element._galleryOptions ||
      {};

    if (
      typeof options.onChange ===
      "function"
    ) {
      options.onChange(
        target,
        images[target]
      );
    }
  },

  next(element) {
    if (!element) return;

    const images =
      element._galleryImages ||
      [];

    if (images.length <= 1) {
      return;
    }

    const current =
      Number(
        element._galleryIndex
      ) || 0;

    const next =
      (current + 1) %
      images.length;

    this.goTo(
      element,
      next
    );
  },

  previous(element) {
    if (!element) return;

    const images =
      element._galleryImages ||
      [];

    if (images.length <= 1) {
      return;
    }

    const current =
      Number(
        element._galleryIndex
      ) || 0;

    const previous =
      (current - 1 +
        images.length) %
      images.length;

    this.goTo(
      element,
      previous
    );
  },

  getCurrentIndex(element) {
    if (!element) return 0;

    return (
      Number(
        element._galleryIndex
      ) || 0
    );
  },

  getCurrentImage(element) {
    if (!element) return null;

    const images =
      element._galleryImages ||
      [];

    const index =
      this.getCurrentIndex(
        element
      );

    return images[index] || null;
  }
};
