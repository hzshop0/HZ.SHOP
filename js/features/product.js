const HZProduct = {

    current: null,

    set(product) {
        if (!product) return null;

        this.current = product;

        this.emit("product_loaded", {
            product
        });

        return product;
    },

    get() {
        return this.current;
    },

    clear() {
        this.current = null;
    },

    view(product = this.current) {
        if (!product) return;

        this.current = product;

        if (window.HZAnalytics) {
            HZAnalytics.productView(product);
        }

        this.emit("product_viewed", {
            product
        });
    },

    getId(product = this.current) {
        return product?.id ?? null;
    },

    getPrice(product = this.current) {
        return Number(product?.price || 0);
    },

    getQuantity(product = this.current) {
        return Number(product?.quantity || 1);
    },

    addToCart(product = this.current, quantity = 1) {
        if (!product || !window.HZCart) return;

        HZCart.add(product, quantity);

        this.emit("product_added_to_cart", {
            product,
            quantity
        });
    },

    toggleFavorite(product = this.current) {
        if (!product || !window.HZFavorites) return false;

        const isFavorite =
            HZFavorites.toggle(product);

        this.emit("product_favorite_toggled", {
            product,
            isFavorite
        });

        return isFavorite;
    },

    emit(eventName, detail = {}) {
        window.dispatchEvent(
            new CustomEvent(
                `hz:${eventName}`,
                {
                    detail
                }
            )
        );
    }
};

window.HZProduct = HZProduct;
