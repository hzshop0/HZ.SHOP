/**
 * HZ.SHOP
 * Tabs Component
 */

const HZTabs = {

    activate(tab, container) {
        if (!tab || !container) return;

        const tabs = container.querySelectorAll("[data-tab]");
        const panels = container.querySelectorAll("[data-tab-panel]");

        tabs.forEach((item) => {
            const active =
                item === tab;

            item.classList.toggle("is-active", active);
            item.setAttribute(
                "aria-selected",
                active ? "true" : "false"
            );
        });

        const target =
            tab.getAttribute("data-tab");

        panels.forEach((panel) => {
            const active =
                panel.getAttribute("data-tab-panel") === target;

            panel.classList.toggle("is-active", active);
            panel.hidden = !active;
        });
    },

    init() {
        document.addEventListener("click", (event) => {

            const tab =
                event.target.closest("[data-tab]");

            if (!tab) return;

            const container =
                tab.closest("[data-tabs]");

            if (!container) return;

            this.activate(tab, container);
        });
    }
};

window.HZTabs = HZTabs;

document.addEventListener("DOMContentLoaded", () => {
    HZTabs.init();
});
