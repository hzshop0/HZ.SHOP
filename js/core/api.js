const API = {

  async get(endpoint, options = {}) {
    const response = await fetch(endpoint, {
      ...options,
      method: "GET",
      cache: "no-store"
    });

    if (!response.ok) {
      throw new Error(`API GET Error: ${response.status}`);
    }

    return response.json();
  },

  async post(endpoint, data = {}, options = {}) {
    const response = await fetch(endpoint, {
      ...options,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {})
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error(`API POST Error: ${response.status}`);
    }

    return response.json();
  },

  async put(endpoint, data = {}, options = {}) {
    const response = await fetch(endpoint, {
      ...options,
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {})
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error(`API PUT Error: ${response.status}`);
    }

    return response.json();
  },

  async delete(endpoint, options = {}) {
    const response = await fetch(endpoint, {
      ...options,
      method: "DELETE",
      cache: "no-store"
    });

    if (!response.ok) {
      throw new Error(`API DELETE Error: ${response.status}`);
    }

    return response.json();
  }
};

window.API = API;
