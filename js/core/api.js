const API = {
  async get(endpoint, options = {}) {
    const response = await fetch(endpoint, {
      method: "GET",
      cache: "no-store",
      ...options
    });

    if (!response.ok) {
      throw new Error(`API GET Error: ${response.status}`);
    }

    return response.json();
  },

  async post(endpoint, data = {}, options = {}) {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {})
      },
      body: JSON.stringify(data),
      ...options
    });

    if (!response.ok) {
      throw new Error(`API POST Error: ${response.status}`);
    }

    return response.json();
  },

  async put(endpoint, data = {}, options = {}) {
    const response = await fetch(endpoint, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {})
      },
      body: JSON.stringify(data),
      ...options
    });

    if (!response.ok) {
      throw new Error(`API PUT Error: ${response.status}`);
    }

    return response.json();
  },

  async delete(endpoint, options = {}) {
    const response = await fetch(endpoint, {
      method: "DELETE",
      cache: "no-store",
      ...options
    });

    if (!response.ok) {
      throw new Error(`API DELETE Error: ${response.status}`);
    }

    return response.json();
  }
};
