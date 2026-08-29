async function makeSignature(text, secret) {
  const encoder = new TextEncoder();

  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
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
  const cookie = request.headers.get("Cookie") || "";
  const match = cookie.match(/hz_admin=([^;]+)/);

  if (!match) return false;

  const value = decodeURIComponent(match[1]);
  const parts = value.split(".");

  if (parts.length !== 2) return false;

  const timestamp = parts[0];
  const signature = parts[1];

  const age = Date.now() - Number(timestamp);

  if (!Number.isFinite(age) || age < 0 || age > 86400000) {
    return false;
  }

  const expected = await makeSignature(
    timestamp,
    env.ADMIN_PASSWORD
  );

  return signature === expected;
}

export async function onRequestGet(context) {
  try {
    const { results } = await context.env.DB
      .prepare("SELECT * FROM products ORDER BY id DESC")
      .all();

    return Response.json(results);

  } catch (error) {

    return Response.json(
      { error: error.message },
      { status: 500 }
    );

  }
}

export async function onRequestPost(context) {

  if (!(await checkSession(context.request, context.env))) {
    return Response.json(
      { error: "غير مصرح" },
      { status: 401 }
    );
  }

  try {

    const data = await context.request.json();

    if (
      !data.name ||
      !data.category ||
      data.price === undefined
    ) {
      return Response.json(
        { error: "الاسم والقسم والسعر مطلوبة" },
        { status: 400 }
      );
    }

    const result = await context.env.DB
      .prepare(`
        INSERT INTO products
        (name, category, description, price, old_price, image, stock, badge)
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

  } catch (error) {

    return Response.json(
      { error: error.message },
      { status: 500 }
    );

  }
}

export async function onRequestPut(context) {

  if (!(await checkSession(context.request, context.env))) {
    return Response.json(
      { error: "غير مصرح" },
      { status: 401 }
    );
  }

  try {

    const data = await context.request.json();

    if (!data.id) {
      return Response.json(
        { error: "معرّف المنتج مطلوب" },
        { status: 400 }
      );
    }

    await context.env.DB
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

export async function onRequestDelete(context) {

  if (!(await checkSession(context.request, context.env))) {
    return Response.json(
      { error: "غير مصرح" },
      { status: 401 }
    );
  }

  try {

    const url = new URL(context.request.url);
    const id = url.searchParams.get("id");

    if (!id) {
      return Response.json(
        { error: "معرّف المنتج مطلوب" },
        { status: 400 }
      );
    }

    await context.env.DB
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
