const HZCart = {

    getItems() {
        try {
            const items =
                JSON.parse(
                    localStorage.getItem("hz_cart") || "[]"
                );

            return Array.isArray(items) ? items : [];
        } catch {
            return [];
        }
    },

    saveItems(items) {
        localStorage.setItem(
            "hz_cart",
            JSON.stringify(items)
        );

        this.emit("cart_updated", {
            items
        });
    },

    add(product, quantity = 1) {
        if (!product || !product.id) return;

        const items = this.getItems();

        const existing =
            items.find(
                item => String(item.id) === String(product.id)
            );

        if (existing) {
            existing.quantity =
                Number(existing.quantity || 0) +
                Number(quantity || 1);
        } else {
            items.push({
                ...product,
                quantity: Number(quantity || 1)
            });
        }

        this.saveItems(items);

        if (window.HZAnalytics) {
            HZAnalytics.addToCart(
                product,
                quantity
            );
        }
    },

    remove(productId) {
        const items =
            this.getItems().filter(
                item =>
                    String(item.id) !==
                    String(productId)
            );

        this.saveItems(items);
    },

    updateQuantity(productId, quantity) {
        const items = this.getItems();

        const item =
            items.find(
                product =>
                    String(product.id) ===
                    String(productId)
            );

        if (!item) return;

        const newQuantity =
            Number(quantity);

        if (newQuantity <= 0) {
            this.remove(productId);
            return;
        }

        item.quantity = newQuantity;

        this.saveItems(items);
    },

    clear() {
        this.saveItems([]);
    },

    count() {
        return this.getItems().reduce(
            (total, item) =>
                total +
                Number(item.quantity || 0),
            0
        );
    },

    total() {
        return this.getItems().reduce(
            (total, item) =>
                total +
                (
                    Number(item.price || 0) *
                    Number(item.quantity || 0)
                ),
            0
        );
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

window.HZCart = HZCart;
