/**
 * HZ.SHOP
 * Toast Component
 */

const HZToast = {

    show(message, type = "default", duration = 3000) {
        if (!message) return;

        const container = this.getContainer();

        const toast = document.createElement("div");

        toast.className = `hz-toast hz-toast-${type}`;
        toast.setAttribute("role", "status");
        toast.setAttribute("aria-live", "polite");

        toast.textContent = message;

        container.appendChild(toast);

        requestAnimationFrame(() => {
            toast.classList.add("is-visible");
        });

        setTimeout(() => {
            toast.classList.remove("is-visible");

            setTimeout(() => {
                toast.remove();
            }, 300);
        }, duration);
    },

    success(message, duration) {
        this.show(message, "success", duration);
    },

    error(message, duration) {
        this.show(message, "error", duration);
    },

    warning(message, duration) {
        this.show(message, "warning", duration);
    },

    info(message, duration) {
        this.show(message, "info", duration);
    },

    getContainer() {
        let container =
            document.querySelector(".hz-toast-container");

        if (!container) {
            container = document.createElement("div");

            container.className = "hz-toast-container";

            container.setAttribute("aria-live", "polite");

            document.body.appendChild(container);
        }

        return container;
    }
};

window.HZToast = HZToast;
