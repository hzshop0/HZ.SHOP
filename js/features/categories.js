const HZCategories = {

    items: [],

    set(categories = []) {
        this.items = Array.isArray(categories)
            ? categories
            : [];

        this.emit("categories_updated", {
            categories: this.items
        });

        return this.items;
    },

    getAll() {
        return [...this.items];
    },

    find(id) {
        return this.items.find(
            category =>
                String(category?.id) === String(id)
        ) || null;
    },

    filter(products = [], categoryId = null) {
        if (!Array.isArray(products)) {
            return [];
        }

        if (
            categoryId === null ||
            categoryId === ""
        ) {
            return products;
        }

        return products.filter(product =>
            String(product?.categoryId) ===
            String(categoryId)
        );
    },

    clear() {
        this.items = [];

        this.emit("categories_updated", {
            categories: []
        });
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

window.HZCategories = HZCategories;
