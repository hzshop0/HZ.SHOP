/**
 * HZ.SHOP
 * Modal Component
 */

const HZModal = {

    open(selector) {
        const modal = this.get(selector);

        if (!modal) return;

        modal.classList.add("is-open");
        modal.setAttribute("aria-hidden", "false");

        document.body.classList.add("modal-open");
    },

    close(selector) {
        const modal = this.get(selector);

        if (!modal) return;

        modal.classList.remove("is-open");
        modal.setAttribute("aria-hidden", "true");

        document.body.classList.remove("modal-open");
    },

    toggle(selector) {
        const modal = this.get(selector);

        if (!modal) return;

        if (modal.classList.contains("is-open")) {
            this.close(selector);
        } else {
            this.open(selector);
        }
    },

    get(selector) {
        if (selector instanceof HTMLElement) {
            return selector;
        }

        return document.querySelector(selector);
    },

    init() {
        document.addEventListener("click", (event) => {

            const closeButton = event.target.closest(
                "[data-modal-close]"
            );

            if (closeButton) {
                const modal = closeButton.closest(".modal");

                if (modal) {
                    this.close(modal);
                }

                return;
            }

            const modal = event.target.closest(".modal");

            if (
                modal &&
                event.target === modal &&
                modal.dataset.closeOnBackdrop !== "false"
            ) {
                this.close(modal);
            }
        });

        document.addEventListener("keydown", (event) => {

            if (event.key !== "Escape") return;

            const modal = document.querySelector(
                ".modal.is-open"
            );

            if (modal) {
                this.close(modal);
            }
        });
    }
};

window.HZModal = HZModal;

document.addEventListener("DOMContentLoaded", () => {
    HZModal.init();
});
