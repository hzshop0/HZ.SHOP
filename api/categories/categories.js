const CATEGORIES_API = {
  async getAll() {
    return API.get(
      `/api/categories?t=${Date.now()}`
    );
  },

  async getById(id) {
    if (
      id === undefined ||
      id === null ||
      id === ""
    ) {
      throw new Error(
        "Category ID is required"
      );
    }

    return API.get(
      `/api/categories/${encodeURIComponent(
        id
      )}?t=${Date.now()}`
    );
  },

  normalize(category = {}) {
    return {
      id:
        category.id ??
        category.categoryId ??
        category.ID ??
        "",

      name:
        category.name ??
        category.title ??
        category.category_name ??
        "",

      description:
        category.description ??
        "",

      image:
        category.image ??
        category.imageUrl ??
        category.image_url ??
        category.thumbnail ??
        "",

      icon:
        category.icon ??
        "",

      parentId:
        category.parentId ??
        category.parent_id ??
        null,

      productCount:
        Number(
          category.productCount ??
          category.product_count ??
          category.count ??
          0
        ),

      active:
        category.active ??
        category.enabled ??
        true,

      sortOrder:
        Number(
          category.sortOrder ??
          category.sort_order ??
          0
        ),

      raw: category
    };
  },

  normalizeList(data) {
    if (
      Array.isArray(data)
    ) {
      return data.map(
        category =>
          this.normalize(category)
      );
    }

    if (
      Array.isArray(
        data?.categories
      )
    ) {
      return data.categories.map(
        category =>
          this.normalize(category)
      );
    }

    if (
      Array.isArray(
        data?.data
      )
    ) {
      return data.data.map(
        category =>
          this.normalize(category)
      );
    }

    return [];
  }
};
