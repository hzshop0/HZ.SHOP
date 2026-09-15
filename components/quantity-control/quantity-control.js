const QUANTITY_CONTROL = {
  create(options = {}) {
    const template =
      document.querySelector(
        "#quantityControlTemplate"
      );

    if (!template) {
      return null;
    }

    const element =
      template.content
        .firstElementChild
        .cloneNode(true);

    this.update(element, options);
    this.bind(element, options);

    return element;
  },

  update(element, options = {}) {
    if (!element) return;

    const input =
      element.querySelector(
        "[data-quantity-input]"
      );

    if (!input) return;

    const min =
      Math.max(
        1,
        Number(options.min) || 1
      );

    const max =
      Number.isFinite(
        Number(options.max)
      )
        ? Math.max(
            min,
            Number(options.max)
          )
        : null;

    let value =
      Math.max(
        min,
        Number(options.value) || min
      );

    if (max !== null) {
      value = Math.min(
        max,
        value
      );
    }

    input.min = min;

    if (max !== null) {
      input.max = max;
    } else {
      input.removeAttribute("max");
    }

    input.value = value;
  },

  bind(element, options = {}) {
    const input =
      element.querySelector(
        "[data-quantity-input]"
      );

    const decrease =
      element.querySelector(
        "[data-quantity-decrease]"
      );

    const increase =
      element.querySelector(
        "[data-quantity-increase]"
      );

    if (!input) return;

    const min =
      Math.max(
        1,
        Number(options.min) || 1
      );

    const max =
      Number.isFinite(
        Number(options.max)
      )
        ? Math.max(
            min,
            Number(options.max)
          )
        : null;

    const emitChange = () => {
      let value =
        Number.parseInt(
          input.value,
          10
        );

      if (!Number.isFinite(value)) {
        value = min;
      }

      value = Math.max(
        min,
        value
      );

      if (max !== null) {
        value = Math.min(
          max,
          value
        );
      }

      input.value = value;

      if (
        typeof options.onChange ===
        "function"
      ) {
        options.onChange(value);
      }
    };

    if (decrease) {
      decrease.addEventListener(
        "click",
        () => {
          const current =
            Number.parseInt(
              input.value,
              10
            ) || min;

          input.value =
            Math.max(
              min,
              current - 1
            );

          emitChange();
        }
      );
    }

    if (increase) {
      increase.addEventListener(
        "click",
        () => {
          const current =
            Number.parseInt(
              input.value,
              10
            ) || min;

          const next =
            current + 1;

          input.value =
            max !== null
              ? Math.min(
                  max,
                  next
                )
              : next;

          emitChange();
        }
      );
    }

    input.addEventListener(
      "change",
      emitChange
    );

    input.addEventListener(
      "blur",
      emitChange
    );
  },

  getValue(element) {
    if (!element) return 1;

    const input =
      element.querySelector(
        "[data-quantity-input]"
      );

    if (!input) return 1;

    const value =
      Number.parseInt(
        input.value,
        10
      );

    return Number.isFinite(value)
      ? Math.max(1, value)
      : 1;
  },

  setValue(element, value) {
    if (!element) return;

    const input =
      element.querySelector(
        "[data-quantity-input]"
      );

    if (!input) return;

    input.value =
      Math.max(
        1,
        Number(value) || 1
      );

    input.dispatchEvent(
      new Event("change")
    );
  }
};
