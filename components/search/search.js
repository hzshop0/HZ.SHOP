const HZSearchComponent = {

    render(container, options = {}) {
        if (!container) return;

        const {
            placeholder = "ابحث عن المنتجات...",
            value = ""
        } = options;

        container.innerHTML = `
            <form class="search-component" role="search">
                <input
                    type="search"
                    class="search-component-input"
                    placeholder="${placeholder}"
                    value="${value}"
                    autocomplete="off"
                    aria-label="البحث"
                >

                <button
                    type="submit"
                    class="search-component-button"
                    aria-label="بحث"
                >
                    بحث
                </button>
            </form>
        `;

        this.bind(container);
    },

    bind(container) {
        const form =
            container.querySelector(".search-component");

        const input =
            container.querySelector(
                ".search-component-input"
            );

        if (!form || !input) return;

        form.addEventListener("submit", (event) => {
            event.preventDefault();

            const query =
                input.value.trim();

            if (window.HZSearch) {
                HZSearch.setQuery(query);
            }

            window.dispatchEvent(
                new CustomEvent("hz:search_submit", {
                    detail: {
                        query
                    }
                })
            );
        });

        input.addEventListener("input", () => {
            const query =
                input.value.trim();

            if (window.HZSearch) {
                HZSearch.setQuery(query);
            }
        });
    }
};

window.HZSearchComponent = HZSearchComponent;
