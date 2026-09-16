const NOTIFICATIONS_PAGE = {
  notifications: [],

  init() {
    this.bindEvents();
    this.load();
  },

  bindEvents() {
    const readButton =
      document.querySelector(
        "[data-notifications-read]"
      );

    if (readButton) {
      readButton.addEventListener(
        "click",
        () => this.markAllRead()
      );
    }
  },

  async load() {
    this.showLoading(true);

    try {
      const notifications =
        await this.loadNotifications();

      this.notifications =
        Array.isArray(notifications)
          ? notifications.map(
              item =>
                this.normalizeNotification(
                  item
                )
            )
          : [];

      this.saveLocal();
      this.render();

    } catch (error) {
      console.error(
        "Notifications load error:",
        error
      );

      this.notifications =
        this.loadLocal();

      this.render();

    } finally {
      this.showLoading(false);
    }
  },

  async loadNotifications() {
    const response =
      await fetch(
        `/api/notifications?t=${Date.now()}`,
        {
          method: "GET",
          cache: "no-store"
        }
      );

    if (!response.ok) {
      throw new Error(
        `Notifications request failed: ${response.status}`
      );
    }

    const data =
      await response.json();

    if (Array.isArray(data)) {
      return data;
    }

    if (
      Array.isArray(
        data.notifications
      )
    ) {
      return data.notifications;
    }

    if (
      Array.isArray(data.data)
    ) {
      return data.data;
    }

    return [];
  },

  normalizeNotification(
    notification = {}
  ) {
    const read =
      Boolean(
        notification.read ??
        notification.isRead ??
        false
      );

    return {
      id: String(
        notification.id ??
        notification.notificationId ??
        Date.now()
      ),

      title:
        notification.title ??
        notification.name ??
        "إشعار من HZ.shop",

      message:
        notification.message ??
        notification.body ??
        notification.description ??
        "",

      type:
        notification.type ??
        "general",

      read,

      createdAt:
        notification.createdAt ??
        notification.created_at ??
        notification.date ??
        new Date().toISOString(),

      url:
        notification.url ??
        notification.link ??
        ""
    };
  },

  render() {
    const list =
      document.querySelector(
        "[data-notifications-list]"
      );

    const empty =
      document.querySelector(
        "[data-notifications-empty]"
      );

    const readButton =
      document.querySelector(
        "[data-notifications-read]"
      );

    const subtitle =
      document.querySelector(
        "[data-notifications-subtitle]"
      );

    if (!list) {
      return;
    }

    list.innerHTML = "";

    if (!this.notifications.length) {
      list.hidden = true;

      if (empty) {
        empty.hidden = false;
      }

      if (readButton) {
        readButton.hidden = true;
      }

      if (subtitle) {
        subtitle.hidden = true;
      }

      return;
    }

    if (empty) {
      empty.hidden = true;
    }

    list.hidden = false;

    const unreadCount =
      this.notifications.filter(
        item => !item.read
      ).length;

    if (subtitle) {
      subtitle.hidden = false;

      subtitle.textContent =
        unreadCount > 0
          ? `${unreadCount} إشعار غير مقروء`
          : "جميع الإشعارات مقروءة";
    }

    if (readButton) {
      readButton.hidden =
        unreadCount === 0;
    }

    this.notifications.forEach(
      notification => {
        const element =
          this.createNotificationElement(
            notification
          );

        list.appendChild(element);
      }
    );
  },

  createNotificationElement(
    notification
  ) {
    const element =
      document.createElement("article");

    element.className =
      "notification-item";

    if (!notification.read) {
      element.classList.add(
        "unread"
      );
    }

    const icon =
      this.getIcon(
        notification.type
      );

    const time =
      this.formatTime(
        notification.createdAt
      );

    element.innerHTML = `
      <div
        class="notification-icon"
        aria-hidden="true"
      >
        ${icon}
      </div>

      <div class="notification-content">

        <h2 class="notification-title">
          ${this.escapeHTML(
            notification.title
          )}
        </h2>

        <p class="notification-message">
          ${this.escapeHTML(
            notification.message
          )}
        </p>

        <time
          class="notification-time"
          datetime="${this.escapeHTML(
            notification.createdAt
          )}"
        >
          ${this.escapeHTML(time)}
        </time>

      </div>

      ${
        !notification.read
          ? `
            <span
              class="notification-unread-dot"
              aria-label="غير مقروء"
            ></span>
          `
          : ""
      }
    `;

    element.addEventListener(
      "click",
      () => {
        this.markRead(
          notification.id
        );

        if (
          notification.url
        ) {
          window.location.href =
            notification.url;
        }
      }
    );

    return element;
  },

  getIcon(type) {
    switch (
      String(type)
        .toLowerCase()
    ) {
      case "order":
        return "📦";

      case "delivery":
        return "🚚";

      case "offer":
      case "discount":
        return "🏷️";

      case "wishlist":
        return "♡";

      case "account":
        return "👤";

      case "system":
        return "⚙️";

      default:
        return "🔔";
    }
  },

  markRead(id) {
    const target =
      String(id);

    const notification =
      this.notifications.find(
        item =>
          String(item.id) ===
          target
      );

    if (!notification) {
      return;
    }

    notification.read = true;

    this.saveLocal();
    this.render();

    this.updateServer(
      target,
      true
    );
  },

  async updateServer(
    id,
    read
  ) {
    try {
      await fetch(
        `/api/notifications/${encodeURIComponent(
          id
        )}`,
        {
          method: "PUT",
          headers: {
            "Content-Type":
              "application/json"
          },
          body: JSON.stringify({
            read
          })
        }
      );
    } catch (error) {
      console.warn(
        "Notification update failed:",
        error
      );
    }
  },

  markAllRead() {
    const unread =
      this.notifications.filter(
        item => !item.read
      );

    if (!unread.length) {
      return;
    }

    this.notifications =
      this.notifications.map(
        item => ({
          ...item,
          read: true
        })
      );

    this.saveLocal();
    this.render();

    unread.forEach(
      notification => {
        this.updateServer(
          notification.id,
          true
        );
      }
    );

    if (
      typeof TOAST !==
        "undefined" &&
      typeof TOAST.success ===
        "function"
    ) {
      TOAST.success(
        "تم تحديد جميع الإشعارات كمقروءة"
      );
    }
  },

  saveLocal() {
    if (
      typeof STORAGE ===
      "undefined"
    ) {
      return;
    }

    STORAGE.set(
      "hz_notifications",
      this.notifications
    );
  },

  loadLocal() {
    if (
      typeof STORAGE ===
      "undefined"
    ) {
      return [];
    }

    const value =
      STORAGE.get(
        "hz_notifications",
        []
      );

    return Array.isArray(value)
      ? value.map(
          item =>
            this.normalizeNotification(
              item
            )
        )
      : [];
  },

  showLoading(show) {
    const loading =
      document.querySelector(
        "[data-notifications-loading]"
      );

    if (loading) {
      loading.hidden = !show;
    }
  },

  formatTime(value) {
    const date =
      new Date(value);

    if (
      Number.isNaN(
        date.getTime()
      )
    ) {
      return "";
    }

    return date.toLocaleString(
      "ar-LB",
      {
        dateStyle: "medium",
        timeStyle: "short"
      }
    );
  },

  escapeHTML(value = "") {
    if (
      typeof UTILS !==
        "undefined" &&
      typeof UTILS.escapeHTML ===
        "function"
    ) {
      return UTILS.escapeHTML(
        value
      );
    }

    return String(value)
      .replace(
        /&/g,
        "&amp;"
      )
      .replace(
        /</g,
        "&lt;"
      )
      .replace(
        />/g,
        "&gt;"
      )
      .replace(
        /"/g,
        "&quot;"
      )
      .replace(
        /'/g,
        "&#039;"
      );
  }
};

window.NOTIFICATIONS_PAGE =
  NOTIFICATIONS_PAGE;

document.addEventListener(
  "DOMContentLoaded",
  () => {
    NOTIFICATIONS_PAGE.init();
  }
);
