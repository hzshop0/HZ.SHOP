/* =================================
   HZ.SHOP — Storage
   Safe localStorage helpers
   ================================= */

(() => {
  "use strict";

  window.HZ = window.HZ || {};

  /* ---------------------------------
     Read
     --------------------------------- */

  HZ.storageGet = (key, fallback = null) => {
    try {
      const value = localStorage.getItem(key);

      if (value === null) {
        return fallback;
      }

      return value;
    } catch (error) {
      console.error("HZ.SHOP storage read error:", error);
      return fallback;
    }
  };

  /* ---------------------------------
     Write
     --------------------------------- */

  HZ.storageSet = (key, value) => {
    try {
      localStorage.setItem(key, String(value));
      return true;
    } catch (error) {
      console.error("HZ.SHOP storage write error:", error);
      return false;
    }
  };

  /* ---------------------------------
     Remove
     --------------------------------- */

  HZ.storageRemove = (key) => {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error("HZ.SHOP storage remove error:", error);
      return false;
    }
  };

  /* ---------------------------------
     JSON Read
     --------------------------------- */

  HZ.storageGetJSON = (key, fallback = null) => {
    try {
      const value = localStorage.getItem(key);

      if (value === null) {
        return fallback;
      }

      return JSON.parse(value);
    } catch (error) {
      console.error("HZ.SHOP storage JSON read error:", error);
      return fallback;
    }
  };

  /* ---------------------------------
     JSON Write
     --------------------------------- */

  HZ.storageSetJSON = (key, value) => {
    try {
      localStorage.setItem(
        key,
        JSON.stringify(value)
      );

      return true;
    } catch (error) {
      console.error("HZ.SHOP storage JSON write error:", error);
      return false;
    }
  };

  /* ---------------------------------
     Clear one key
     --------------------------------- */

  HZ.storageHas = (key) => {
    try {
      return localStorage.getItem(key) !== null;
    } catch (error) {
      console.error("HZ.SHOP storage check error:", error);
      return false;
    }
  };

})();
