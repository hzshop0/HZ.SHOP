/* =================================
   HZ.SHOP — Categories
   Category helpers
   ================================= */
(() => {
  "use strict";
  window.HZ = window.HZ || {};
  HZ.categories = [];
  /* ---------------------------------
     Category aliases
     Matches Index.html categories
     --------------------------------- */
  const CATEGORY_ALIASES = {
    all: "all",
    perfumes: "perfumes",
    perfume: "perfumes",
    fragrance: "perfumes",
    fragrances: "perfumes",
    makeup: "makeup",
    make_up: "makeup",
    skin: "skin",
    skincare: "skin",
    skin_care: "skin",
    personal: "personal",
    personal_care: "personal",
    accessories: "accessories",
    accessory: "accessories",
    clothing: "clothing",
    clothes: "clothing",
    lingerie: "lingerie",
    home: "home",
    electronics: "electronics",
    electronic: "electronics",
    kids: "kids",
    toys: "kids",
    children: "kids",
    cleaning: "cleaning"
  };
  /* ---------------------------------
     Normalize category value
     --------------------------------- */
  HZ.normalizeCategory = (
    category
  ) => {
    if (
      category === undefined ||
      category === null
    ) {
      return "";
    }
    const text =
      String(category)
        .trim()
        .toLowerCase();
    if (!text) {
      return "";
    }
    return (
      CATEGORY_ALIASES[text] ||
      text
    );
  };
  /* ---------------------------------
     Category display names
     Matches Index.html
     --------------------------------- */
  HZ.categoryName = (
    category
  ) => {
    const value =
      HZ.normalizeCategory(
        category
      );
    const names = {
      all:
        "جميع المنتجات",
      perfumes:
        "العطور",
      makeup:
        "مكياج",
      skin:
        "العناية بالبشرة",
      personal:
        "العناية الشخصية",
      accessories:
        "إكسسوارات",
      clothing:
        "ملابس",
      lingerie:
        "لانجري",
      home:
        "منزل",
      electronics:
        "إلكترونيات",
      kids:
        "ألعاب أطفال",
      cleaning:
        "النظافة"
    };
    return (
      names[value] ||
      String(category ?? "")
    );
  };
  /* ---------------------------------
     Normalize category object
     --------------------------------- */
  HZ.normalizeCategoryObject = (
    category
  ) => {
    if (
      typeof category ===
      "string"
    ) {
      const id =
        HZ.normalizeCategory(
          category
        );
      return {
        id,
        name:
          HZ.categoryName(
            id
          ),
        image: ""
      };
    }
    if (
      !category ||
      typeof category !==
      "object"
    ) {
      return null;
    }
    const rawId =
      category.id ??
      category.category_id ??
      category.slug ??
      category.name ??
      "";
    const id =
      HZ.normalizeCategory(
        rawId
      );
    const rawName =
      category.name ??
      category.title ??
      category.category_name ??
      "";
    return {
      ...category,
      id,
      name:
        rawName ||
        HZ.categoryName(id),
      image:
        category.image ??
        category.image_url ??
        category.imageUrl ??
        ""
    };
  };
  /* ---------------------------------
     Backward compatibility
     --------------------------------- */
  HZ.normalizeCategoryObjectLegacy =
    HZ.normalizeCategoryObject;
  /* ---------------------------------
     Build categories from products
     --------------------------------- */
  HZ.buildCategoriesFromProducts = (
    products = HZ.products
  ) => {
    const map =
      new Map();
    if (
      !Array.isArray(products)
    ) {
      HZ.categories = [];
      return HZ.categories;
    }
    products.forEach(
      product => {
        if (
          !product ||
          typeof product !==
          "object"
        ) {
          return;
        }
        const rawCategory =
          product.category;
        if (
          rawCategory ===
            undefined ||
          rawCategory ===
            null
        ) {
          return;
        }
        const rawText =
          String(
            rawCategory
          ).trim();
        if (!rawText) {
          return;
        }
        const id =
          HZ.normalizeCategory(
            rawText
          );
        if (!id) {
          return;
        }
        if (
          !map.has(id)
        ) {
          map.set(
            id,
            {
              id,
              name:
                product.categoryName ||
                HZ.categoryName(
                  id
                ),
              image:
                product.image ||
                (
                  Array.isArray(
                    product.images
                  )
                    ? product.images[0]
                    : ""
                ) ||
                ""
            }
          );
        }
      }
    );
    HZ.categories =
      Array.from(
        map.values()
      );
    return HZ.categories;
  };
  /* ---------------------------------
     Load categories
     --------------------------------- */
  HZ.loadCategories = async () => {
    try {
      const response =
        await HZ.apiGet(
          `/categories?t=${Date.now()}`
        );
      let categories = [];
      if (
        Array.isArray(
          response
        )
      ) {
        categories =
          response;
      } else if (
        response &&
        Array.isArray(
          response.categories
        )
      ) {
        categories =
          response.categories;
      } else if (
        response &&
        Array.isArray(
          response.data
        )
      ) {
        categories =
          response.data;
      }
      HZ.categories =
        categories
          .map(
            category =>
              HZ.normalizeCategoryObject(
                category
              )
          )
          .filter(
            category =>
              category &&
              category.name
          );
      return HZ.categories;
    } catch (error) {
      /*
       * The current Index.html does not
       * require a separate categories API.
       *
       * If the endpoint is unavailable,
       * build the categories from products.
       */
      if (
        Array.isArray(
          HZ.products
        )
      ) {
        return HZ.buildCategoriesFromProducts();
      }
      throw error;
    }
  };
  /* ---------------------------------
     Find category
     --------------------------------- */
  HZ.getCategoryById = (
    id
  ) => {
    if (
      id === undefined ||
      id === null
    ) {
      return null;
    }
    const normalizedId =
      HZ.normalizeCategory(
        id
      );
    return (
      HZ.categories.find(
        category =>
          HZ.normalizeCategory(
            category.id
          ) === normalizedId
      ) || null
    );
  };
  /* ---------------------------------
     Products by category
     --------------------------------- */
  HZ.getProductsByCategory = (
    category
  ) => {
    const value =
      HZ.normalizeCategory(
        category
      );
    if (!value) {
      return [];
    }
    return (
      Array.isArray(
        HZ.products
      )
        ? HZ.products
        : []
    ).filter(
      product =>
        HZ.normalizeCategory(
          product?.category
        ) === value
    );
  };
  /* ---------------------------------
     Check category
     --------------------------------- */
  HZ.productMatchesCategory = (
    product,
    category
  ) => {
    if (!product) {
      return false;
    }
    const value =
      HZ.normalizeCategory(
        category
      );
    if (
      !value ||
      value === "all"
    ) {
      return true;
    }
    return (
      HZ.normalizeCategory(
        product.category
      ) === value
    );
  };
})();
