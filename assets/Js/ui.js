/* =================================
   HZ.SHOP — UI
   Shared interface helpers
   ================================= */

(() => {
  "use strict";

  window.HZ = window.HZ || {};

  /* ---------------------------------
     Toast
     --------------------------------- */

  HZ.toast = (
    message,
    type = "info",
    duration = 3000
  ) => {
    let toast =
      document.getElementById(
        "hzToast"
      );

    if (!toast) {
      toast = document.createElement("div");

      toast.id = "hzToast";
      toast.setAttribute(
        "role",
        "status"
      );
      toast.setAttribute(
        "aria-live",
        "polite"
      );

      Object.assign(
        toast.style,
        {
          position: "fixed",
          left: "50%",
          bottom: "24px",
          transform:
            "translate(-50%,20px)",
          zIndex: "99999",
          maxWidth: "calc(100% - 32px)",
          padding: "12px 18px",
          borderRadius: "8px",
          background: "#111",
          color: "#fff",
          fontSize: "13px",
          textAlign: "center",
          opacity: "0",
          pointerEvents: "none",
          transition:
            "opacity .2s ease, transform .2s ease"
        }
      );

      document.body.appendChild(toast);
    }

    toast.textContent =
      String(message ?? "");

    if (type === "success") {
      toast.style.border =
        "1px solid #2e8b57";
    } else if (type === "error") {
      toast.style.border =
        "1px solid #d93025";
    } else {
      toast.style.border =
        "1px solid #444";
    }

    clearTimeout(
      toast._hzTimer
    );

    requestAnimationFrame(() => {
      toast.style.opacity = "1";
      toast.style.transform =
        "translate(-50%,0)";
    });

    toast._hzTimer =
      setTimeout(() => {
        toast.style.opacity = "0";
        toast.style.transform =
          "translate(-50%,20px)";
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

    HZ.lockScroll();

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

    HZ.unlockScroll();

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
     Cart badge
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

      element.hidden = count <= 0;
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

        element.hidden = count <= 0;
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
      { once: true }
    );
  } else {
    HZ.refreshUI();
  }

})();
