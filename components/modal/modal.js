const MODAL = {

  active: null,


  create(options = {}) {

    const template =
      document.querySelector(
        "#modalTemplate"
      );


    if (!template) {
      return null;
    }


    const modal =
      template.content
        .firstElementChild
        .cloneNode(true);


    const title =
      modal.querySelector(
        ".store-modal-title"
      );


    const content =
      modal.querySelector(
        "[data-modal-content]"
      );


    if (title) {

      title.textContent =
        options.title || "";

    }


    if (content) {

      content.innerHTML =
        options.content || "";

    }


    this.bind(modal);


    return modal;

  },


  bind(modal) {

    if (!modal) return;


    const closeButtons =
      modal.querySelectorAll(
        "[data-modal-close]"
      );


    closeButtons.forEach(
      (button) => {

        button.addEventListener(
          "click",
          () => {

            this.close(
              modal
            );

          }
        );

      }
    );

  },


  open(options = {}) {

    const modal =
      this.create(
        options
      );


    if (!modal) {
      return null;
    }


    document.body.appendChild(
      modal
    );


    modal.hidden =
      false;


    this.active =
      modal;


    document.body.style.overflow =
      "hidden";


    return modal;

  },


  close(
    modal = this.active
  ) {

    if (!modal) return;


    modal.remove();


    if (
      this.active ===
      modal
    ) {

      this.active =
        null;

    }


    if (!this.active) {

      document.body.style.overflow =
        "";

    }

  },


  closeActive() {

    this.close(
      this.active
    );

  }

};


window.MODAL =
  MODAL;


document.addEventListener(
  "keydown",
  (event) => {

    if (
      event.key ===
        "Escape" &&
      MODAL.active
    ) {

      MODAL.closeActive();

    }

  }
);
