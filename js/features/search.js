const HZSearch = {

    query: "",

    setQuery(value = "") {
        this.query = String(value).trim();

        this.emit("search", {
            query: this.query
        });
    },

    getQuery() {
        return this.query;
    },

    clear() {
        this.setQuery("");
    },

    matches(product) {
        if (!product) return false;

        const query =
            this.query.toLowerCase();

        if (!query) return true;

        const fields = [
            product.name,
            product.title,
            product.description,
            product.category,
            product.brand
        ];

        return fields.some(value =>
            String(value || "")
                .toLowerCase()
                .includes(query)
        );
    },

    filter(products = []) {
        if (!Array.isArray(products)) {
            return [];
        }

        return products.filter(
            product => this.matches(product)
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

        if (
            eventName === "search" &&
            window.HZAnalytics
        ) {
            HZAnalytics.search(
                detail.query || ""
            );
        }
    }
};

window.HZSearch = HZSearch;
