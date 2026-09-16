const HZBottomNav = {

    init() {

        const container =
            document.getElementById(
                "bottom-navigation"
            );

        if (!container) return;


        if (
            !container.querySelector(
                "[data-bottom-nav]"
            )
        ) {

            container.innerHTML = `
                <div
                    class="bottom-nav"
                    data-bottom-nav
                    role="navigation"
                    aria-label="التنقل الرئيسي"
                >

                    <a
                        href="/"
                        class="bottom-nav-item"
                        data-nav-target="/"
                        aria-label="الرئيسية"
                    >
                        <span>⌂</span>
                        <small>الرئيسية</small>
                    </a>

                    <a
                        href="/pages/wishlist/"
                        class="bottom-nav-item"
                        data-nav-target="/pages/wishlist/"
                        aria-label="المفضلة"
                    >
                        <span>♡</span>
                        <small>المفضلة</small>
                    </a>

                    <a
                        href="/pages/cart/"
                        class="bottom-nav-item"
                        data-nav-target="/pages/cart/"
                        aria-label="السلة"
                    >
                        <span>🛒</span>
                        <small>السلة</small>
                    </a>

                    <a
                        href="/pages/notifications/"
                        class="bottom-nav-item"
                        data-nav-target="/pages/notifications/"
                        aria-label="الإشعارات"
                    >
                        <span>🔔</span>
                        <small>الإشعارات</small>
                    </a>

                    <a
                        href="/pages/account/"
                        class="bottom-nav-item"
                        data-nav-target="/pages/account/"
                        aria-label="حسابي"
                    >
                        <span>👤</span>
                        <small>حسابي</small>
                    </a>

                </div>
            `;
        }


        const nav =
            container.querySelector(
                "[data-bottom-nav]"
            );

        if (!nav) return;


        this.setActive();

        this.bindEvents(nav);

    },


    bindEvents(nav) {

        nav.addEventListener(
            "click",
            (event) => {

                const item =
                    event.target.closest(
                        "[data-nav-target]"
                    );

                if (
                    !item ||
                    !nav.contains(item)
                ) {
                    return;
                }

                this.setActive(item);

            }
        );

    },


    setActive(activeItem = null) {

        const nav =
            document.querySelector(
                "[data-bottom-nav]"
            );

        if (!nav) return;


        const currentPath =
            window.location.pathname;


        nav.querySelectorAll(
            "[data-nav-target]"
        ).forEach((item) => {

            const target =
                item.getAttribute(
                    "data-nav-target"
                );


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
                isActive
                    ? "page"
                    : "false"
            );

        });

    }

};


window.HZBottomNav =
    HZBottomNav;


document.addEventListener(
    "DOMContentLoaded",
    () => {

        HZBottomNav.init();

    }
);
