export async function onRequestPost(context) {
  try {
    const data = await context.request.json();

    if (!data.password) {
      return Response.json(
        { error: "كلمة المرور مطلوبة" },
        { status: 400 }
      );
    }

    if (data.password !== context.env.ADMIN_PASSWORD) {
      return Response.json(
        { error: "كلمة المرور غير صحيحة" },
        { status: 401 }
      );
    }

    const timestamp = Date.now().toString();

    const encoder = new TextEncoder();

    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(context.env.ADMIN_PASSWORD),
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

    const cookieValue =
      `${timestamp}.${signature}`;

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
