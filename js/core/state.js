const APP_STATE = {
  language: "ar",
  direction: "rtl",

  customer: null,

  cart: {
    items: [],
    count: 0,
    subtotal: 0,
    deliveryFee: 4,
    total: 4
  },

  wishlist: [],

  recentlyViewed: [],

  notifications: [],

  search: {
    query: "",
    results: []
  }
};

window.APP_STATE = APP_STATE;
