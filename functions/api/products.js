async function makeSignature(text, secret) {
  const encoder = new TextEncoder();

  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    {
      name: "HMAC",
      hash: "SHA-256"
    },
    false,
    ["sign"]
  );

  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(text)
  );

  return Array.from(new Uint8Array(signature))
    .map(b => b.toString(16).padStart(2, "0"))
    .join("");
}

async function checkSession(request, env) {
  try {
    const cookie = request.headers.get("Cookie") || "";
    const match = cookie.match(/(?:^|;\s*)hz_admin=([^;]+)/);

    if (!match) {
      return false;
    }

    const value = decodeURIComponent(match[1]);
    const parts = value.split(".");

    if (parts.length !== 2) {
      return false;
    }

    const timestamp = parts[0];
    const signature = parts[1];

    const timestampNumber = Number(timestamp);

    if (!Number.isFinite(timestampNumber)) {
      return false;
    }

    const age = Date.now() - timestampNumber;

    if (
      !Number.isFinite(age) ||
      age < 0 ||
      age > 86400000
    ) {
      return false;
    }

    if (!env.ADMIN_PASSWORD) {
      return false;
    }

    const expected = await makeSignature(
      timestamp,
      env.ADMIN_PASSWORD
    );

    return signature === expected;

  } catch {
    return false;
  }
}


/* =========================
   GET PRODUCTS
========================= */

export async function onRequestGet(context) {
  try {
    const { results } = await context.env.DB
      .prepare(`
        SELECT
          id,
          name,
          price,
          stock
        FROM products
        ORDER BY id DESC
      `)
      .all();

    /*
      The database currently contains only:
      id, name, price, stock.

      Extra fields are returned as safe defaults
      so the frontend does not receive undefined values.
    */

    const products = (results || []).map(product => ({
      id: product.id,
      name: product.name || "",
      price: Number(product.price || 0),
      stock: Number(product.stock || 0),

      category: "",
      description: "",
      old_price: null,
      image: "",
      badge: ""
    }));

    return Response.json(products);

  } catch (error) {

    return Response.json(
      {
        error: error.message || "حدث خطأ أثناء جلب المنتجات"
      },
      {
        status: 500
      }
    );
  }
}


/* =========================
   POST PRODUCT
========================= */

export async function onRequestPost(context) {

  if (!(await checkSession(context.request, context.env))) {
    return Response.json(
      {
        error: "غير مصرح"
      },
      {
        status: 401
      }
    );
  }

  try {

    const data = await context.request.json();

    const name = String(data.name || "").trim();
    const price = Number(data.price);
    const stock = Number(data.stock);

    if (!name) {
      return Response.json(
        {
          error: "اسم المنتج مطلوب"
        },
        {
          status: 400
        }
      );
    }

    if (
      !Number.isFinite(price) ||
      price < 0
    ) {
      return Response.json(
        {
          error: "السعر غير صالح"
        },
        {
          status: 400
        }
      );
    }

    if (
      !Number.isFinite(stock) ||
      stock < 0
    ) {
      return Response.json(
        {
          error: "المخزون غير صالح"
        },
        {
          status: 400
        }
      );
    }

    const result = await context.env.DB
      .prepare(`
        INSERT INTO products
        (
          name,
          price,
          stock
        )
        VALUES (?, ?, ?)
      `)
      .bind(
        name,
        price,
        Math.floor(stock)
      )
      .run();

    return Response.json({
      success: true,
      id: result.meta.last_row_id
    });

  } catch (error) {

    return Response.json(
      {
        error: error.message || "حدث خطأ أثناء إضافة المنتج"
      },
      {
        status: 500
      }
    );
  }
}


/* =========================
   PUT PRODUCT
========================= */

export async function onRequestPut(context) {

  if (!(await checkSession(context.request, context.env))) {
    return Response.json(
      {
        error: "غير مصرح"
      },
      {
        status: 401
      }
    );
  }

  try {

    const data = await context.request.json();

    const id = Number(data.id);
    const name = String(data.name || "").trim();
    const price = Number(data.price);
    const stock = Number(data.stock);

    if (
      !Number.isInteger(id) ||
      id <= 0
    ) {
      return Response.json(
        {
          error: "معرّف المنتج غير صالح"
        },
        {
          status: 400
        }
      );
    }

    if (!name) {
      return Response.json(
        {
          error: "اسم المنتج مطلوب"
        },
        {
          status: 400
        }
      );
    }

    if (
      !Number.isFinite(price) ||
      price < 0
    ) {
      return Response.json(
        {
          error: "السعر غير صالح"
        },
        {
          status: 400
        }
      );
    }

    if (
      !Number.isFinite(stock) ||
      stock < 0
    ) {
      return Response.json(
        {
          error: "المخزون غير صالح"
        },
        {
          status: 400
        }
      );
    }

    const result = await context.env.DB
      .prepare(`
        UPDATE products
        SET
          name = ?,
          price = ?,
          stock = ?
        WHERE id = ?
      `)
      .bind(
        name,
        price,
        Math.floor(stock),
        id
      )
      .run();

    if (!result.meta.changes) {
      return Response.json(
        {
          error: "المنتج غير موجود"
        },
        {
          status: 404
        }
      );
    }

    return Response.json({
      success: true
    });

  } catch (error) {

    return Response.json(
      {
        error: error.message || "حدث خطأ أثناء تعديل المنتج"
      },
      {
        status: 500
      }
    );
  }
}


/* =========================
   DELETE PRODUCT
========================= */

export async function onRequestDelete(context) {

  if (!(await checkSession(context.request, context.env))) {
    return Response.json(
      {
        error: "غير مصرح"
      },
      {
        status: 401
      }
    );
  }

  try {

    const url = new URL(context.request.url);
    const id = Number(
      url.searchParams.get("id")
    );

    if (
      !Number.isInteger(id) ||
      id <= 0
    ) {
      return Response.json(
        {
          error: "معرّف المنتج غير صالح"
        },
        {
          status: 400
        }
      );
    }

    const result = await context.env.DB
      .prepare(
        "DELETE FROM products WHERE id = ?"
      )
      .bind(id)
      .run();

    if (!result.meta.changes) {
      return Response.json(
        {
          error: "المنتج غير موجود"
        },
        {
          status: 404
        }
      );
    }

    return Response.json({
      success: true
    });

  } catch (error) {

    return Response.json(
      {
        error: error.message || "حدث خطأ أثناء حذف المنتج"
      },
      {
        status: 500
      }
    );
  }
}
