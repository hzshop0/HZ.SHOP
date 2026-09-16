const HZRecent = {

    storageKey: "hz_recent_products",

    limit: 20,

    getAll() {
        try {
            const items =
                JSON.parse(
                    localStorage.getItem(this.storageKey) || "[]"
                );

            return Array.isArray(items) ? items : [];
        } catch {
            return [];
        }
    },

    save(items) {
        localStorage.setItem(
            this.storageKey,
            JSON.stringify(items)
        );
    },

    add(product) {
        if (!product || !product.id) return;

        let items = this.getAll();

        items =
            items.filter(
                item =>
                    String(item.id) !==
                    String(product.id)
            );

        items.unshift(product);

        items =
            items.slice(0, this.limit);

        this.save(items);

        this.emit("recent_updated", {
            product,
            items
        });
    },

    remove(productId) {
        const items =
            this.getAll().filter(
                item =>
                    String(item.id) !==
                    String(productId)
            );

        this.save(items);

        this.emit("recent_updated", {
            items
        });
    },

    clear() {
        this.save([]);

        this.emit("recent_updated", {
            items: []
        });
    },

    getAllItems() {
        return this.getAll();
    },

    has(productId) {
        return this.getAll().some(
            item =>
                String(item.id) ===
                String(productId)
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

window.HZRecent = HZRecent;
