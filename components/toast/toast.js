const TOAST = {
  active: null,
  timer: null,

  show(message = "", type = "default", duration = 3000) {

    if (!message) return;

    this.remove();


    const template =
      document.querySelector(
        "#toastTemplate"
      );

    if (!template) return;


    const toast =
      template.content
        .firstElementChild
        .cloneNode(true);


    const messageElement =
      toast.querySelector(
        "[data-toast-message]"
      );


    const iconElement =
      toast.querySelector(
        "[data-toast-icon]"
      );


    if (messageElement) {

      messageElement.textContent =
        message;

    }


    if (iconElement) {

      const icons = {
        success: "✓",
        error: "!",
        warning: "⚠",
        default: "✓"
      };

      iconElement.textContent =
        icons[type] || icons.default;

    }


    toast.dataset.type =
      type || "default";


    document.body.appendChild(
      toast
    );


    this.active =
      toast;


    this.timer =
      setTimeout(() => {

        this.remove();

      }, Math.max(1000, duration));

  },


  success(
    message,
    duration
  ) {

    this.show(
      message,
      "success",
      duration
    );

  },


  error(
    message,
    duration
  ) {

    this.show(
      message,
      "error",
      duration
    );

  },


  warning(
    message,
    duration
  ) {

    this.show(
      message,
      "warning",
      duration
    );

  },


  remove() {

    if (this.timer) {

      clearTimeout(
        this.timer
      );

      this.timer = null;

    }


    if (this.active) {

      this.active.remove();

      this.active = null;

    }

  }

};


window.TOAST =
  TOAST;
