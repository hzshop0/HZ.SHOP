const SECTION = {

    create(section = {}) {

        const template =
            document.querySelector("#sectionTemplate");

        let element = null;

        /*
         * Use the existing template when available.
         */
        if (template && template.content) {

            element =
                template.content
                    .firstElementChild
                    ?.cloneNode(true);

        }

        /*
         * Fallback section for the new storefront.
         * This prevents SECTION from failing when
         * no template has been loaded yet.
         */
        if (!element) {

            element = document.createElement("section");

            element.className = "store-section";

            element.innerHTML = `
                <div class="section-container">

                    <div class="store-section-header">

                        <div class="store-section-heading">

                            <span
                                class="store-section-eyebrow"
                                hidden
                            ></span>

                            <h2 class="store-section-title"></h2>

                            <p
                                class="store-section-subtitle"
                                hidden
                            ></p>

                        </div>

                        <a
                            href="#"
                            class="store-section-more"
                            hidden
                        >
                            عرض الكل
                            <span aria-hidden="true">‹</span>
                        </a>

                    </div>

                    <div class="store-section-content"></div>

                </div>
            `;

        }

        this.update(element, section);

        return element;

    },


    update(element, section = {}) {

        if (!element) return;

        const sectionId =
            section.id ??
            section.sectionId ??
            "";

        const title =
            section.title ??
            "";

        const subtitle =
            section.subtitle ??
            "";

        const link =
            section.link ??
            section.url ??
            "";

        const eyebrow =
            section.eyebrow ??
            "";


        element.dataset.sectionId =
            String(sectionId);


        if (section.className) {

            element.classList.add(
                ...String(section.className)
                    .split(/\s+/)
                    .filter(Boolean)
            );

        }


        const titleElement =
            element.querySelector(
                ".store-section-title"
            );

        const subtitleElement =
            element.querySelector(
                ".store-section-subtitle"
            );

        const eyebrowElement =
            element.querySelector(
                ".store-section-eyebrow"
            );

        const moreElement =
            element.querySelector(
                ".store-section-more"
            );

        const contentElement =
            element.querySelector(
                ".store-section-content"
            );


        if (titleElement) {

            titleElement.textContent =
                title;

            titleElement.hidden =
                !title;

        }


        if (subtitleElement) {

            subtitleElement.textContent =
                subtitle;

            subtitleElement.hidden =
                !subtitle;

        }


        if (eyebrowElement) {

            eyebrowElement.textContent =
                eyebrow;

            eyebrowElement.hidden =
                !eyebrow;

        }


        if (moreElement) {

            if (link) {

                moreElement.href =
                    link;

                moreElement.hidden =
                    false;

            } else {

                moreElement.removeAttribute("href");

                moreElement.hidden =
                    true;

            }

        }


        if (
            contentElement &&
            Object.prototype.hasOwnProperty.call(
                section,
                "content"
            )
        ) {

            this.setContent(
                element,
                section.content
            );

        }


        if (
            section.hidden === true
        ) {

            element.hidden = true;

        } else if (
            section.hidden === false
        ) {

            element.hidden = false;

        }


        return element;

    },


    setContent(element, content = "") {

        if (!element) return;

        const container =
            element.querySelector(
                ".store-section-content"
            );

        if (!container) return;

        if (content instanceof Node) {

            container.replaceChildren(content);

            return;

        }

        if (Array.isArray(content)) {

            container.replaceChildren(
                ...content.filter(
                    (item) => item instanceof Node
                )
            );

            return;

        }

        container.innerHTML =
            String(content || "");

    },


    appendContent(element, content) {

        if (!element) return;

        const container =
            element.querySelector(
                ".store-section-content"
            );

        if (!container) return;

        if (content instanceof Node) {

            container.appendChild(content);

            return;

        }

        if (Array.isArray(content)) {

            content.forEach((item) => {

                if (item instanceof Node) {
                    container.appendChild(item);
                }

            });

            return;

        }

        if (content !== null && content !== undefined) {

            container.insertAdjacentHTML(
                "beforeend",
                String(content)
            );

        }

    },


    clearContent(element) {

        if (!element) return;

        const container =
            element.querySelector(
                ".store-section-content"
            );

        if (!container) return;

        container.replaceChildren();

    }

};


window.SECTION = SECTION;
