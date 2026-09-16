/*
 * HZ.SHOP
 * Analytics
 *
 * Central analytics module.
 * Handles store tracking events without being tied
 * to any specific analytics provider.
 */

const HZAnalytics = {

    enabled: true,

    init() {
        if (!this.enabled) return;

        this.trackPageView();
    },

    track(eventName, data = {}) {
        if (!this.enabled) return;

        const event = {
            name: eventName,
            data,
            timestamp: new Date().toISOString(),
            page: window.location.pathname
        };

        window.dispatchEvent(
            new CustomEvent("hz:analytics", {
                detail: event
            })
        );
    },

    trackPageView() {
        this.track("page_view", {
            title: document.title,
            url: window.location.href
        });
    },

    productView(product) {
        this.track("product_view", {
            productId: product?.id ?? null,
            productName: product?.name ?? null
        });
    },

    addToCart(product, quantity = 1) {
        this.track("add_to_cart", {
            productId: product?.id ?? null,
            productName: product?.name ?? null,
            quantity
        });
    },

    removeFromCart(product, quantity = 1) {
        this.track("remove_from_cart", {
            productId: product?.id ?? null,
            productName: product?.name ?? null,
            quantity
        });
    },

    viewCart(cart = []) {
        this.track("view_cart", {
            items: cart
        });
    },

    beginCheckout(data = {}) {
        this.track("begin_checkout", data);
    },

    purchase(order = {}) {
        this.track("purchase", {
            orderId: order.id ?? order.orderId ?? null,
            total: order.total ?? null,
            items: order.items ?? []
        });
    },

    search(query) {
        this.track("search", {
            query: query ?? ""
        });
    },

    favorite(product) {
        this.track("favorite", {
            productId: product?.id ?? null,
            productName: product?.name ?? null
        });
    }
};

window.HZAnalytics = HZAnalytics;

document.addEventListener("DOMContentLoaded", () => {
    HZAnalytics.init();
});
