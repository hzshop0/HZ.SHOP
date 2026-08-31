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


/* =========================================================
   تحويل قيمة الصور إلى مصفوفة
   يدعم:
   - صورة قديمة كرابط واحد
   - JSON array من الصور الجديدة
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

    const trimmed = value.trim();

    if (!trimmed) {
      return [];
    }

    try {

      const parsed = JSON.parse(trimmed);

      if (Array.isArray(parsed)) {
        return parsed
          .filter(Boolean)
          .map(String);
      }

    } catch {
      // القيمة صورة واحدة قديمة
    }

    return [trimmed];
  }

  return [];
}


/* =========================================================
   WHATSAPP
   إرسال Template بدل text
========================================================= */

async function sendOrderToWhatsApp(order, env) {

  console.log("WHATSAPP_START");

  if (!env.WHATSAPP_ACCESS_TOKEN) {
    console.error("WHATSAPP_ERROR: ACCESS TOKEN MISSING");
    throw new Error("WHATSAPP_ACCESS_TOKEN غير موجود");
  }

  if (!env.WHATSAPP_PHONE_NUMBER_ID) {
    console.error("WHATSAPP_ERROR: PHONE NUMBER ID MISSING");
    throw new Error("WHATSAPP_PHONE_NUMBER_ID غير موجود");
  }

  const recipient = "96171142827";

  const templateName = "hello_world";

  console.log(
    "WHATSAPP_CONFIG_OK",
    JSON.stringify({
      recipient: recipient,
      phone_number_id_exists:
        !!env.WHATSAPP_PHONE_NUMBER_ID,
      access_token_exists:
        !!env.WHATSAPP_ACCESS_TOKEN,
      template:
        templateName
    })
  );

  const apiUrl =
    `https://graph.facebook.com/v23.0/${env.WHATSAPP_PHONE_NUMBER_ID}/messages`;

  console.log(
    "WHATSAPP_TEMPLATE_REQUEST_START"
  );

  let response;

  try {

    response =
      await fetch(
        apiUrl,
        {
          method: "POST",

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
                    "en_US"

                }

              }

            })

        }
      );

  } catch (error) {

    console.error(
      "WHATSAPP_FETCH_ERROR",
      error.message
    );

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
        ? JSON.parse(rawResponse)
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

    console.error(
      "WHATSAPP_API_ERROR",
      JSON.stringify({

        status:
          response.status,

        error:
          metaError,

        code:
          result?.error?.code || null,

        error_subcode:
          result?.error?.error_subcode || null

      })
    );

    throw new Error(
      `WhatsApp API: ${metaError}`
    );

  }

  const messageId =
    result?.messages?.[0]?.id || null;

  console.log(
    "WHATSAPP_SUCCESS",
    JSON.stringify({

      status:
        response.status,

      message_id:
        messageId

    })
  );

  return result;

}


/* =========================================================
   WORKER
========================================================= */

export default {

  async fetch(request, env) {

    const url =
      new URL(request.url);


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
      request.method === "POST"
    ) {

      try {

        const cookie =
          request.headers.get("Cookie") || "";

        if (
          !cookie.includes("hz_admin=")
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
          formData.get("image");

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
      request.method === "POST"
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
    ===================================================== */

    if (
      url.pathname ===
      "/api/orders" &&
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
            {
              status: 400
            }
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
              orderId
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


          /*
             تجهيز الصور لكل منتج

             المنتجات القديمة:
             image = "https://..."

             المنتجات الجديدة:
             image = '["url1","url2","url3"]'
          */

          const products =
            results.map(product => {

              const images =
                normalizeImages(
                  product.image
                );

              return {

                ...product,

                images:

                  images,

                /*
                  نبقي image موجودًا
                  حتى لا ينكسر أي كود قديم.
                */

                image:
                  images[0] || ""

              };

            });


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
            data.price === undefined
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


          /* =================================================
             تجهيز الصور
          ================================================= */

          let images = [];


          /*
             النظام الجديد:
             images: ["url1","url2","url3"]
          */

          if (
            Array.isArray(
              data.images
            )
          ) {

            images =
              data.images
                .filter(Boolean)
                .map(String);

          }


          /*
             توافق مع النظام القديم:
             image: "url"
          */

          else if (
            data.image
          ) {

            images =
              normalizeImages(
                data.image
              );

          }


          /*
             تخزين الصور داخل نفس
             عمود image في D1
          */

          const imagesValue =
            images.length
              ? JSON.stringify(images)
              : "";


          /* =================================================
             إضافة منتج
          ================================================= */

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


          /* =================================================
             تعديل منتج
          ================================================= */

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
          request.headers.get("Cookie") || "";

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
