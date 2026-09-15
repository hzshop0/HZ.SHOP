const EMPTY_STATE = {
  create(options = {}) {
    const template =
      document.querySelector(
        "#emptyStateTemplate"
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
      options
    );

    return element;
  },

  update(element, options = {}) {
    if (!element) return;

    const title =
      element.querySelector(
        ".empty-state-title"
      );

    const message =
      element.querySelector(
        ".empty-state-message"
      );

    const action =
      element.querySelector(
        ".empty-state-action"
      );

    if (title) {
      title.textContent =
        options.title ||
        "لا توجد بيانات";
    }

    if (message) {
      if (options.message) {
        message.textContent =
          options.message;

        message.hidden = false;
      } else {
        message.hidden = true;
      }
    }

    if (action) {
      if (options.actionText) {
        action.textContent =
          options.actionText;

        action.hidden = false;

        action.onclick =
          typeof options.onAction ===
          "function"
            ? options.onAction
            : null;
      } else {
        action.hidden = true;
      }
    }
  },

  render(container, options = {}) {
    if (!container) return;

    const element =
      this.create(options);

    if (!element) return;

    container.innerHTML = "";

    container.appendChild(element);
  }
};
