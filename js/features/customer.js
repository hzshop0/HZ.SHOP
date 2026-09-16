const HZCustomer = {

    storageKey: "hz_customer",

    get() {
        try {
            const customer =
                JSON.parse(
                    localStorage.getItem(this.storageKey) || "null"
                );

            return customer && typeof customer === "object"
                ? customer
                : null;
        } catch {
            return null;
        }
    },

    set(customer) {
        if (!customer || typeof customer !== "object") {
            return null;
        }

        localStorage.setItem(
            this.storageKey,
            JSON.stringify(customer)
        );

        this.emit("customer_login", {
            customer
        });

        return customer;
    },

    clear() {
        localStorage.removeItem(this.storageKey);

        this.emit("customer_logout");
    },

    isLoggedIn() {
        return !!this.get();
    },

    getId() {
        return this.get()?.id ?? null;
    },

    getName() {
        const customer = this.get();

        return (
            customer?.name ||
            customer?.fullName ||
            ""
        );
    },

    getEmail() {
        return this.get()?.email || "";
    },

    update(data = {}) {
        const current = this.get();

        if (!current) return null;

        const updated = {
            ...current,
            ...data
        };

        localStorage.setItem(
            this.storageKey,
            JSON.stringify(updated)
        );

        this.emit("customer_updated", {
            customer: updated
        });

        return updated;
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

window.HZCustomer = HZCustomer;
