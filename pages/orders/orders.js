/* =========================================================
   HZ.SHOP
   Orders Page
   ========================================================= */

const ORDERS_PAGE = {

  loadingElement: null,
  listElement: null,
  emptyElement: null,
  errorElement: null,
  errorMessageElement: null,
  retryButton: null,
  subtitleElement: null,

  /* =======================================================
     ELEMENTS
     ======================================================= */

  cacheElements() {

    this.loadingElement =
      document.querySelector(
        "[data-orders-loading]"
      );

    this.listElement =
      document.querySelector(
        "[data-orders-list]"
      );

    this.emptyElement =
      document.querySelector(
        "[data-orders-empty]"
      );

    this.errorElement =
      document.querySelector(
        "[data-orders-error]"
      );

    this.errorMessageElement =
      document.querySelector(
        "[data-orders-error-message]"
      );

    this.retryButton =
      document.querySelector(
        "[data-orders-retry]"
      );

    this.subtitleElement =
      document.querySelector(
        "[data-orders-subtitle]"
      );

  },


  /* =======================================================
     STATE
     ======================================================= */

  setLoading(isLoading) {

    if (
      this.loadingElement
    ) {

      this.loadingElement.hidden =
        !isLoading;

    }

  },


  showEmpty() {

    if (
      this.emptyElement
    ) {

      this.emptyElement.hidden =
        false;

    }

  },


  hideEmpty() {

    if (
      this.emptyElement
    ) {

      this.emptyElement.hidden =
        true;

    }

  },


  showError(message) {

    if (
      this.errorMessageElement
    ) {

      this.errorMessageElement.textContent =
        message ||
        "حدث خطأ أثناء تحميل الطلبات.";

    }

    if (
      this.errorElement
    ) {

      this.errorElement.hidden =
        false;

    }

  },


  hideError() {

    if (
      this.errorElement
    ) {

      this.errorElement.hidden =
        true;

    }

  },


  /* =======================================================
     LOAD ORDERS
     ======================================================= */

  async loadOrders() {

    this.setLoading(true);

    this.hideEmpty();

    this.hideError();

    if (
      this.listElement
    ) {

      this.listElement.innerHTML =
        "";

    }

    try {

      const response =
        await fetch(
          "/api/customer-orders",
          {
            method: "GET",
            credentials: "include",
            cache: "no-store",
            headers: {
              "Accept":
                "application/json"
            }
          }
        );


      let data = null;

      try {

        data =
          await response.json();

      } catch (error) {

        data = null;

      }


      if (
        response.status === 401
      ) {

        this.showError(
          data &&
          (
            data.error ||
            data.message
          )
            ?
            (
              data.error ||
              data.message
            )
            :
            "يجب تسجيل الدخول لرؤية الطلبات."
        );

        return;

      }


      if (
        !response.ok
      ) {

        throw new Error(
          data &&
          (
            data.error ||
            data.message
          )
            ?
            (
              data.error ||
              data.message
            )
            :
            "تعذر جلب الطلبات."
        );

      }


      const orders =
        Array.isArray(
          data?.orders
        )
          ?
          data.orders
          :
          [];


      this.renderOrders(
        orders
      );

    } catch (error) {

      console.error(
        "HZ.SHOP orders page error:",
        error
      );

      this.showError(
        error?.message ||
        "تعذر تحميل الطلبات."
      );

    } finally {

      this.setLoading(false);

    }

  },


  /* =======================================================
     RENDER ORDERS
     ======================================================= */

  renderOrders(orders) {

    this.hideEmpty();

    this.hideError();

    if (
      !this.listElement
    ) {

      return;

    }


    if (
      !Array.isArray(orders) ||
      orders.length === 0
    ) {

      this.listElement.innerHTML =
        "";

      this.showEmpty();

      return;

    }


    if (
      this.subtitleElement
    ) {

      this.subtitleElement.textContent =
        `${orders.length} طلب`;

      this.subtitleElement.hidden =
        false;

    }


    this.listElement.innerHTML =
      orders
        .map(
          order =>
            this.renderOrder(
              order
            )
        )
        .join("");

  },


  /* =======================================================
     RENDER SINGLE ORDER
     ======================================================= */

  renderOrder(order) {

    const orderId =
      order?.id ??
      order?.order_id ??
      order?.order_number ??
      "-";


    const status =
      String(
        order?.status ||
        "pending"
      )
        .trim()
        .toLowerCase();


    const statusText =
      this.getStatusText(
        status
      );


    const date =
      this.formatDate(
        order?.created_at ||
        order?.createdAt ||
        order?.date
      );


    const items =
      this.parseItems(
        order?.items
      );


    const subtotal =
      this.toNumber(
        order?.subtotal
      );


    const discount =
      this.toNumber(
        order?.discount
      );


    const delivery =
      this.toNumber(
        order?.delivery_fee ??
        order?.delivery
      );


    const total =
      this.toNumber(
        order?.total
      );


    const itemsHTML =
      items.length
        ?
        `
          <div class="order-items">
            ${items
              .map(
                item =>
                  this.renderItem(
                    item
                  )
              )
              .join("")}
          </div>
        `
        :
        "";


    return `
      <article
        class="order-card"
        data-order-id="${this.escapeHTML(orderId)}"
      >

        <header class="order-card-header">

          <div>

            <h2 class="order-card-number">
              الطلب #${this.escapeHTML(orderId)}
            </h2>

            ${
              date
                ?
                `
                  <p class="order-card-date">
                    ${this.escapeHTML(date)}
                  </p>
                `
                :
                ""
            }

          </div>

          <span
            class="order-status ${this.escapeHTML(status)}"
          >
            ${this.escapeHTML(statusText)}
          </span>

        </header>


        ${itemsHTML}


        <div class="order-summary">

          ${
            subtotal > 0
              ?
              `
                <div class="order-summary-row">

                  <span>
                    المجموع الفرعي
                  </span>

                  <span class="order-summary-value">
                    $${subtotal.toFixed(2)}
                  </span>

                </div>
              `
              :
              ""
          }


          ${
            discount > 0
              ?
              `
                <div class="order-summary-row">

                  <span>
                    الخصم
                  </span>

                  <span class="order-summary-value">
                    -$${discount.toFixed(2)}
                  </span>

                </div>
              `
              :
              ""
          }


          ${
            delivery >= 0
              ?
              `
                <div class="order-summary-row">

                  <span>
                    التوصيل
                  </span>

                  <span class="order-summary-value">
                    $${delivery.toFixed(2)}
                  </span>

                </div>
              `
              :
              ""
          }


          <div class="order-summary-row total">

            <span>
              الإجمالي
            </span>

            <span class="order-summary-value">
              $${total.toFixed(2)}
            </span>

          </div>

        </div>

      </article>
    `;

  },


  /* =======================================================
     RENDER ITEM
     ======================================================= */

  renderItem(item) {

    const name =
      String(
        item?.name ||
        item?.title ||
        "منتج"
      );


    const quantity =
      this.toNumber(
        item?.quantity
      ) || 1;


    const price =
      this.toNumber(
        item?.price
      );


    const image =
      item?.image ||
      item?.image_url ||
      item?.imageUrl ||
      "";


    const imageHTML =
      image
        ?
        `
          <div class="order-item-image">

            <img
              src="${this.escapeHTML(image)}"
              alt="${this.escapeHTML(name)}"
              loading="lazy"
              onerror="this.style.display='none'"
            >

          </div>
        `
        :
        `
          <div
            class="order-item-image"
            aria-hidden="true"
          ></div>
        `;


    return `
      <div class="order-item">

        ${imageHTML}

        <div class="order-item-info">

          <h3 class="order-item-name">
            ${this.escapeHTML(name)}
          </h3>

          <p class="order-item-meta">
            الكمية: ${quantity}
          </p>

        </div>

        <div class="order-item-price">
          $${price.toFixed(2)}
        </div>

      </div>
    `;

  },


  /* =======================================================
     PARSE ITEMS
     ======================================================= */

  parseItems(items) {

    if (
      Array.isArray(items)
    ) {

      return items;

    }


    if (
      typeof items === "string"
    ) {

      try {

        const parsed =
          JSON.parse(items);

        return Array.isArray(parsed)
          ?
          parsed
          :
          [];

      } catch (error) {

        return [];

      }

    }


    return [];

  },


  /* =======================================================
     STATUS
     ======================================================= */

  getStatusText(status) {

    const statuses = {

      pending:
        "قيد المراجعة",

      confirmed:
        "تم تأكيد الطلب",

      processing:
        "جاري التجهيز",

      shipped:
        "تم الشحن",

      delivered:
        "تم التسليم",

      cancelled:
        "ملغي",

      canceled:
        "ملغي"

    };


    return (
      statuses[status] ||
      status ||
      "قيد المراجعة"
    );

  },


  /* =======================================================
     DATE
     ======================================================= */

  formatDate(value) {

    if (
      !value
    ) {

      return "";

    }


    const date =
      new Date(
        value
      );


    if (
      Number.isNaN(
        date.getTime()
      )
    ) {

      return String(
        value
      );

    }


    try {

      return new Intl.DateTimeFormat(
        "ar-LB",
        {
          year: "numeric",
          month: "long",
          day: "numeric"
        }
      ).format(
        date
      );

    } catch (error) {

      return date.toLocaleDateString();

    }

  },


  /* =======================================================
     NUMBER
     ======================================================= */

  toNumber(value) {

    const number =
      Number(
        value
      );


    return Number.isFinite(
      number
    )
      ?
      number
      :
      0;

  },


  /* =======================================================
     ESCAPE HTML
     ======================================================= */

  escapeHTML(value) {

    if (
      typeof UTILS !== "undefined" &&
      typeof UTILS.escapeHTML === "function"
    ) {

      return UTILS.escapeHTML(
        String(value ?? "")
      );

    }


    return String(
      value ?? ""
    )
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

  },


  /* =======================================================
     EVENTS
     ======================================================= */

  bindEvents() {

    if (
      this.retryButton
    ) {

      this.retryButton.addEventListener(
        "click",
        () => {
          this.loadOrders();
        }
      );

    }

  },


  /* =======================================================
     INIT
     ======================================================= */

  init() {

    this.cacheElements();

    this.bindEvents();

    this.loadOrders();

  }

};


/* =========================================================
   GLOBAL EXPORT
   ========================================================= */

window.ORDERS_PAGE =
  ORDERS_PAGE;


/* =========================================================
   DOM READY
   ========================================================= */

document.addEventListener(
  "DOMContentLoaded",
  () => {

    ORDERS_PAGE.init();

  }
);
