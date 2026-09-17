```javascript
/*
 * HZ.SHOP
 * Analytics
 *
 * Central analytics module.
 * Handles store tracking events and Meta Pixel
 * without being tied to page-specific code.
 */

const HZAnalytics = {

    enabled: true,

    metaPixelId: "1105197418611201",

    init() {
        if (!this.enabled) return;

        this.initMetaPixel();
        this.trackPageView();
    },

    initMetaPixel() {
        if (!this.metaPixelId) return;
        if (typeof window === "undefined" || typeof document === "undefined") return;

        if (typeof window.fbq === "function") {
            window.fbq("init", this.metaPixelId);
            return;
        }

        !(function (f, b, e, v, n, t, s) {
            if (f.fbq) return;

            n = f.fbq = function () {
                n.callMethod
                    ? n.callMethod.apply(n, arguments)
                    : n.queue.push(arguments);
            };

            if (!f._fbq) f._fbq = n;

            n.push = n;
            n.loaded = true;
            n.version = "2.0";
            n.queue = [];

            t = b.createElement(e);
            t.async = true;
            t.src = v;

            s = b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t, s);
        })(
            window,
            document,
            "script",
            "https://connect.facebook.net/en_US/fbevents.js"
        );

        window.fbq("init", this.metaPixelId);
    },

    trackMeta(eventName, data = {}) {
        if (!this.enabled) return;
        if (typeof window === "undefined") return;
        if (typeof window.fbq !== "function") return;

        window.fbq("track", eventName, data);
    },

    track(eventName, data = {}) {
        if (!this.enabled) return;

        const event = {
            name: eventName,
            data,
            timestamp: new Date().toISOString(),
            page: window.location.pathname,
            url: window.location.href
        };

        window.dispatchEvent(
            new CustomEvent("hz:analytics", {
                detail: event
            })
        );
    },

    trackPageView() {
        const data = {
            title: document.title,
            url: window.location.href
        };

        this.track("page_view", data);
        this.trackMeta("PageView");
    },

    productView(product) {
        const data = {
            productId: product?.id ?? null,
            productName: product?.name ?? null
        };

        this.track("product_view", data);

        this.trackMeta("ViewContent", {
            content_ids: product?.id != null ? [String(product.id)] : [],
            content_name: product?.name ?? "",
            content_type: "product"
        });
    },

    addToCart(product, quantity = 1) {
        const data = {
            productId: product?.id ?? null,
            productName: product?.name ?? null,
            quantity: Number(quantity) || 1
        };

        this.track("add_to_cart", data);

        this.trackMeta("AddToCart", {
            content_ids: product?.id != null ? [String(product.id)] : [],
            content_name: product?.name ?? "",
            content_type: "product",
            quantity: Number(quantity) || 1
        });
    },

    removeFromCart(product, quantity = 1) {
        const data = {
            productId: product?.id ?? null,
            productName: product?.name ?? null,
            quantity: Number(quantity) || 1
        };

        this.track("remove_from_cart", data);
    },

    viewCart(cart = []) {
        const items = Array.isArray(cart) ? cart : [];

        this.track("view_cart", {
            items
        });

        this.trackMeta("ViewContent", {
            content_ids: items
                .map(item => item?.id)
                .filter(id => id != null)
                .map(id => String(id)),
            content_type: "product"
        });
    },

    beginCheckout(data = {}) {
        this.track("begin_checkout", data);

        this.trackMeta("InitiateCheckout", data);
    },

    purchase(order = {}) {
        const data = {
            orderId: order.id ?? order.orderId ?? null,
            total: order.total ?? null,
            items: Array.isArray(order.items) ? order.items : []
        };

        this.track("purchase", data);

        this.trackMeta("Purchase", {
            value: order.total ?? 0,
            currency: "USD",
            content_ids: data.items
                .map(item => item?.id)
                .filter(id => id != null)
                .map(id => String(id)),
            content_type: "product"
        });
    },

    search(query) {
        const value = query ?? "";

        this.track("search", {
            query: value
        });

        this.trackMeta("Search", {
            search_string: value
        });
    },

    favorite(product) {
        const data = {
            productId: product?.id ?? null,
            productName: product?.name ?? null
        };

        this.track("favorite", data);
    },

    unfavorite(product) {
        const data = {
            productId: product?.id ?? null,
            productName: product?.name ?? null
        };

        this.track("unfavorite", data);
    },

    selectCategory(category) {
        this.track("select_category", {
            category: category ?? null
        });
    },

    notificationOpen(notification) {
        this.track("notification_open", {
            notificationId: notification?.id ?? null
        });
    }
};

window.HZAnalytics = HZAnalytics;

document.addEventListener("DOMContentLoaded", () => {
    HZAnalytics.init();
});
```
