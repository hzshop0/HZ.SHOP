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
  try {
    const data = await context.request.json();

    if (!data.name || !data.category || data.price === undefined) {
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
        data.old_price ? Number(data.old_price) : null,
        data.image || "",
        data.stock ? Number(data.stock) : 0,
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
        data.old_price ? Number(data.old_price) : null,
        data.image || "",
        data.stock ? Number(data.stock) : 0,
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
      .prepare("DELETE FROM products WHERE id = ?")
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
