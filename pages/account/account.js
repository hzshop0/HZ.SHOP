/* =========================================================
   HZ.SHOP
   Account Page
   ========================================================= */

const ACCOUNT_PAGE = {

    currentSection: "overview",

    init() {

        this.bindAuth();

        this.bindNavigation();

        this.bindActions();

        this.loadCustomer();

        this.updateCounters();

        this.renderCart();

        this.renderFavorites();

        this.renderRecent();

        this.renderNotifications();

    },


    /* =====================================================
       AUTH
       ===================================================== */

    bindAuth() {

        const loginForm =
            document.getElementById(
                "account-login-form"
            );

        const registerForm =
            document.getElementById(
                "account-register-form"
            );

        const registerButton =
            document.getElementById(
                "account-register-button"
            );

        const backLoginButton =
            document.getElementById(
                "account-back-login-button"
            );

        if (loginForm) {

            loginForm.addEventListener(
                "submit",
                event => {

                    event.preventDefault();

                    this.login();

                }
            );

        }


        if (registerForm) {

            registerForm.addEventListener(
                "submit",
                event => {

                    event.preventDefault();

                    this.register();

                }
            );

        }


        if (registerButton) {

            registerButton.addEventListener(
                "click",
                () => {

                    this.showRegister();

                }
            );

        }


        if (backLoginButton) {

            backLoginButton.addEventListener(
                "click",
                () => {

                    this.showLogin();

                }
            );

        }

    },


    async login() {

        const phone =
            document.getElementById(
                "account-login-phone"
            )?.value.trim() || "";

        const password =
            document.getElementById(
                "account-login-password"
            )?.value || "";


        if (!phone || !password) {

            this.showError(
                "account-login-error",
                "يرجى إدخال رقم الهاتف وكلمة المرور."
            );

            return;

        }


        this.clearError(
            "account-login-error"
        );


        try {

            let result = null;


            if (
                typeof HZCustomer !== "undefined"
            ) {

                if (
                    typeof HZCustomer.login ===
                    "function"
                ) {

                    result =
                        await HZCustomer.login(
                            {
                                phone,
                                password
                            }
                        );

                } else if (
                    typeof HZCustomer.signIn ===
                    "function"
                ) {

                    result =
                        await HZCustomer.signIn(
                            {
                                phone,
                                password
                            }
                        );

                }

            }


            if (
                result === false
            ) {

                throw new Error(
                    "بيانات تسجيل الدخول غير صحيحة."
                );

            }


            this.loadCustomer();

            this.showDashboard();

            this.showSuccess(
                "تم تسجيل الدخول بنجاح."
            );


        } catch (error) {

            console.error(
                "HZ.SHOP Account Login:",
                error
            );

            this.showError(
                "account-login-error",
                error?.message ||
                "تعذر تسجيل الدخول حالياً."
            );

        }

    },


    async register() {

        const name =
            document.getElementById(
                "account-register-name"
            )?.value.trim() || "";

        const phone =
            document.getElementById(
                "account-register-phone"
            )?.value.trim() || "";

        const email =
            document.getElementById(
                "account-register-email"
            )?.value.trim() || "";

        const password =
            document.getElementById(
                "account-register-password"
            )?.value || "";


        if (!name || !phone || !password) {

            this.showError(
                "account-register-error",
                "يرجى إدخال الاسم ورقم الهاتف وكلمة المرور."
            );

            return;

        }


        this.clearError(
            "account-register-error"
        );


        try {

            let result = null;


            if (
                typeof HZCustomer !== "undefined"
            ) {

                if (
                    typeof HZCustomer.register ===
                    "function"
                ) {

                    result =
                        await HZCustomer.register(
                            {
                                name,
                                phone,
                                email,
                                password
                            }
                        );

                } else if (
                    typeof HZCustomer.signup ===
                    "function"
                ) {

                    result =
                        await HZCustomer.signup(
                            {
                                name,
                                phone,
                                email,
                                password
                            }
                        );

                }

            }


            if (
                result === false
            ) {

                throw new Error(
                    "تعذر إنشاء الحساب."
                );

            }


            this.loadCustomer();

            this.showDashboard();

            this.showSuccess(
                "تم إنشاء الحساب بنجاح."
            );


        } catch (error) {

            console.error(
                "HZ.SHOP Account Register:",
                error
            );

            this.showError(
                "account-register-error",
                error?.message ||
                "تعذر إنشاء الحساب حالياً."
            );

        }

    },


    logout() {

        try {

            if (
                typeof HZCustomer !==
                "undefined"
            ) {

                if (
                    typeof HZCustomer.logout ===
                    "function"
                ) {

                    HZCustomer.logout();

                } else if (
                    typeof HZCustomer.signOut ===
                    "function"
                ) {

                    HZCustomer.signOut();

                }

            }

        } catch (error) {

            console.error(
                "HZ.SHOP Account Logout:",
                error
            );

        }


        this.showLogin();

        this.showSuccess(
            "تم تسجيل الخروج."
        );

    },


    loadCustomer() {

        let customer = null;


        if (
            typeof HZCustomer !==
            "undefined"
        ) {

            if (
                typeof HZCustomer.getCurrent ===
                "function"
            ) {

                customer =
                    HZCustomer.getCurrent();

            } else if (
                typeof HZCustomer.getCustomer ===
                "function"
            ) {

                customer =
                    HZCustomer.getCustomer();

            } else if (
                HZCustomer.current
            ) {

                customer =
                    HZCustomer.current;

            }

        }


        if (
            !customer &&
            typeof APP_STATE !==
            "undefined"
        ) {

            customer =
                APP_STATE.customer;

        }


        if (
            customer &&
            typeof customer === "object"
        ) {

            this.customer =
                customer;

            this.showDashboard();

            this.renderCustomer(
                customer
            );

        } else {

            this.customer =
                null;

            this.showLogin();

        }

    },


    renderCustomer(customer) {

        const name =
            document.getElementById(
                "account-customer-name"
            );

        const phone =
            document.getElementById(
                "account-customer-phone"
            );

        const email =
            document.getElementById(
                "account-customer-email"
            );


        if (name) {

            name.textContent =
                customer.name ||
                customer.fullName ||
                "مرحباً بك";

        }


        if (phone) {

            phone.textContent =
                customer.phone ||
                "";

        }


        if (email) {

            email.textContent =
                customer.email ||
                "";

            email.hidden =
                !customer.email;

        }

    },


    showLogin() {

        const auth =
            document.getElementById(
                "account-auth"
            );

        const register =
            document.getElementById(
                "account-register"
            );

        const dashboard =
            document.getElementById(
                "account-dashboard"
            );


        if (auth) auth.hidden = false;

        if (register) register.hidden = true;

        if (dashboard) dashboard.hidden = true;

    },


    showRegister() {

        const auth =
            document.getElementById(
                "account-auth"
            );

        const register =
            document.getElementById(
                "account-register"
            );

        const dashboard =
            document.getElementById(
                "account-dashboard"
            );


        if (auth) auth.hidden = true;

        if (register) register.hidden = false;

        if (dashboard) dashboard.hidden = true;

    },


    showDashboard() {

        const auth =
            document.getElementById(
                "account-auth"
            );

        const register =
            document.getElementById(
                "account-register"
            );

        const dashboard =
            document.getElementById(
                "account-dashboard"
            );


        if (auth) auth.hidden = true;

        if (register) register.hidden = true;

        if (dashboard) dashboard.hidden = false;

    },


    /* =====================================================
       NAVIGATION
       ===================================================== */

    bindNavigation() {

        const buttons =
            document.querySelectorAll(
                "[data-account-section]"
            );


        buttons.forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        const section =
                            button.dataset
                                .accountSection;

                        this.showSection(
                            section
                        );

                    }
                );

            }
        );

    },


    showSection(section) {

        if (!section) return;


        const panels =
            document.querySelectorAll(
                "[data-account-panel]"
            );

        const buttons =
            document.querySelectorAll(
                ".account-section-button"
            );


        panels.forEach(
            panel => {

                panel.hidden =
                    panel.dataset
                        .accountPanel !==
                    section;

            }
        );


        buttons.forEach(
            button => {

                button.classList.toggle(
                    "is-active",
                    button.dataset
                        .accountSection ===
                    section
                );

            }
        );


        this.currentSection =
            section;


        const panelsContainer =
            document.getElementById(
                "account-panels"
            );


        if (panelsContainer) {

            panelsContainer.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });

        }


        if (
            section === "cart"
        ) {

            this.renderCart();

        }


        if (
            section === "favorites"
        ) {

            this.renderFavorites();

        }


        if (
            section === "recent"
        ) {

            this.renderRecent();

        }


        if (
            section === "notifications"
        ) {

            this.renderNotifications();

        }

    },


    /* =====================================================
       ACTIONS
       ===================================================== */

    bindActions() {

        const logoutButton =
            document.getElementById(
                "account-logout-button"
            );

        const openCartButton =
            document.getElementById(
                "account-open-cart-button"
            );

        const darkModeButton =
            document.getElementById(
                "account-dark-mode-button"
            );

        const addAddressButton =
            document.getElementById(
                "account-add-address-button"
            );

        const editProfileButton =
            document.getElementById(
                "account-edit-profile-button"
            );


        if (logoutButton) {

            logoutButton.addEventListener(
                "click",
                () => this.logout()
            );

        }


        if (openCartButton) {

            openCartButton.addEventListener(
                "click",
                () => {

                    if (
                        typeof NAVIGATION !==
                        "undefined" &&
                        typeof NAVIGATION.cart ===
                        "function"
                    ) {

                        NAVIGATION.cart();

                    }

                }
            );

        }


        if (darkModeButton) {

            darkModeButton.addEventListener(
                "click",
                () => {

                    this.toggleDarkMode();

                }
            );

        }


        if (addAddressButton) {

            addAddressButton.addEventListener(
                "click",
                () => {

                    this.showSuccess(
                        "إضافة العنوان ستكون متاحة من قسم العناوين."
                    );

                }
            );

        }


        if (editProfileButton) {

            editProfileButton.addEventListener(
                "click",
                () => {

                    this.showSuccess(
                        "يمكن تعديل بيانات الحساب من هنا عند تفعيل تعديل الملف الشخصي."
                    );

                }
            );

        }


        document.addEventListener(
            "hz:cart_updated",
            () => {

                this.updateCounters();

                this.renderCart();

            }
        );

    },


    /* =====================================================
       COUNTERS
       ===================================================== */

    updateCounters() {

        let cartCount = 0;

        if (
            typeof HZCart !==
            "undefined"
        ) {

            if (
                typeof HZCart.count ===
                "function"
            ) {

                cartCount =
                    Number(
                        HZCart.count()
                    ) || 0;

            } else if (
                Array.isArray(
                    HZCart.items
                )
            ) {

                cartCount =
                    HZCart.items.reduce(
                        (
                            total,
                            item
                        ) =>
                            total +
                            (
                                Number(
                                    item.quantity ??
                                    item.qty ??
                                    1
                                ) || 1
                            ),
                        0
                    );

            }

        }


        let favoritesCount = 0;

        if (
            typeof HZFavorites !==
            "undefined"
        ) {

            if (
                typeof HZFavorites.count ===
                "function"
            ) {

                favoritesCount =
                    Number(
                        HZFavorites.count()
                    ) || 0;

            } else if (
                Array.isArray(
                    HZFavorites.items
                )
            ) {

                favoritesCount =
                    HZFavorites.items.length;

            }

        }


        let recentCount = 0;

        if (
            typeof HZRecent !==
            "undefined"
        ) {

            if (
                typeof HZRecent.count ===
                "function"
            ) {

                recentCount =
                    Number(
                        HZRecent.count()
                    ) || 0;

            } else if (
                Array.isArray(
                    HZRecent.items
                )
            ) {

                recentCount =
                    HZRecent.items.length;

            }

        }


        this.setText(
            "account-cart-count",
            cartCount
        );

        this.setText(
            "account-favorites-count",
            favoritesCount
        );

        this.setText(
            "account-recent-count",
            recentCount
        );

    },


    /* =====================================================
       CART
       ===================================================== */

    renderCart() {

        const container =
            document.getElementById(
                "account-cart-list"
            );

        const empty =
            document.getElementById(
                "account-cart-empty"
            );


        if (!container) return;


        let items = [];


        if (
            typeof HZCart !==
            "undefined" &&
            Array.isArray(
                HZCart.items
            )
        ) {

            items =
                HZCart.items;

        }


        container.innerHTML =
            "";


        if (!items.length) {

            if (empty) {
                empty.hidden = false;
            }

            return;

        }


        if (empty) {
            empty.hidden = true;
        }


        items.forEach(
            item => {

                const product =
                    item.product ||
                    item;

                const element =
                    document.createElement(
                        "article"
                    );

                element.className =
                    "account-cart-item";


                const image =
                    document.createElement(
                        "img"
                    );

                image.className =
                    "account-cart-item-image";

                image.src =
                    item.image ||
                    product.image ||
                    "";

                image.alt =
                    item.name ||
                    product.name ||
                    "";


                const info =
                    document.createElement(
                        "div"
                    );

                info.className =
                    "account-cart-item-info";


                const title =
                    document.createElement(
                        "strong"
                    );

                title.textContent =
                    item.name ||
                    product.name ||
                    product.title ||
                    "";


                const quantity =
                    document.createElement(
                        "span"
                    );

                quantity.textContent =
                    `الكمية: ${
                        Number(
                            item.quantity ??
                            item.qty ??
                            1
                        ) || 1
                    }`;


                info.appendChild(
                    title
                );

                info.appendChild(
                    quantity
                );


                element.appendChild(
                    image
                );

                element.appendChild(
                    info
                );


                container.appendChild(
                    element
                );

            }
        );

    },


    /* =====================================================
       FAVORITES
       ===================================================== */

    renderFavorites() {

        const container =
            document.getElementById(
                "account-favorites-list"
            );

        const empty =
            document.getElementById(
                "account-favorites-empty"
            );


        if (!container) return;


        let items = [];


        if (
            typeof HZFavorites !==
            "undefined" &&
            Array.isArray(
                HZFavorites.items
            )
        ) {

            items =
                HZFavorites.items;

        }


        container.innerHTML =
            "";


        if (!items.length) {

            if (empty) {
                empty.hidden = false;
            }

            return;

        }


        if (empty) {
            empty.hidden = true;
        }


        items.forEach(
            item => {

                const product =
                    item.product ||
                    item;

                const card =
                    document.createElement(
                        "article"
                    );

                card.className =
                    "account-favorite-item";


                const image =
                    document.createElement(
                        "img"
                    );

                image.src =
                    item.image ||
                    product.image ||
                    "";

                image.alt =
                    item.name ||
                    product.name ||
                    "";


                const title =
                    document.createElement(
                        "strong"
                    );

                title.textContent =
                    item.name ||
                    product.name ||
                    product.title ||
                    "";


                card.appendChild(
                    image
                );

                card.appendChild(
                    title
                );


                card.addEventListener(
                    "click",
                    () => {

                        const id =
                            item.id ??
                            item.productId ??
                            product.id ??
                            product.productId;

                        if (
                            id &&
                            typeof NAVIGATION !==
                            "undefined"
                        ) {

                            NAVIGATION.product(
                                id
                            );

                        }

                    }
                );


                container.appendChild(
                    card
                );

            }
        );

    },


    /* =====================================================
       RECENT
       ===================================================== */

    renderRecent() {

        const container =
            document.getElementById(
                "account-recent-list"
            );

        const empty =
            document.getElementById(
                "account-recent-empty"
            );


        if (!container) return;


        let items = [];


        if (
            typeof HZRecent !==
            "undefined" &&
            Array.isArray(
                HZRecent.items
            )
        ) {

            items =
                HZRecent.items;

        }


        container.innerHTML =
            "";


        if (!items.length) {

            if (empty) {
                empty.hidden = false;
            }

            return;

        }


        if (empty) {
            empty.hidden = true;
        }


        items.forEach(
            item => {

                const product =
                    item.product ||
                    item;

                const card =
                    document.createElement(
                        "article"
                    );

                card.className =
                    "account-recent-item";


                const image =
                    document.createElement(
                        "img"
                    );

                image.src =
                    item.image ||
                    product.image ||
                    "";

                image.alt =
                    item.name ||
                    product.name ||
                    "";


                const title =
                    document.createElement(
                        "strong"
                    );

                title.textContent =
                    item.name ||
                    product.name ||
                    product.title ||
                    "";


                card.appendChild(
                    image
                );

                card.appendChild(
                    title
                );


                card.addEventListener(
                    "click",
                    () => {

                        const id =
                            item.id ??
                            item.productId ??
                            product.id ??
                            product.productId;

                        if (
                            id &&
                            typeof NAVIGATION !==
                            "undefined"
                        ) {

                            NAVIGATION.product(
                                id
                            );

                        }

                    }
                );


                container.appendChild(
                    card
                );

            }
        );

    },


    /* =====================================================
       NOTIFICATIONS
       ===================================================== */

    renderNotifications() {

        const container =
            document.getElementById(
                "account-notifications-list"
            );

        const empty =
            document.getElementById(
                "account-notifications-empty"
            );


        if (!container) return;


        let items = [];


        if (
            typeof HZNotifications !==
            "undefined"
        ) {

            if (
                Array.isArray(
                    HZNotifications.items
                )
            ) {

                items =
                    HZNotifications.items;

            } else if (
                typeof HZNotifications.getAll ===
                "function"
            ) {

                items =
                    HZNotifications.getAll() ||
                    [];

            }

        }


        container.innerHTML =
            "";


        if (!items.length) {

            if (empty) {
                empty.hidden = false;
            }

            return;

        }


        if (empty) {
            empty.hidden = true;
        }


        items.forEach(
            item => {

                const element =
                    document.createElement(
                        "article"
                    );

                element.className =
                    "account-notification-item";


                const title =
                    document.createElement(
                        "strong"
                    );

                title.textContent =
                    item.title ||
                    "إشعار";


                const message =
                    document.createElement(
                        "p"
                    );

                message.textContent =
                    item.message ||
                    item.text ||
                    "";


                element.appendChild(
                    title
                );

                element.appendChild(
                    message
                );


                container.appendChild(
                    element
                );

            }
        );

    },


    /* =====================================================
       DARK MODE
       ===================================================== */

    toggleDarkMode() {

        const page =
            document.getElementById(
                "account-page"
            );

        const button =
            document.getElementById(
                "account-dark-mode-button"
            );


        if (!page) return;


        const active =
            page.classList.toggle(
                "dark-mode"
            );


        if (button) {

            button.setAttribute(
                "aria-pressed",
                active
                    ? "true"
                    : "false"
            );

            button.textContent =
                active
                    ? "إيقاف"
                    : "تشغيل";

        }


        if (
            typeof STORAGE !==
            "undefined"
        ) {

            STORAGE.set(
                "hz_account_dark_mode",
                active
            );

        }

    },


    /* =====================================================
       HELPERS
       ===================================================== */

    setText(
        id,
        value
    ) {

        const element =
            document.getElementById(
                id
            );

        if (element) {

            element.textContent =
                String(value);

        }

    },


    showError(
        id,
        message
    ) {

        const element =
            document.getElementById(
                id
            );

        if (!element) return;


        element.textContent =
            message || "";

        element.hidden =
            !message;

    },


    clearError(id) {

        this.showError(
            id,
            ""
        );

    },


    showSuccess(message) {

        if (
            typeof TOAST !==
            "undefined" &&
            typeof TOAST.success ===
            "function"
        ) {

            TOAST.success(
                message
            );

            return;

        }


        console.log(
            message
        );

    }

};


window.ACCOUNT_PAGE =
    ACCOUNT_PAGE;


document.addEventListener(
    "DOMContentLoaded",
    () => {

        ACCOUNT_PAGE.init();

    }
);
