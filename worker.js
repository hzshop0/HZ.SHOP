async function uploadImageToGitHub(file, env) {
  const bytes = new Uint8Array(await file.arrayBuffer());

  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  const base64 = btoa(binary);

  const fileName =
    `images/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "-")}`;

  const response = await fetch(
    `https://api.github.com/repos/hzshop0/HZ.SHOP/contents/${fileName}`,
    {
      method: "PUT",
      headers: {
        "Authorization": `Bearer ${env.GITHUB_TOKEN}`,
        "Accept": "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
        "User-Agent": "HZ-SHOP"
      },
      body: JSON.stringify({
        message: `Upload product image ${fileName}`,
        content: base64
      })
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error);
  }

  return `https://raw.githubusercontent.com/hzshop0/HZ.SHOP/main/${fileName}`;
}


export default {
  async fetch(request, env) {

    const url = new URL(request.url);


    // API: اختبار كلمة سر الإدارة
    if (url.pathname === "/api/test-secret") {
      return Response.json({
        exists: !!env.ADMIN_PASSWORD
      });
    }


    // API: رفع صورة المنتج
    if (
      url.pathname === "/api/upload-image" &&
      request.method === "POST"
    ) {
      try {

        const cookie =
          request.headers.get("Cookie") || "";

        if (!cookie.includes("hz_admin=")) {
          return Response.json(
            { error: "غير مصرح" },
            { status: 401 }
          );
        }

        const formData =
          await request.formData();

        const file =
          formData.get("image");

        if (
          !file ||
          typeof file.arrayBuffer !== "function"
        ) {
          return Response.json(
            { error: "لم يتم اختيار صورة" },
            { status: 400 }
          );
        }

        if (!file.type.startsWith("image/")) {
          return Response.json(
            { error: "الملف يجب أن يكون صورة" },
            { status: 400 }
          );
        }

        const imageUrl =
          await uploadImageToGitHub(file, env);

        return Response.json({
          success: true,
          image: imageUrl
        });

      } catch (error) {

        return Response.json(
          { error: error.message },
          { status: 500 }
        );

      }
    }


    // API: تسجيل دخول الإدارة
    if (
      url.pathname === "/api/admin-login" &&
      request.method === "POST"
    ) {
      try {

        const data =
          await request.json();

        if (!data.password) {
          return Response.json(
            { error: "كلمة المرور مطلوبة" },
            { status: 400 }
          );
        }

        if (
          data.password !==
          env.ADMIN_PASSWORD
        ) {
          return Response.json(
            { error: "كلمة المرور غير صحيحة" },
            { status: 401 }
          );
        }

        const timestamp =
          Date.now().toString();

        const encoder =
          new TextEncoder();

        const key =
          await crypto.subtle.importKey(
            "raw",
            encoder.encode(
              env.ADMIN_PASSWORD
            ),
            {
              name: "HMAC",
              hash: "SHA-256"
            },
            false,
            ["sign"]
          );

        const signatureBuffer =
          await crypto.subtle.sign(
            "HMAC",
            key,
            encoder.encode(timestamp)
          );

        const signature =
          Array.from(
            new Uint8Array(
              signatureBuffer
            )
          )
            .map(
              b =>
                b
                  .toString(16)
                  .padStart(2, "0")
            )
            .join("");

        const cookieValue =
          `${timestamp}.${signature}`;

        return new Response(
          JSON.stringify({
            success: true
          }),
          {
            status: 200,
            headers: {
              "Content-Type":
                "application/json",

              "Set-Cookie":
                `hz_admin=${encodeURIComponent(
                  cookieValue
                )}; ` +
                `Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=86400`
            }
          }
        );

      } catch (error) {

        return Response.json(
          {
            error:
              "حدث خطأ في تسجيل الدخول"
          },
          { status: 500 }
        );

      }
    }


    // API: الطلبات
    // حفظ طلب جديد من الكمبيوتر
    if (
      url.pathname === "/api/orders" &&
      request.method === "POST"
    ) {
      try {

        const data =
          await request.json();

        if (
          !data.customer_name ||
          !data.phone ||
          !data.governorate ||
          !data.area ||
          !data.address ||
          !data.payment_method ||
          !data.items
        ) {
          return Response.json(
            {
              error:
                "جميع معلومات الطلب المطلوبة غير مكتملة"
            },
            { status: 400 }
          );
        }

        const result =
          await env.DB
            .prepare(`
              INSERT INTO orders (
                customer_name,
                phone,
                governorate,
                area,
                address,
                notes,
                payment_method,
                items,
                subtotal,
                discount,
                total,
                status,
                created_at
              )
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `)
            .bind(
              String(data.customer_name),
              String(data.phone),
              String(data.governorate),
              String(data.area),
              String(data.address),
              String(data.notes || ""),
              String(data.payment_method),
              JSON.stringify(data.items),
              Number(data.subtotal || 0),
              Number(data.discount || 0),
              Number(data.total || 0),
              "new",
              new Date().toISOString()
            )
            .run();

        return Response.json({
          success: true,
          order_id: result.meta.last_row_id
        });

      } catch (error) {

        console.error(error);

        return Response.json(
          {
            error:
              "تعذر حفظ الطلب"
          },
          { status: 500 }
        );

      }
    }


    // API: جلب الطلبات للإدارة
    if (
      url.pathname === "/api/orders" &&
      request.method === "GET"
    ) {
      try {

        const cookie =
          request.headers.get("Cookie") || "";

        const match =
          cookie.match(
            /hz_admin=([^;]+)/
          );

        if (!match) {
          return Response.json(
            { error: "غير مصرح" },
            { status: 401 }
          );
        }

        const { results } =
          await env.DB
            .prepare(`
              SELECT *
              FROM orders
              ORDER BY id DESC
            `)
            .all();

        return Response.json(
          results
        );

      } catch (error) {

        return Response.json(
          {
            error: error.message
          },
          { status: 500 }
        );

      }
    }


    // API: تحديث حالة الطلب
    if (
      url.pathname === "/api/orders" &&
      request.method === "PUT"
    ) {
      try {

        const cookie =
          request.headers.get("Cookie") || "";

        const match =
          cookie.match(
            /hz_admin=([^;]+)/
          );

        if (!match) {
          return Response.json(
            { error: "غير مصرح" },
            { status: 401 }
          );
        }

        const data =
          await request.json();

        if (!data.id || !data.status) {
          return Response.json(
            {
              error:
                "معرّف الطلب والحالة مطلوبان"
            },
            { status: 400 }
          );
        }

        await env.DB
          .prepare(`
            UPDATE orders
            SET status = ?
            WHERE id = ?
          `)
          .bind(
            String(data.status),
            Number(data.id)
          )
          .run();

        return Response.json({
          success: true
        });

      } catch (error) {

        return Response.json(
          {
            error: error.message
          },
          { status: 500 }
        );

      }
    }


    // API: المنتجات
    if (
      url.pathname === "/api/products"
    ) {

      // GET المنتجات
      if (request.method === "GET") {
        try {

          const { results } =
            await env.DB
              .prepare(
                "SELECT * FROM products ORDER BY id DESC"
              )
              .all();

          return Response.json(
            results
          );

        } catch (error) {

          return Response.json(
            {
              error:
                error.message
            },
            { status: 500 }
          );

        }
      }


      // POST / PUT المنتجات
      if (
        request.method === "POST" ||
        request.method === "PUT"
      ) {

        const cookie =
          request.headers.get("Cookie") || "";

        const match =
          cookie.match(
            /hz_admin=([^;]+)/
          );

        if (!match) {
          return Response.json(
            { error: "غير مصرح" },
            { status: 401 }
          );
        }

        try {

          const data =
            await request.json();

          if (
            !data.name ||
            !data.category ||
            data.price === undefined
          ) {
            return Response.json(
              {
                error:
                  "الاسم والقسم والسعر مطلوبة"
              },
              { status: 400 }
            );
          }


          // إضافة منتج
          if (
            request.method === "POST"
          ) {

            const result =
              await env.DB
                .prepare(`
                  INSERT INTO products
                  (
                    name,
                    category,
                    description,
                    price,
                    old_price,
                    image,
                    stock,
                    badge
                  )
                  VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                `)
                .bind(
                  data.name,
                  data.category,
                  data.description || "",
                  Number(data.price),
                  data.old_price
                    ? Number(
                        data.old_price
                      )
                    : null,
                  data.image || "",
                  Number(
                    data.stock || 0
                  ),
                  data.badge || ""
                )
                .run();

            return Response.json({
              success: true,
              id:
                result.meta.last_row_id
            });

          }


          // تعديل منتج
          if (!data.id) {
            return Response.json(
              {
                error:
                  "معرّف المنتج مطلوب"
              },
              { status: 400 }
            );
          }

          await env.DB
            .prepare(`
              UPDATE products
              SET
                name = ?,
                category = ?,
                description = ?,
                price = ?,
                old_price = ?,
                image = ?,
                stock = ?,
                badge = ?
              WHERE id = ?
            `)
            .bind(
              data.name,
              data.category,
              data.description || "",
              Number(data.price),
              data.old_price
                ? Number(
                    data.old_price
                  )
                : null,
              data.image || "",
              Number(
                data.stock || 0
              ),
              data.badge || "",
              Number(data.id)
            )
            .run();

          return Response.json({
            success: true
          });

        } catch (error) {

          return Response.json(
            {
              error:
                error.message
            },
            { status: 500 }
          );

        }
      }


      // حذف منتج
      if (
        request.method === "DELETE"
      ) {

        const cookie =
          request.headers.get("Cookie") || "";

        const match =
          cookie.match(
            /hz_admin=([^;]+)/
          );

        if (!match) {
          return Response.json(
            { error: "غير مصرح" },
            { status: 401 }
          );
        }

        const id =
          url.searchParams.get(
            "id"
          );

        if (!id) {
          return Response.json(
            {
              error:
                "معرّف المنتج مطلوب"
            },
            { status: 400 }
          );
        }

        try {

          await env.DB
            .prepare(
              "DELETE FROM products WHERE id = ?"
            )
            .bind(
              Number(id)
            )
            .run();

          return Response.json({
            success: true
          });

        } catch (error) {

          return Response.json(
            {
              error:
                error.message
            },
            { status: 500 }
          );

        }
      }
    }


    // باقي الملفات تُخدم كملفات الموقع العادية
    return env.ASSETS.fetch(request);
  }
};
