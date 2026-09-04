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


export async function onRequestPost(context) {

  try {

    if (!context.env.ADMIN_PASSWORD) {
      return Response.json(
        {
          error: "كلمة مرور الإدارة غير مهيأة"
        },
        {
          status: 500
        }
      );
    }


    const data =
      await context.request.json();


    const password =
      String(data.password || "");


    if (!password) {
      return Response.json(
        {
          error: "أدخل كلمة المرور"
        },
        {
          status: 400
        }
      );
    }


    if (
      password !==
      String(context.env.ADMIN_PASSWORD)
    ) {
      return Response.json(
        {
          error: "كلمة المرور غير صحيحة"
        },
        {
          status: 401
        }
      );
    }


    /*
      إنشاء جلسة إدارة صالحة لمدة 24 ساعة
    */

    const timestamp =
      String(Date.now());


    const signature =
      await makeSignature(
        timestamp,
        context.env.ADMIN_PASSWORD
      );


    const cookieValue =
      encodeURIComponent(
        timestamp +
        "." +
        signature
      );


    const headers =
      new Headers({
        "Content-Type":
          "application/json; charset=utf-8",

        "Set-Cookie":
          "hz_admin=" +
          cookieValue +
          "; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=86400"
      });


    return new Response(
      JSON.stringify({
        success: true,
        message: "تم تسجيل الدخول بنجاح"
      }),
      {
        status: 200,
        headers
      }
    );


  } catch (error) {

    return Response.json(
      {
        error:
          error.message ||
          "حدث خطأ أثناء تسجيل الدخول"
      },
      {
        status: 500
      }
    );

  }
}
