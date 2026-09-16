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
            `/product.html?id=${encodeURIComponent(id)}`
        );
    },

    cart() {
        this.to("/cart.html");
    },

    account() {
        this.to("/account.html");
    },

    checkout() {
        this.to("/checkout.html");
    }
};

window.HZRedirect = HZRedirect;
