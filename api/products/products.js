const PRODUCTS_API = {
  async getAll(options = {}) {
    const params = new URLSearchParams();

    if (options.category) {
      params.set(
        "category",
        options.category
      );
    }

    if (options.categoryId) {
      params.set(
        "categoryId",
        options.categoryId
      );
    }

    if (options.search) {
      params.set(
        "search",
        options.search
      );
    }

    if (options.q) {
      params.set(
        "q",
        options.q
      );
    }

    if (options.limit) {
      params.set(
        "limit",
        String(options.limit)
      );
    }

    if (options.page) {
      params.set(
        "page",
        String(options.page)
      );
    }

    params.set(
      "t",
      Date.now().toString()
    );

    const query =
      params.toString();

    return API.get(
      `/api/products?${query}`
    );
  },

  async getById(id) {
    if (
      id === undefined ||
      id === null ||
      id === ""
    ) {
      throw new Error(
        "Product ID is required"
      );
    }

    return API.get(
      `/api/products/${encodeURIComponent(
        id
      )}?t=${Date.now()}`
    );
  },

  async search(query, options = {}) {
    return this.getAll({
      ...options,
      q: String(query || "").trim(),
      search: String(query || "").trim()
    });
  },

  normalize(product = {}) {
    return {
      id:
        product.id ??
        product.productId ??
        product.ID ??
        "",

      name:
        product.name ??
        product.title ??
        product.product_name ??
        "",

      description:
        product.description ??
        product.details ??
        "",

      price:
        Number(
          product.price ??
          product.salePrice ??
          0
        ),

      oldPrice:
        Number(
          product.oldPrice ??
          product.originalPrice ??
          product.comparePrice ??
          0
        ),

      discount:
        Number(
          product.discount ??
          product.discountRate ??
          0
        ),

      image:
        product.image ??
        product.imageUrl ??
        product.image_url ??
        product.thumbnail ??
        "",

      images:
        Array.isArray(
          product.images
        )
          ? product.images
          : product.image
            ? [product.image]
            : [],

      category:
        product.category ??
        product.categoryName ??
        "",

      categoryId:
        product.categoryId ??
        product.category_id ??
        "",

      rating:
        Number(
          product.rating ??
          product.averageRating ??
          0
        ),

      reviews:
        Number(
          product.reviews ??
          product.reviewCount ??
          0
        ),

      sales:
        Number(
          product.sales ??
          product.sold ??
          0
        ),

      stock:
        Number(
          product.stock ??
          product.quantity ??
          0
        ),

      available:
        product.available ??
        product.inStock ??
        true,

      badge:
        product.badge ??
        product.label ??
        "",

      createdAt:
        product.createdAt ??
        product.created_at ??
        null,

      updatedAt:
        product.updatedAt ??
        product.updated_at ??
        null,

      raw: product
    };
  },

  normalizeList(data) {
    if (
      Array.isArray(data)
    ) {
      return data.map(
        product =>
          this.normalize(product)
      );
    }

    if (
      Array.isArray(
        data?.products
      )
    ) {
      return data.products.map(
        product =>
          this.normalize(product)
      );
    }

    if (
      Array.isArray(
        data?.data
      )
    ) {
      return data.data.map(
        product =>
          this.normalize(product)
      );
    }

    return [];
  }
};
