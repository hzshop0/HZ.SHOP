const HZNotifications = {

    storageKey: "hz_notifications",

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

        this.emit("notifications_updated", {
            notifications: items
        });
    },

    add(notification = {}) {
        const item = {
            id:
                notification.id ||
                `notification_${Date.now()}`,

            title:
                notification.title || "",

            message:
                notification.message || "",

            type:
                notification.type || "info",

            read: false,

            createdAt:
                notification.createdAt ||
                new Date().toISOString(),

            ...notification
        };

        const items = this.getAll();

        items.unshift(item);

        this.save(items);

        return item;
    },

    markAsRead(id) {
        const items = this.getAll();

        const notification =
            items.find(
                item =>
                    String(item.id) === String(id)
            );

        if (!notification) return;

        notification.read = true;

        this.save(items);
    },

    markAllAsRead() {
        const items =
            this.getAll().map(item => ({
                ...item,
                read: true
            }));

        this.save(items);
    },

    remove(id) {
        const items =
            this.getAll().filter(
                item =>
                    String(item.id) !== String(id)
            );

        this.save(items);
    },

    clear() {
        this.save([]);
    },

    getUnread() {
        return this.getAll().filter(
            item => !item.read
        );
    },

    unreadCount() {
        return this.getUnread().length;
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

window.HZNotifications = HZNotifications;
