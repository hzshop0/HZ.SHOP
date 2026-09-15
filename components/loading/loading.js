const LOADING = {
  show(container, message = "جاري التحميل...") {
    if (!container) return;

    const template =
      document.querySelector(
        "#loadingTemplate"
      );

    if (!template) return;

    container.innerHTML = "";

    const element =
      template.content
        .firstElementChild
        .cloneNode(true);

    const text =
      element.querySelector(
        ".store-loading-text"
      );

    if (text) {
      text.textContent = message;
    }

    container.appendChild(element);
  },

  hide(container) {
    if (!container) return;

    const loading =
      container.querySelector(
        ".store-loading"
      );

    if (loading) {
      loading.remove();
    }
  }
};
