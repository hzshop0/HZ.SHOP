/* =================================
   HZ.SHOP — Notifications
   Customer notifications helpers
   ================================= */

(() => {
  "use strict";

  window.HZ = window.HZ || {};

  HZ.notifications = [];

  /* ---------------------------------
     Normalize notification
     --------------------------------- */

  HZ.normalizeNotification = (notification) => {
    if (
      !notification ||
      typeof notification !== "object"
    ) {
      return null;
    }

    return {
      ...notification,

      id:
        notification.id ??
        notification.notification_id ??
        "",

      title:
        notification.title ??
        notification.name ??
        "",

      message:
        notification.message ??
        notification.body ??
        notification.text ??
        "",

      read:
        Boolean(
          notification.read ??
          notification.is_read ??
          false
        ),

      created_at:
        notification.created_at ??
        notification.createdAt ??
        notification.date ??
        ""
    };
  };

  /* ---------------------------------
     Load notifications
     --------------------------------- */

  HZ.loadNotifications = async () => {
    try {
      const response =
        await HZ.apiGet(
          `/notifications?t=${Date.now()}`
        );

      let list = [];

      if (Array.isArray(response)) {
        list = response;
      } else if (
        response &&
        Array.isArray(response.notifications)
      ) {
        list = response.notifications;
      } else if (
        response &&
        Array.isArray(response.data)
      ) {
        list = response.data;
      }

      HZ.notifications = list
        .map(HZ.normalizeNotification)
        .filter(Boolean);

      return HZ.notifications;
    } catch (error) {
      /*
       * Notifications are optional.
       * Keep the account page functional
       * if the endpoint is not available.
       */
      console.error(
        "HZ.SHOP notifications load error:",
        error
      );

      HZ.notifications = [];
      return HZ.notifications;
    }
  };

  /* ---------------------------------
     Unread count
     --------------------------------- */

  HZ.getUnreadNotificationsCount = () => {
    return HZ.notifications.filter(
      notification => !notification.read
    ).length;
  };

  /* ---------------------------------
     Mark notification as read
     --------------------------------- */

  HZ.markNotificationRead = async (
    notificationId
  ) => {
    const notification =
      HZ.notifications.find(
        item =>
          String(item.id) ===
          String(notificationId)
      );

    if (!notification) {
      return false;
    }

    notification.read = true;

    /*
     * The current backend does not yet
     * expose a confirmed read-status route,
     * so the local state is updated only.
     */

    document.dispatchEvent(
      new CustomEvent(
        "hz:notifications-updated",
        {
          detail: {
            notifications:
              HZ.notifications
          }
        }
      )
    );

    return true;
  };

  /* ---------------------------------
     Mark all as read
     --------------------------------- */

  HZ.markAllNotificationsRead = () => {
    HZ.notifications.forEach(
      notification => {
        notification.read = true;
      }
    );

    document.dispatchEvent(
      new CustomEvent(
        "hz:notifications-updated",
        {
          detail: {
            notifications:
              HZ.notifications
          }
        }
      )
    );

    return true;
  };

})();
