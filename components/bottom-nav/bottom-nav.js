const HZBottomNav = {

    init() {
        const nav = document.querySelector("[data-bottom-nav]");

        if (!nav) return;

        this.setActive();
        this.bindEvents(nav);
    },

    bindEvents(nav) {
        nav.addEventListener("click", (event) => {
            const item = event.target.closest("[data-nav-target]");

            if (!item || !nav.contains(item)) return;

            this.setActive(item);
        });
    },

    setActive(activeItem = null) {
        const nav = document.querySelector("[data-bottom-nav]");

        if (!nav) return;

        const currentPath =
            window.location.pathname;

        nav.querySelectorAll("[data-nav-target]")
            .forEach((item) => {

                const target =
                    item.getAttribute("data-nav-target");

                const isActive =
                    activeItem
                        ? item === activeItem
                        : target === currentPath ||
                          (
                              target === "/" &&
                              currentPath === "/"
                          );

                item.classList.toggle(
                    "is-active",
                    isActive
                );

                item.setAttribute(
                    "aria-current",
                    isActive ? "page" : "false"
                );
            });
    }
};

window.HZBottomNav = HZBottomNav;

document.addEventListener("DOMContentLoaded", () => {
    HZBottomNav.init();
});
