export default {
  async fetch(request, env) {
    if (new URL(request.url).pathname === "/api/test-secret") {
  return Response.json({
    exists: !!env.ADMIN_PASSWORD
  });
}
    const url = new URL(request.url);

    // API: تسجيل دخول الإدارة
    if (url.pathname === "/api/admin-login" && request.method === "POST") {
      try {
        const data = await request.json();

        if (!data.password) {
          return Response.json(
            { error: "كلمة المرور مطلوبة" },
            { status: 400 }
          );
        }

        if (data.password !== env.ADMIN_PASSWORD) {
          return Response.json(
            { error: "كلمة المرور غير صحيحة" },
            { status: 401 }
          );
        }

        const timestamp = Date.now().toString();

        const encoder = new TextEncoder();

        const key = await crypto.subtle.importKey(
          "raw",
          encoder.encode(env.ADMIN_PASSWORD),
          { name: "HMAC", hash: "SHA-256" },
          false,
          ["sign"]
        );

        const signatureBuffer = await crypto.subtle.sign(
          "HMAC",
          key,
          encoder.encode(timestamp)
        );

        const signature = Array.from(
          new Uint8Array(signatureBuffer)
        )
          .map(b => b.toString(16).padStart(2, "0"))
          .join("");

        const cookieValue = `${timestamp}.${signature}`;

        return new Response(
          JSON.stringify({ success: true }),
          {
            status: 200,
            headers: {
              "Content-Type": "application/json",
              "Set-Cookie":
                `hz_admin=${encodeURIComponent(cookieValue)}; ` +
                `Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=86400`
            }
          }
        );

      } catch (error) {
        return Response.json(
          { error: "حدث خطأ في تسجيل الدخول" },
          { status: 500 }
        );
      }
    }

    // API: المنتجات
    if (url.pathname === "/api/products") {

      if (request.method === "GET") {
        try {
          const { results } = await env.DB
            .prepare(
              "SELECT * FROM products ORDER BY id DESC"
            )
            .all();

          return Response.json(results);

        } catch (error) {
          return Response.json(
            { error: error.message },
            { status: 500 }
          );
        }
      }

      if (
        request.method === "POST" ||
        request.method === "PUT"
      ) {

        const cookie = request.headers.get("Cookie") || "";
        const match = cookie.match(/hz_admin=([^;]+)/);

        if (!match) {
          return Response.json(
            { error: "غير مصرح" },
            { status: 401 }
          );
        }

        try {
          const data = await request.json();

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

          if (request.method === "POST") {

            const result = await env.DB
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
                  ? Number(data.old_price)
                  : null,
                data.image || "",
                Number(data.stock || 0),
                data.badge || ""
              )
              .run();

            return Response.json({
              success: true,
              id: result.meta.last_row_id
            });
          }

          if (!data.id) {
            return Response.json(
              { error: "معرّف المنتج مطلوب" },
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
                ? Number(data.old_price)
                : null,
              data.image || "",
              Number(data.stock || 0),
              data.badge || "",
              Number(data.id)
            )
            .run();

          return Response.json({
            success: true
          });

        } catch (error) {
          return Response.json(
            { error: error.message },
            { status: 500 }
          );
        }
      }

      if (request.method === "DELETE") {

        const cookie = request.headers.get("Cookie") || "";
        const match = cookie.match(/hz_admin=([^;]+)/);

        if (!match) {
          return Response.json(
            { error: "غير مصرح" },
            { status: 401 }
          );
        }

        const id = url.searchParams.get("id");

        if (!id) {
          return Response.json(
            { error: "معرّف المنتج مطلوب" },
            { status: 400 }
          );
        }

        try {

          await env.DB
            .prepare(
              "DELETE FROM products WHERE id = ?"
            )
            .bind(Number(id))
            .run();

          return Response.json({
            success: true
          });

        } catch (error) {

          return Response.json(
            { error: error.message },
            { status: 500 }
          );
        }
      }
    }

    // باقي الملفات تُخدم كملفات الموقع العادية
    return env.ASSETS.fetch(request);
  }
};
