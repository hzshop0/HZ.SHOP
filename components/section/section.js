const SECTION = {
  create(section = {}) {
    const template = document.querySelector(
      "#sectionTemplate"
    );

    if (!template) {
      return null;
    }

    const element = template.content
      .firstElementChild
      .cloneNode(true);

    this.update(element, section);

    return element;
  },

  update(element, section = {}) {
    if (!element) return;

    const id =
      section.id ??
      section.sectionId ??
      "";

    element.dataset.sectionId = id;

    const title = element.querySelector(
      ".store-section-title"
    );

    const subtitle = element.querySelector(
      ".store-section-subtitle"
    );

    const more = element.querySelector(
      ".store-section-more"
    );

    const content = element.querySelector(
      ".store-section-content"
    );

    if (title) {
      title.textContent =
        section.title || "";
    }

    if (subtitle) {
      if (section.subtitle) {
        subtitle.textContent =
          section.subtitle;

        subtitle.hidden = false;
      } else {
        subtitle.hidden = true;
      }
    }

    if (more) {
      if (section.link) {
        more.href = section.link;
        more.hidden = false;
      } else {
        more.hidden = true;
      }
    }

    if (content && section.content) {
      content.innerHTML =
        section.content;
    }
  },

  setContent(element, content) {
    if (!element) return;

    const container =
      element.querySelector(
        ".store-section-content"
      );

    if (!container) return;

    container.innerHTML =
      content || "";
  }
};
