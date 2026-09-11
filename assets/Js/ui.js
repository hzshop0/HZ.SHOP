/* =================================
   HZ.SHOP — UI
   Shared interface helpers
   ================================= */

(() => {
  "use strict";

  window.HZ = window.HZ || {};

  /* ---------------------------------
     Toast
     Matches current Index.html
     --------------------------------- */

  HZ.toast = (
    message,
    type = "info",
    duration = 3000
  ) => {
    const toast =
      document.getElementById("toast");

    if (!toast) {
      return;
    }

    toast.textContent =
      String(message ?? "");

    toast.dataset.type = type;

    toast.classList.add("show");

    clearTimeout(
      window.__toastTimer
    );

    window.__toastTimer =
      setTimeout(() => {
        toast.classList.remove("show");
      }, duration);
  };

  /* ---------------------------------
     Modal helpers
     --------------------------------- */

  HZ.openModal = (modal) => {
    const element =
      typeof modal === "string"
        ? HZ.byId(modal)
        : modal;

    if (!element) {
      return false;
    }

    element.classList.add("show");
    element.removeAttribute("hidden");

    if (
      typeof HZ.lockScroll ===
      "function"
    ) {
      HZ.lockScroll();
    } else {
      document.body.style.overflow =
        "hidden";
    }

    return true;
  };

  HZ.closeModal = (modal) => {
    const element =
      typeof modal === "string"
        ? HZ.byId(modal)
        : modal;

    if (!element) {
      return false;
    }

    element.classList.remove("show");

    element.setAttribute(
      "hidden",
      ""
    );

    if (
      typeof HZ.unlockScroll ===
      "function"
    ) {
      HZ.unlockScroll();
    } else {
      document.body.style.overflow =
        "";
    }

    return true;
  };

  /* ---------------------------------
     Loading state
     --------------------------------- */

  HZ.setLoading = (
    element,
    loading = true
  ) => {
    if (!element) {
      return;
    }

    if (loading) {
      element.setAttribute(
        "aria-busy",
        "true"
      );

      element.classList.add(
        "is-loading"
      );
    } else {
      element.removeAttribute(
        "aria-busy"
      );

      element.classList.remove(
        "is-loading"
      );
    }
  };

  /* ---------------------------------
     Cart badges
     --------------------------------- */

  HZ.updateCartBadges = () => {
    const count =
      typeof HZ.getCartCount ===
      "function"
        ? HZ.getCartCount()
        : 0;

    HZ.$$(
      ".badge, .floating-cart-badge, [data-cart-count]"
    ).forEach(element => {
      element.textContent =
        String(count);

      element.hidden =
        count <= 0;
    });
  };

  /* ---------------------------------
     Favorite buttons
     --------------------------------- */

  HZ.updateFavoriteButtons = () => {
    if (
      typeof HZ.isFavorite !==
      "function"
    ) {
      return;
    }

    HZ.$$(
      "[data-favorite-id]"
    ).forEach(button => {
      const id =
        button.dataset.favoriteId;

      const active =
        HZ.isFavorite(id);

      button.classList.toggle(
        "active",
        active
      );

      button.setAttribute(
        "aria-pressed",
        String(active)
      );
    });
  };

  /* ---------------------------------
     Global UI refresh
     --------------------------------- */

  HZ.refreshUI = () => {
    HZ.updateCartBadges();
    HZ.updateFavoriteButtons();

    document.dispatchEvent(
      new CustomEvent(
        "hz:ui-updated"
      )
    );
  };

  /* ---------------------------------
     Cart update listener
     --------------------------------- */

  document.addEventListener(
    "hz:cart-updated",
    () => {
      HZ.updateCartBadges();
    }
  );

  /* ---------------------------------
     Notification update listener
     --------------------------------- */

  document.addEventListener(
    "hz:notifications-updated",
    () => {
      const count =
        typeof HZ.getUnreadNotificationsCount ===
        "function"
          ? HZ.getUnreadNotificationsCount()
          : 0;

      HZ.$$(
        "[data-notification-count]"
      ).forEach(element => {
        element.textContent =
          String(count);

        element.hidden =
          count <= 0;
      });
    }
  );

  /* ---------------------------------
     Escape closes modal
     --------------------------------- */

  document.addEventListener(
    "keydown",
    event => {
      if (event.key !== "Escape") {
        return;
      }

      HZ.$$(
        ".modal.show"
      ).forEach(modal => {
        HZ.closeModal(modal);
      });
    }
  );

  /* ---------------------------------
     Initial UI sync
     --------------------------------- */

  if (
    document.readyState ===
    "loading"
  ) {
    document.addEventListener(
      "DOMContentLoaded",
      HZ.refreshUI,
      {
        once: true
      }
    );
  } else {
    HZ.refreshUI();
  }

})();
