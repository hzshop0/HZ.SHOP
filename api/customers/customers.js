const CUSTOMERS_API = {
  async register(data = {}) {
    return API.post(
      "/api/customers/register",
      data
    );
  },

  async login(data = {}) {
    return API.post(
      "/api/customers/login",
      data
    );
  },

  async logout() {
    return API.post(
      "/api/customers/logout"
    );
  },

  async getCurrent() {
    return API.get(
      `/api/customers/me?t=${Date.now()}`
    );
  },

  async getProfile() {
    return API.get(
      `/api/customers/profile?t=${Date.now()}`
    );
  },

  async updateProfile(data = {}) {
    return API.put(
      "/api/customers/profile",
      data
    );
  },

  async getAddresses() {
    return API.get(
      `/api/customers/addresses?t=${Date.now()}`
    );
  },

  async addAddress(data = {}) {
    return API.post(
      "/api/customers/addresses",
      data
    );
  },

  async updateAddress(
    id,
    data = {}
  ) {
    if (
      id === undefined ||
      id === null ||
      id === ""
    ) {
      throw new Error(
        "Address ID is required"
      );
    }

    return API.put(
      `/api/customers/addresses/${encodeURIComponent(
        id
      )}`,
      data
    );
  },

  async deleteAddress(id) {
    if (
      id === undefined ||
      id === null ||
      id === ""
    ) {
      throw new Error(
        "Address ID is required"
      );
    }

    return API.delete(
      `/api/customers/addresses/${encodeURIComponent(
        id
      )}`
    );
  },

  normalize(customer = {}) {
    return {
      id:
        customer.id ??
        customer.customerId ??
        customer.ID ??
        "",

      name:
        customer.name ??
        customer.fullName ??
        customer.full_name ??
        "",

      email:
        customer.email ??
        "",

      phone:
        customer.phone ??
        customer.mobile ??
        "",

      avatar:
        customer.avatar ??
        customer.image ??
        customer.photo ??
        "",

      createdAt:
        customer.createdAt ??
        customer.created_at ??
        null,

      raw: customer
    };
  },

  normalizeList(data) {
    if (
      Array.isArray(data)
    ) {
      return data.map(
        customer =>
          this.normalize(customer)
      );
    }

    if (
      Array.isArray(
        data?.customers
      )
    ) {
      return data.customers.map(
        customer =>
          this.normalize(customer)
      );
    }

    if (
      Array.isArray(
        data?.data
      )
    ) {
      return data.data.map(
        customer =>
          this.normalize(customer)
      );
    }

    return [];
  }
};
