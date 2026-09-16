/**
 * HZ.SHOP
 * Dropdown Component
 */

const HZDropdown = {

    open(dropdown) {
        if (!dropdown) return;

        dropdown.classList.add("is-open");
        dropdown.setAttribute("aria-expanded", "true");
    },

    close(dropdown) {
        if (!dropdown) return;

        dropdown.classList.remove("is-open");
        dropdown.setAttribute("aria-expanded", "false");
    },

    toggle(dropdown) {
        if (!dropdown) return;

        if (dropdown.classList.contains("is-open")) {
            this.close(dropdown);
        } else {
            this.closeAll(dropdown);
            this.open(dropdown);
        }
    },

    closeAll(except = null) {
        document
            .querySelectorAll("[data-dropdown].is-open")
            .forEach((dropdown) => {
                if (dropdown !== except) {
                    this.close(dropdown);
                }
            });
    },

    init() {
        document.addEventListener("click", (event) => {

            const trigger =
                event.target.closest("[data-dropdown-toggle]");

            if (trigger) {
                const selector =
                    trigger.getAttribute("data-dropdown-toggle");

                const dropdown =
                    document.querySelector(selector);

                if (dropdown) {
                    this.toggle(dropdown);
                }

                return;
            }

            if (!event.target.closest("[data-dropdown]")) {
                this.closeAll();
            }
        });

        document.addEventListener("keydown", (event) => {

            if (event.key === "Escape") {
                this.closeAll();
            }
        });
    }
};

window.HZDropdown = HZDropdown;

document.addEventListener("DOMContentLoaded", () => {
    HZDropdown.init();
});
