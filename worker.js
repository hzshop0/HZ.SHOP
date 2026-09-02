/* =========================================================
   HZ.SHOP WORKER
========================================================= */


/* =========================================================
   UPLOAD IMAGE TO GITHUB
========================================================= */

async function uploadImageToGitHub(file, env) {

  const bytes =
    new Uint8Array(
      await file.arrayBuffer()
    );

  let binary = "";

  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  const base64 =
    btoa(binary);

  const fileName =
    `images/${Date.now()}-${file.name.replace(
      /[^a-zA-Z0-9._-]/g,
      "-"
    )}`;

  const response =
    await fetch(
      `https://api.github.com/repos/hzshop0/HZ.SHOP/contents/${fileName}`,
      {
        method: "PUT",

        headers: {
          "Authorization":
            `Bearer ${env.GITHUB_TOKEN}`,

          "Accept":
            "application/vnd.github+json",

          "X-GitHub-Api-Version":
            "2022-11-28",

          "User-Agent":
            "HZ-SHOP"
        },

        body:
          JSON.stringify({

            message:
              `Upload product image ${fileName}`,

            content:
              base64

          })
      }
    );

  if (!response.ok) {

    const error =
      await response.text();

    throw new Error(error);

  }

  return `https://raw.githubusercontent.com/hzshop0/HZ.SHOP/main/${fileName}`;

}


/* =========================================================
   NORMALIZE IMAGES
========================================================= */

function normalizeImages(value) {

  if (!value) {
    return [];
  }

  if (Array.isArray(value)) {

    return value
      .filter(Boolean)
      .map(String);

  }

  if (typeof value === "string") {

    const trimmed =
      value.trim();

    if (!trimmed) {
      return [];
    }

    try {

      const parsed =
        JSON.parse(trimmed);

      if (Array.isArray(parsed)) {

        return parsed
          .filter(Boolean)
          .map(String);

      }

    } catch {
      // صورة واحدة قديمة
    }

    return [trimmed];

  }

  return [];

}


/* =========================================================
   CUSTOMER PHONE
========================================================= */

function normalizePhone(phone) {

  return String(phone || "")
    .trim()
    .replace(/\s+/g, "")
    .replace(/-/g, "")
    .replace(/\(/g, "")
    .replace(/\)/g, "");

}


/* =========================================================
   BYTES TO HEX
========================================================= */

function bytesToHex(bytes) {

  return Array.from(bytes)
    .map(
      b =>
        b
          .toString(16)
          .padStart(2, "0")
    )
    .join("");

}


/* =========================================================
   HEX TO BYTES
========================================================= */

function hexToBytes(hex) {

  if (
    !hex ||
    hex.length % 2 !== 0
  ) {

    return new Uint8Array();

  }

  const bytes =
    new Uint8Array(
      hex.length / 2
    );

  for (
    let i = 0;
    i < bytes.length;
    i++
  ) {

    bytes[i] =
      parseInt(
        hex.slice(
          i * 2,
          i * 2 + 2
        ),
        16
      );

  }

  return bytes;

}


/* =========================================================
   HASH PASSWORD
========================================================= */

async function hashPassword(
  password,
  saltHex = null
) {

  const encoder =
    new TextEncoder();

  let salt;

  if (saltHex) {

    salt =
      hexToBytes(
        saltHex
      );

  } else {

    salt =
      crypto.getRandomValues(
        new Uint8Array(16)
      );

  }

  const keyMaterial =
    await crypto.subtle.importKey(
      "raw",
      encoder.encode(password),
      {
        name: "PBKDF2"
      },
      false,
      ["deriveBits"]
    );

  const hashBuffer =
    await crypto.subtle.deriveBits(
      {
        name: "PBKDF2",
        salt: salt,
        iterations: 100000,
        hash: "SHA-256"
      },
      keyMaterial,
      256
    );

  return {

    salt:
      bytesToHex(
        salt
      ),

    hash:
      bytesToHex(
        new Uint8Array(
          hashBuffer
        )
      )

  };

}


/* =========================================================
   VERIFY PASSWORD
========================================================= */

async function verifyPassword(
  password,
  storedPassword
) {

  if (!storedPassword) {
    return false;
  }

  const parts =
    String(
      storedPassword
    ).split(":");

  if (
    parts.length !== 2
  ) {

    return false;

  }

  const saltHex =
    parts[0];

  const storedHash =
    parts[1];

  const result =
    await hashPassword(
      password,
      saltHex
    );

  return (
    result.hash ===
    storedHash
  );

}


/* =========================================================
   CREATE CUSTOMER SESSION
========================================================= */

async function createCustomerSession(
  customerId,
  env
) {

  const timestamp =
    Date.now().toString();

  const value =
    `${customerId}.${timestamp}`;

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
      encoder.encode(
        value
      )
    );

  const signature =
    bytesToHex(
      new Uint8Array(
        signatureBuffer
      )
    );

  return (
    `${value}.${signature}`
  );

}


/* =========================================================
   VERIFY CUSTOMER SESSION
========================================================= */

async function verifyCustomerSession(
  request,
  env
) {

  const cookie =
    request.headers.get(
      "Cookie"
    ) || "";

  const match =
    cookie.match(
      /(?:^|;\s*)hz_customer=([^;]+)/
    );

  if (!match) {
    return null;
  }

  try {

    const cookieValue =
      decodeURIComponent(
        match[1]
      );

    const parts =
      cookieValue.split(".");

    if (
      parts.length !== 3
    ) {

      return null;

    }

    const customerId =
      Number(
        parts[0]
      );

    const timestamp =
      Number(
        parts[1]
      );

    const signature =
      parts[2];

    if (
      !customerId ||
      !timestamp ||
      !signature
    ) {

      return null;

    }

    if (
      Date.now() -
        timestamp >
      7 *
        24 *
        60 *
        60 *
        1000
    ) {

      return null;

    }

    const value =
      `${customerId}.${timestamp}`;

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
        ["verify"]
      );

    const valid =
      await crypto.subtle.verify(
        "HMAC",
        key,
        hexToBytes(
          signature
        ),
        encoder.encode(
          value
        )
      );

    if (!valid) {
      return null;
    }

    const customer =
      await env.DB
        .prepare(`
          SELECT
            id,
            name,
            phone,
            created_at
          FROM customers
          WHERE id = ?
          LIMIT 1
        `)
        .bind(
          customerId
        )
        .first();

    if (!customer) {
      return null;
    }

    return customer;

  } catch {

    return null;

  }

}


/* =========================================================
   WHATSAPP PARAMETER CLEANER
========================================================= */

function cleanWhatsAppParam(value) {

  return String(value ?? "")
    .replace(/[\r\n\t]+/g, " ")
    .replace(/ {5,}/g, "    ")
    .trim();

}


/* =========================================================
   WHATSAPP
========================================================= */

async function sendOrderToWhatsApp(
  order,
  env
) {

  console.log(
    "WHATSAPP_START"
  );

  if (
    !env.WHATSAPP_ACCESS_TOKEN
  ) {

    throw new Error(
      "WHATSAPP_ACCESS_TOKEN غير موجود"
    );

  }

  if (
    !env.WHATSAPP_PHONE_NUMBER_ID
  ) {

    throw new Error(
      "WHATSAPP_PHONE_NUMBER_ID غير موجود"
    );

  }

  const recipient =
    "96171142827";

  const templateName =
    "hz_shop_order";

  const apiUrl =
    `https://graph.facebook.com/v23.0/${env.WHATSAPP_PHONE_NUMBER_ID}/messages`;

  let response;

  try {

    response =
      await fetch(
        apiUrl,
        {
          method:
            "POST",

          headers: {

            "Authorization":
              `Bearer ${env.WHATSAPP_ACCESS_TOKEN}`,

            "Content-Type":
              "application/json"

          },

          body:
            JSON.stringify({

              messaging_product:
                "whatsapp",

              recipient_type:
                "individual",

              to:
                recipient,

              type:
                "template",

              template: {

                name:
                  templateName,

                language: {

                  code:
                    "ar"

                },

                components: [

                  {
                    type:
                      "body",

                    parameters: [

                      {
                        type:
                          "text",

                        text:
                          cleanWhatsAppParam(
                            order.id
                          )
                      },

                      {
                        type:
                          "text",

                        text:
                          cleanWhatsAppParam(
                            order.customer_name || ""
                          )
                      },

                      {
                        type:
                          "text",

                        text:
                          cleanWhatsAppParam(
                            order.phone || ""
                          )
                      },

                      {
                        type:
                          "text",

                        text:
                          cleanWhatsAppParam(
                            order.governorate || ""
                          )
                      },

                      {
                        type:
                          "text",

                        text:
                          cleanWhatsAppParam(
                            order.area || ""
                          )
                      },

                      {
                        type:
                          "text",

                        text:
                          cleanWhatsAppParam(
                            order.address || ""
                          )
                      },

                      {
                        type:
                          "text",

                        text:
                          cleanWhatsAppParam(
                            order.payment_method || ""
                          )
                      },

                      {
                        type:
                          "text",

                        text:
                          cleanWhatsAppParam(
                            order.total || ""
                          )
                      }

                    ]

                  }

                ]

              }

            })

        }
      );

  } catch (error) {

    throw new Error(
      `فشل الاتصال بـ WhatsApp API: ${error.message}`
    );

  }

  const rawResponse =
    await response.text();

  let result;

  try {

    result =
      rawResponse
        ? JSON.parse(
            rawResponse
          )
        : {};

  } catch {

    result = {
      raw_response:
        rawResponse
    };

  }

  console.log(
    "WHATSAPP_RESPONSE",
    JSON.stringify({

      status:
        response.status,

      ok:
        response.ok,

      result:
        result

    })
  );

  if (!response.ok) {

    const metaError =
      result?.error?.message ||
      result?.error?.error_user_msg ||
      result?.error?.type ||
      `HTTP ${response.status}`;

    throw new Error(
      `WhatsApp API: ${metaError}`
    );

  }

  return result;

}


/* =========================================================
   WORKER
========================================================= */

export default {

  async fetch(
    request,
    env
  ) {

    const url =
      new URL(
        request.url
      );


    /* =====================================================
       API: إنشاء حساب عميل
    ===================================================== */

    if (
      url.pathname ===
        "/api/customer-register" &&
      request.method ===
        "POST"
    ) {

      try {

        const data =
          await request.json();

        const name =
          String(
            data.name || ""
          ).trim();

        const phone =
          normalizePhone(
            data.phone
          );

        const password =
          String(
            data.password || ""
          );

        if (
          !name ||
          !phone ||
          !password
        ) {

          return Response.json(
            {
              error:
                "الاسم ورقم الهاتف وكلمة المرور مطلوبة"
            },
            {
              status: 400
            }
          );

        }

        if (
          password.length < 6
        ) {

          return Response.json(
            {
              error:
                "كلمة المرور يجب أن تكون 6 أحرف أو أرقام على الأقل"
            },
            {
              status: 400
            }
          );

        }

        const existing =
          await env.DB
            .prepare(`
              SELECT id
              FROM customers
              WHERE phone = ?
              LIMIT 1
            `)
            .bind(
              phone
            )
            .first();

        if (existing) {

          return Response.json(
            {
              error:
                "رقم الهاتف مسجل مسبقًا"
            },
            {
              status: 409
            }
          );

        }

        const passwordData =
          await hashPassword(
            password
          );

        const passwordHash =
          `${passwordData.salt}:${passwordData.hash}`;

        const result =
          await env.DB
            .prepare(`
              INSERT INTO customers
              (
                phone,
                password_hash,
                name,
                created_at
              )
              VALUES (?, ?, ?, ?)
            `)
            .bind(

              phone,

              passwordHash,

              name,

              new Date()
                .toISOString()

            )
            .run();

        const customerId =
          result.meta.last_row_id;

        const session =
          await createCustomerSession(
            customerId,
            env
          );

        return new Response(

          JSON.stringify({

            success:
              true,

            customer: {

              id:
                customerId,

              name:
                name,

              phone:
                phone

            }

          }),

          {
            status:
              200,

            headers: {

              "Content-Type":
                "application/json",

              "Set-Cookie":
                `hz_customer=${encodeURIComponent(session)}; ` +
                `Path=/; ` +
                `HttpOnly; ` +
                `Secure; ` +
                `SameSite=Strict; ` +
                `Max-Age=604800`

            }

          }

        );

      } catch (error) {

        console.error(
          "CUSTOMER_REGISTER_ERROR",
          error.message
        );

        return Response.json(
          {
            error:
              "تعذر إنشاء الحساب"
          },
          {
            status: 500
          }
        );

      }

    }


    /* =====================================================
       API: تسجيل دخول العميل
    ===================================================== */

    if (
      url.pathname ===
        "/api/customer-login" &&
      request.method ===
        "POST"
    ) {

      try {

        const data =
          await request.json();

        const phone =
          normalizePhone(
            data.phone
          );

        const password =
          String(
            data.password || ""
          );

        if (
          !phone ||
          !password
        ) {

          return Response.json(
            {
              error:
                "رقم الهاتف وكلمة المرور مطلوبان"
            },
            {
              status: 400
            }
          );

        }

        const customer =
          await env.DB
            .prepare(`
              SELECT
                id,
                name,
                phone,
                password_hash
              FROM customers
              WHERE phone = ?
              LIMIT 1
            `)
            .bind(
              phone
            )
            .first();

        if (!customer) {

          return Response.json(
            {
              error:
                "رقم الهاتف أو كلمة المرور غير صحيحة"
            },
            {
              status: 401
            }
          );

        }

        const valid =
          await verifyPassword(
            password,
            customer.password_hash
          );

        if (!valid) {

          return Response.json(
            {
              error:
                "رقم الهاتف أو كلمة المرور غير صحيحة"
            },
            {
              status: 401
            }
          );

        }

        const session =
          await createCustomerSession(
            customer.id,
            env
          );

        return new Response(

          JSON.stringify({

            success:
              true,

            customer: {

              id:
                customer.id,

              name:
                customer.name,

              phone:
                customer.phone

            }

          }),

          {
            status:
              200,

            headers: {

              "Content-Type":
                "application/json",

              "Set-Cookie":
                `hz_customer=${encodeURIComponent(session)}; ` +
                `Path=/; ` +
                `HttpOnly; ` +
                `Secure; ` +
                `SameSite=Strict; ` +
                `Max-Age=604800`

            }

          }

        );

      } catch (error) {

        console.error(
          "CUSTOMER_LOGIN_ERROR",
          error.message
        );

        return Response.json(
          {
            error:
              "حدث خطأ في تسجيل الدخول"
          },
          {
            status: 500
          }
        );

      }

    }


    /* =====================================================
       API: معرفة العميل الحالي
    ===================================================== */

    if (
      url.pathname ===
        "/api/customer-me" &&
      request.method ===
        "GET"
    ) {

      try {

        const customer =
          await verifyCustomerSession(
            request,
            env
          );

        if (!customer) {

          return Response.json({
            logged_in:
              false
          });

        }

        return Response.json({

          logged_in:
            true,

          customer: {

            id:
              customer.id,

            name:
              customer.name,

            phone:
              customer.phone

          }

        });

      } catch {

        return Response.json({
          logged_in:
            false
        });

      }

    }


    /* =====================================================
       API: تسجيل خروج العميل
    ===================================================== */

    if (
      url.pathname ===
        "/api/customer-logout" &&
      request.method ===
        "POST"
    ) {

      return new Response(

        JSON.stringify({
          success:
            true
        }),

        {
          status:
            200,

          headers: {

            "Content-Type":
              "application/json",

            "Set-Cookie":
              "hz_customer=; " +
              "Path=/; " +
              "HttpOnly; " +
              "Secure; " +
              "SameSite=Strict; " +
              "Max-Age=0"

          }

        }

      );

    }


    /* =====================================================
       API: جلب طلبات العميل
       هذه هي الإضافة المهمة لصفحة العميل
    ===================================================== */

    if (
      url.pathname ===
        "/api/customer-orders" &&
      request.method ===
        "GET"
    ) {

      try {

        const customer =
          await verifyCustomerSession(
            request,
            env
          );

        if (!customer) {

          return Response.json(
            {
              error:
                "يجب تسجيل الدخول"
            },
            {
              status: 401
            }
          );

        }

        const { results } =
          await env.DB
            .prepare(`
              SELECT
                *
              FROM orders
              WHERE customer_id = ?
              ORDER BY id DESC
            `)
            .bind(
              customer.id
            )
            .all();

        return Response.json({

          success:
            true,

          orders:
            results || []

        });

      } catch (error) {

        console.error(
          "CUSTOMER_ORDERS_ERROR",
          error.message
        );

        return Response.json(
          {
            error:
              "تعذر جلب الطلبات"
          },
          {
            status: 500
          }
        );

      }

    }


    /* =====================================================
       API: اختبار الأسرار
    ===================================================== */

    if (
      url.pathname ===
      "/api/test-secret"
    ) {

      return Response.json({

        exists:
          !!env.ADMIN_PASSWORD,

        whatsapp_token:
          !!env.WHATSAPP_ACCESS_TOKEN,

        whatsapp_phone_id:
          !!env.WHATSAPP_PHONE_NUMBER_ID,

        whatsapp_business_id:
          !!env.WHATSAPP_BUSINESS_ACCOUNT_ID

      });

    }


    /* =====================================================
       API: رفع صورة المنتج
    ===================================================== */

    if (
      url.pathname ===
        "/api/upload-image" &&
      request.method ===
        "POST"
    ) {

      try {

        const cookie =
          request.headers.get(
            "Cookie"
          ) || "";

        if (
          !cookie.includes(
            "hz_admin="
          )
        ) {

          return Response.json(
            {
              error:
                "غير مصرح"
            },
            {
              status: 401
            }
          );

        }

        const formData =
          await request.formData();

        const file =
          formData.get(
            "image"
          );

        if (
          !file ||
          typeof file.arrayBuffer !==
            "function"
        ) {

          return Response.json(
            {
              error:
                "لم يتم اختيار صورة"
            },
            {
              status: 400
            }
          );

        }

        if (
          !file.type.startsWith(
            "image/"
          )
        ) {

          return Response.json(
            {
              error:
                "الملف يجب أن يكون صورة"
            },
            {
              status: 400
            }
          );

        }

        const imageUrl =
          await uploadImageToGitHub(
            file,
            env
          );

        return Response.json({

          success:
            true,

          image:
            imageUrl

        });

      } catch (error) {

        return Response.json(
          {
            error:
              error.message
          },
          {
            status: 500
          }
        );

      }

    }


    /* =====================================================
       API: تسجيل دخول الإدارة
    ===================================================== */

    if (
      url.pathname ===
        "/api/admin-login" &&
      request.method ===
        "POST"
    ) {

      try {

        const data =
          await request.json();

        if (!data.password) {

          return Response.json(
            {
              error:
                "كلمة المرور مطلوبة"
            },
            {
              status: 400
            }
          );

        }

        if (
          data.password !==
          env.ADMIN_PASSWORD
        ) {

          return Response.json(
            {
              error:
                "كلمة المرور غير صحيحة"
            },
            {
              status: 401
            }
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
              name:
                "HMAC",
              hash:
                "SHA-256"
            },
            false,
            ["sign"]
          );

        const signatureBuffer =
          await crypto.subtle.sign(
            "HMAC",
            key,
            encoder.encode(
              timestamp
            )
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
            success:
              true
          }),

          {
            status:
              200,

            headers: {

              "Content-Type":
                "application/json",

              "Set-Cookie":
                `hz_admin=${encodeURIComponent(
                  cookieValue
                )}; ` +
                `Path=/; ` +
                `HttpOnly; ` +
                `Secure; ` +
                `SameSite=Strict; ` +
                `Max-Age=86400`

            }

          }

        );

      } catch (error) {

        return Response.json(
          {
            error:
              "حدث خطأ في تسجيل الدخول"
          },
          {
            status: 500
          }
        );

      }

    }


    /* =====================================================
       API: إنشاء طلب جديد
       وربطه بالعميل
    ===================================================== */

    if (
      url.pathname ===
        "/api/orders" &&
      request.method ===
        "POST"
    ) {

      try {

        const customer =
          await verifyCustomerSession(
            request,
            env
          );

        if (!customer) {

          return Response.json(
            {
              error:
                "يجب تسجيل الدخول قبل إتمام الطلب"
            },
            {
              status: 401
            }
          );

        }

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
            {
              status: 400
            }
          );

        }

        const result =
          await env.DB
            .prepare(`
              INSERT INTO orders (
                customer_id,
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
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `)
            .bind(

              Number(
                customer.id
              ),

              String(
                data.customer_name
              ),

              String(
                data.phone
              ),

              String(
                data.governorate
              ),

              String(
                data.area
              ),

              String(
                data.address
              ),

              String(
                data.notes || ""
              ),

              String(
                data.payment_method
              ),

              JSON.stringify(
                data.items
              ),

              Number(
                data.subtotal || 0
              ),

              Number(
                data.discount || 0
              ),

              Number(
                data.total || 0
              ),

              "new",

              new Date()
                .toISOString()

            )
            .run();

        const orderId =
          result.meta.last_row_id;

        console.log(
          "ORDER_SAVED",
          JSON.stringify({

            order_id:
              orderId,

            customer_id:
              customer.id

          })
        );

        const orderForWhatsApp = {

          id:
            orderId,

          customer_name:
            String(
              data.customer_name
            ),

          phone:
            String(
              data.phone
            ),

          governorate:
            String(
              data.governorate
            ),

          area:
            String(
              data.area
            ),

          address:
            String(
              data.address
            ),

          notes:
            String(
              data.notes || ""
            ),

          payment_method:
            String(
              data.payment_method
            ),

          items:
            JSON.stringify(
              data.items
            ),

          subtotal:
            Number(
              data.subtotal || 0
            ),

          discount:
            Number(
              data.discount || 0
            ),

          total:
            Number(
              data.total || 0
            )

        };

        let whatsappSent =
          false;

        let whatsappError =
          null;

        let whatsappMessageId =
          null;

        try {

          const whatsappResult =
            await sendOrderToWhatsApp(
              orderForWhatsApp,
              env
            );

          whatsappSent =
            true;

          whatsappMessageId =
            whatsappResult
              ?.messages?.[0]?.id ||
            null;

        } catch (error) {

          console.error(
            "WHATSAPP_SEND_FAILED",
            error.message
          );

          whatsappError =
            error.message;

        }

        console.log(
          "ORDER_COMPLETE",
          JSON.stringify({

            order_id:
              orderId,

            customer_id:
              customer.id,

            whatsapp_sent:
              whatsappSent,

            whatsapp_message_id:
              whatsappMessageId,

            whatsapp_error:
              whatsappError

          })
        );

        return Response.json({

          success:
            true,

          order_id:
            orderId,

          whatsapp_sent:
            whatsappSent,

          whatsapp_message_id:
            whatsappMessageId,

          whatsapp_error:
            whatsappError

        });

      } catch (error) {

        console.error(
          "ORDER_ERROR",
          error.message
        );

        return Response.json(
          {
            error:
              "تعذر حفظ الطلب"
          },
          {
            status: 500
          }
        );

      }

    }


    /* =====================================================
       API: جلب الطلبات للإدارة
    ===================================================== */

    if (
      url.pathname ===
        "/api/orders" &&
      request.method ===
        "GET"
    ) {

      try {

        const cookie =
          request.headers.get(
            "Cookie"
          ) || "";

        const match =
          cookie.match(
            /hz_admin=([^;]+)/
          );

        if (!match) {

          return Response.json(
            {
              error:
                "غير مصرح"
            },
            {
              status: 401
            }
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
            error:
              error.message
          },
          {
            status: 500
          }
        );

      }

    }


    /* =====================================================
       API: تحديث حالة الطلب
    ===================================================== */

    if (
      url.pathname ===
        "/api/orders" &&
      request.method ===
        "PUT"
    ) {

      try {

        const cookie =
          request.headers.get(
            "Cookie"
          ) || "";

        const match =
          cookie.match(
            /hz_admin=([^;]+)/
          );

        if (!match) {

          return Response.json(
            {
              error:
                "غير مصرح"
            },
            {
              status: 401
            }
          );

        }

        const data =
          await request.json();

        if (
          !data.id ||
          !data.status
        ) {

          return Response.json(
            {
              error:
                "معرّف الطلب والحالة مطلوبان"
            },
            {
              status: 400
            }
          );

        }

        await env.DB
          .prepare(`
            UPDATE orders
            SET status = ?
            WHERE id = ?
          `)
          .bind(

            String(
              data.status
            ),

            Number(
              data.id
            )

          )
          .run();

        return Response.json({
          success:
            true
        });

      } catch (error) {

        return Response.json(
          {
            error:
              error.message
          },
          {
            status: 500
          }
        );

      }

    }


    /* =====================================================
       API: المنتجات
    ===================================================== */

    if (
      url.pathname ===
      "/api/products"
    ) {

      /* ===================================================
         GET المنتجات
      =================================================== */

      if (
        request.method ===
        "GET"
      ) {

        try {

          const { results } =
            await env.DB
              .prepare(
                "SELECT * FROM products ORDER BY id DESC"
              )
              .all();

          const products =
            results.map(
              product => {

                const images =
                  normalizeImages(
                    product.image
                  );

                return {

                  ...product,

                  images:
                    images,

                  image:
                    images[0] || ""

                };

              }
            );

          return Response.json(
            products
          );

        } catch (error) {

          return Response.json(
            {
              error:
                error.message
            },
            {
              status: 500
            }
          );

        }

      }


      /* ===================================================
         POST / PUT المنتجات
      =================================================== */

      if (
        request.method ===
          "POST" ||
        request.method ===
          "PUT"
      ) {

        const cookie =
          request.headers.get(
            "Cookie"
          ) || "";

        const match =
          cookie.match(
            /hz_admin=([^;]+)/
          );

        if (!match) {

          return Response.json(
            {
              error:
                "غير مصرح"
            },
            {
              status: 401
            }
          );

        }

        try {

          const data =
            await request.json();

          if (
            !data.name ||
            !data.category ||
            data.price ===
              undefined
          ) {

            return Response.json(
              {
                error:
                  "الاسم والقسم والسعر مطلوبة"
              },
              {
                status: 400
              }
            );

          }

          let images = [];

          if (
            Array.isArray(
              data.images
            )
          ) {

            images =
              data.images
                .filter(Boolean)
                .map(String);

          } else if (
            data.image
          ) {

            images =
              normalizeImages(
                data.image
              );

          }

          const imagesValue =
            images.length
              ? JSON.stringify(
                  images
                )
              : "";

          /* إضافة منتج */

          if (
            request.method ===
            "POST"
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

                  data.description ||
                    "",

                  Number(
                    data.price
                  ),

                  data.old_price
                    ? Number(
                        data.old_price
                      )
                    : null,

                  imagesValue,

                  Number(
                    data.stock ||
                      0
                  ),

                  data.badge ||
                    ""

                )
                .run();

            return Response.json({

              success:
                true,

              id:
                result.meta
                  .last_row_id

            });

          }

          /* تعديل منتج */

          if (!data.id) {

            return Response.json(
              {
                error:
                  "معرّف المنتج مطلوب"
              },
              {
                status: 400
              }
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

              data.description ||
                "",

              Number(
                data.price
              ),

              data.old_price
                ? Number(
                    data.old_price
                  )
                : null,

              imagesValue,

              Number(
                data.stock ||
                  0
              ),

              data.badge ||
                "",

              Number(
                data.id
              )

            )
            .run();

          return Response.json({
            success:
              true
          });

        } catch (error) {

          return Response.json(
            {
              error:
                error.message
            },
            {
              status: 500
            }
          );

        }

      }


      /* ===================================================
         DELETE المنتج
      =================================================== */

      if (
        request.method ===
        "DELETE"
      ) {

        const cookie =
          request.headers.get(
            "Cookie"
          ) || "";

        const match =
          cookie.match(
            /hz_admin=([^;]+)/
          );

        if (!match) {

          return Response.json(
            {
              error:
                "غير مصرح"
            },
            {
              status: 401
            }
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
            {
              status: 400
            }
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
            success:
              true
          });

        } catch (error) {

          return Response.json(
            {
              error:
                error.message
            },
            {
              status: 500
            }
          );

        }

      }

    }


    /* =====================================================
       باقي ملفات الموقع
    ===================================================== */

    return env.ASSETS.fetch(
      request
    );

  }

};
