const HZRedirect = {

    to(url, options = {}) {
        if (!url) return;

        const {
            replace = false,
            newTab = false
        } = options;

        if (newTab) {
            window.open(
                url,
                "_blank",
                "noopener,noreferrer"
            );
            return;
        }

        if (replace) {
            window.location.replace(url);
            return;
        }

        window.location.href = url;
    },

    home() {
        this.to("/");
    },

    product(id) {
        if (!id) return;

        this.to(
            `/pages/product/?id=${encodeURIComponent(id)}`
        );
    },

    category(id) {
        if (!id) return;

        this.to(
            `/pages/category/?id=${encodeURIComponent(id)}`
        );
    },

    cart() {
        this.to("/pages/cart/");
    },

    account() {
        this.to("/pages/account/");
    },

    checkout() {
        this.to("/pages/checkout/");
    },

    orders() {
        this.to("/pages/orders/");
    },

    wishlist() {
        this.to("/pages/wishlist/");
    },

    search(query = "") {
        const value = String(query).trim();

        this.to(
            value
                ? `/pages/search/?q=${encodeURIComponent(value)}`
                : "/pages/search/"
        );
    },

    notifications() {
        this.to("/pages/notifications/");
    }
};

window.HZRedirect = HZRedirect;
