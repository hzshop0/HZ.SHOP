const CACHE_NAME = "hz-shop-pwa-v1";

const PRECACHE_URLS = [
  "/",
  "/manifest.webmanifest",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/icons/icon-maskable-512.png"
];

self.addEventListener("install", function (event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      return Promise.all(
        PRECACHE_URLS.map(function (url) {
          return cache.add(url).catch(function (error) {
            console.warn("[PWA] Failed to cache:", url, error);
          });
        })
      );
    }).then(function () {
      return self.skipWaiting();
    })
  );
});

self.addEventListener("activate", function (event) {
  event.waitUntil(
    caches.keys().then(function (cacheNames) {
      return Promise.all(
        cacheNames.map(function (cacheName) {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(function () {
      return self.clients.claim();
    })
  );
});

self.addEventListener("fetch", function (event) {
  const request = event.request;
  const url = new URL(request.url);

  if (request.method !== "GET") {
    return;
  }

  if (
    url.protocol !== "http:" &&
    url.protocol !== "https:"
  ) {
    return;
  }

  /*
    لا نقوم بتخزين API أو بيانات الطلبات أو الحسابات
    حتى تبقى البيانات محدثة ولا يتم حفظ معلومات شخصية.
  */
  if (
    url.pathname.startsWith("/api/") ||
    url.pathname.startsWith("/admin") ||
    url.pathname.startsWith("/account") ||
    url.pathname.startsWith("/cart") ||
    url.pathname.startsWith("/checkout")
  ) {
    return;
  }

  /*
    صفحات التنقل:
    نحاول الاتصال بالشبكة أولًا، وإذا لم يوجد اتصال
    نعرض الصفحة الرئيسية المخزنة.
  */
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then(function (response) {
          if (response && response.ok) {
            const responseClone = response.clone();

            caches.open(CACHE_NAME).then(function (cache) {
              cache.put(request, responseClone);
            });
          }

          return response;
        })
        .catch(function () {
          return caches.match("/").then(function (cachedResponse) {
            return cachedResponse || new Response(
              "HZ.SHOP غير متاح حاليًا دون اتصال بالإنترنت.",
              {
                status: 503,
                headers: {
                  "Content-Type": "text/plain; charset=utf-8"
                }
              }
            );
          });
        })
    );

    return;
  }

  /*
    الملفات الثابتة:
    نستخدم النسخة المخزنة أولًا، وإذا لم تكن موجودة
    نطلبها من الشبكة ثم نخزنها.
  */
  event.respondWith(
    caches.match(request).then(function (cachedResponse) {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(request).then(function (networkResponse) {
        if (
          networkResponse &&
          networkResponse.status === 200 &&
          networkResponse.type === "basic"
        ) {
          const responseClone = networkResponse.clone();

          caches.open(CACHE_NAME).then(function (cache) {
            cache.put(request, responseClone);
          });
        }

        return networkResponse;
      });
    })
  );
});
