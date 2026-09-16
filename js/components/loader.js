/**
 * HZ.SHOP
 * Loader Component
 */

const HZLoader = {

    show(target = document.body) {
        const container =
            typeof target === "string"
                ? document.querySelector(target)
                : target;

        if (!container) return;

        let loader = container.querySelector(".hz-loader");

        if (!loader) {
            loader = document.createElement("div");

            loader.className = "hz-loader";

            loader.setAttribute("role", "status");
            loader.setAttribute("aria-live", "polite");

            loader.innerHTML = `
                <span class="hz-loader-spinner"></span>
                <span class="hz-loader-text">جاري التحميل...</span>
            `;

            container.appendChild(loader);
        }

        loader.classList.add("is-visible");
    },

    hide(target = document.body) {
        const container =
            typeof target === "string"
                ? document.querySelector(target)
                : target;

        if (!container) return;

        const loader = container.querySelector(".hz-loader");

        if (!loader) return;

        loader.classList.remove("is-visible");
    },

    setText(text, target = document.body) {
        const container =
            typeof target === "string"
                ? document.querySelector(target)
                : target;

        if (!container) return;

        const loader = container.querySelector(".hz-loader");

        if (!loader) return;

        const textElement =
            loader.querySelector(".hz-loader-text");

        if (textElement) {
            textElement.textContent =
                text || "جاري التحميل...";
        }
    }
};

window.HZLoader = HZLoader;
