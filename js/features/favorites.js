const HZFavorites = {

    storageKey: "hz_favorites",

    getItems() {
        try {
            const items = JSON.parse(
                localStorage.getItem(this.storageKey) || "[]"
            );

            return Array.isArray(items) ? items : [];
        } catch {
            return [];
        }
    },

    saveItems(items) {
        localStorage.setItem(
            this.storageKey,
            JSON.stringify(items)
        );

        this.emit("favorites_updated", {
            items
        });
    },

    has(productId) {
        return this.getItems().some(
            item =>
                String(item.id) === String(productId)
        );
    },

    add(product) {
        if (!product || !product.id) return;

        const items = this.getItems();

        if (this.has(product.id)) return;

        items.push(product);

        this.saveItems(items);

        this.emit("favorite_added", {
            product
        });
    },

    remove(productId) {
        const items = this.getItems().filter(
            item =>
                String(item.id) !== String(productId)
        );

        this.saveItems(items);

        this.emit("favorite_removed", {
            productId
        });
    },

    toggle(product) {
        if (!product || !product.id) return false;

        if (this.has(product.id)) {
            this.remove(product.id);
            return false;
        }

        this.add(product);
        return true;
    },

    clear() {
        this.saveItems([]);
    },

    count() {
        return this.getItems().length;
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

window.HZFavorites = HZFavorites;
