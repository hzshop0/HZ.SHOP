/* =================================
   HZ.SHOP — API
   Shared API layer
   ================================= */
(() => {
  "use strict";
  window.HZ = window.HZ || {};
  /* ---------------------------------
     API base
     --------------------------------- */
  HZ.API = HZ.API || "/api";
  /* ---------------------------------
     Main API request
     --------------------------------- */
  HZ.api = async (
    endpoint,
    options = {}
  ) => {
    const {
      method = "GET",
      body,
      headers = {},
      ...rest
    } = options;
    const config = {
      method,
      credentials: "include",
      cache: "no-store",
      headers: {
        Accept: "application/json",
        ...headers
      },
      ...rest
    };
    if (body !== undefined) {
      config.headers[
        "Content-Type"
      ] = "application/json";
      config.body =
        typeof body === "string"
          ? body
          : JSON.stringify(body);
    }
    const response =
      await fetch(
        `${HZ.API}${endpoint}`,
        config
      );
    const contentType =
      response.headers.get(
        "content-type"
      ) || "";
    let data;
    if (
      contentType.includes(
        "application/json"
      )
    ) {
      data =
        await response.json();
    } else {
      data =
        await response.text();
    }
    if (!response.ok) {
      const message =
        data &&
        typeof data === "object" &&
        data.message
          ? data.message
          : `API request failed (${response.status})`;
      const error =
        new Error(message);
      error.status =
        response.status;
      error.data =
        data;
      throw error;
    }
    return data;
  };
  /* ---------------------------------
     GET
     --------------------------------- */
  HZ.apiGet = (
    endpoint,
    options = {}
  ) => {
    return HZ.api(
      endpoint,
      {
        ...options,
        method: "GET"
      }
    );
  };
  /* ---------------------------------
     POST
     --------------------------------- */
  HZ.apiPost = (
    endpoint,
    body,
    options = {}
  ) => {
    return HZ.api(
      endpoint,
      {
        ...options,
        method: "POST",
        body
      }
    );
  };
  /* ---------------------------------
     PUT
     --------------------------------- */
  HZ.apiPut = (
    endpoint,
    body,
    options = {}
  ) => {
    return HZ.api(
      endpoint,
      {
        ...options,
        method: "PUT",
        body
      }
    );
  };
  /* ---------------------------------
     DELETE
     --------------------------------- */
  HZ.apiDelete = (
    endpoint,
    options = {}
  ) => {
    return HZ.api(
      endpoint,
      {
        ...options,
        method: "DELETE"
      }
    );
  };
  /* ---------------------------------
     Products
     --------------------------------- */
  HZ.getProducts = async () => {
    return HZ.apiGet(
      `/products?t=${Date.now()}`
    );
  };
  /* ---------------------------------
     Customer session
     --------------------------------- */
  HZ.getCustomerSession = () => {
    return HZ.apiGet(
      "/customer-me"
    );
  };
})();
