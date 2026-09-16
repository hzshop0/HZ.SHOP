const HZCheckout = {

    state: {
        started: false,
        data: {}
    },

    start(data = {}) {
        this.state.started = true;
        this.state.data = {
            ...data
        };

        if (window.HZAnalytics) {
            HZAnalytics.beginCheckout(data);
        }

        this.emit("checkout_started", {
            ...this.state.data
        });
    },

    update(data = {}) {
        this.state.data = {
            ...this.state.data,
            ...data
        };

        this.emit("checkout_updated", {
            ...this.state.data
        });
    },

    getData() {
        return {
            ...this.state.data
        };
    },

    complete(order = {}) {
        if (window.HZAnalytics) {
            HZAnalytics.purchase(order);
        }

        this.emit("checkout_completed", {
            order
        });

        this.reset();
    },

    cancel() {
        this.emit("checkout_cancelled", {
            ...this.state.data
        });

        this.reset();
    },

    reset() {
        this.state = {
            started: false,
            data: {}
        };
    },

    isStarted() {
        return this.state.started;
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

window.HZCheckout = HZCheckout;
