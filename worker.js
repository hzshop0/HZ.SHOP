/* =========================================================
   HZ.SHOP WORKER
   Production Store Worker
========================================================= */


/* =========================================================
   CONSTANTS
========================================================= */

const CUSTOMER_SESSION_MAX_AGE =
  7 * 24 * 60 * 60 * 1000;

const ADMIN_SESSION_MAX_AGE =
  24 * 60 * 60 * 1000;

const MAX_ORDER_ITEMS =
  100;

const MAX_ITEM_QUANTITY =
  999;

const MAX_NAME_LENGTH =
  120;

const MAX_PHONE_LENGTH =
  30;

const MAX_ADDRESS_LENGTH =
  500;

const MAX_TEXT_LENGTH =
  1000;

const MAX_NOTES_LENGTH =
  1000;

const MAX_PRODUCT_NAME_LENGTH =
  200;

const MAX_PRODUCT_DESCRIPTION_LENGTH =
  5000;

const MAX_PRODUCT_BADGE_LENGTH =
  100;

const MAX_IMAGES =
  10;


/* =========================================================
   JSON RESPONSE
========================================================= */

function jsonResponse(
  data,
  status = 200,
  extraHeaders = {}
) {

  return new Response(
    JSON.stringify(data),
    {
      status,

      headers: {
        "Content-Type":
          "application/json; charset=utf-8",

        "Cache-Control":
          "no-store, no-cache, must-revalidate, max-age=0",

        "Pragma":
          "no-cache",

        "Expires":
          "0",

        ...extraHeaders
      }
    }
  );

}


/* =========================================================
   ERROR RESPONSE
========================================================= */

function errorResponse(
  message,
  status = 400
) {

  return jsonResponse(
    {
      error:
        message
    },
    status
  );

}


/* =========================================================
   SAFE STRING
========================================================= */

function safeString(
  value,
  maxLength = 1000
) {

  return String(
    value ?? ""
  )
    .replace(/\u0000/g, "")
    .trim()
    .slice(
      0,
      maxLength
    );

}


/* =========================================================
   NORMALIZE PHONE
========================================================= */

function normalizePhone(
  phone
) {

  return String(
    phone || ""
  )
    .trim()
    .replace(/[^\d+]/g, "")
    .slice(
      0,
      MAX_PHONE_LENGTH
    );

}


/* =========================================================
   NORMALIZE NUMBER
========================================================= */

function toMoney(
  value
) {

  const number =
    Number(value);

  if (
    !Number.isFinite(number)
  ) {

    return 0;

  }

  return Math.round(
    number * 100
  ) / 100;

}


/* =========================================================
   NORMALIZE INTEGER
========================================================= */

function toInteger(
  value
) {

  const number =
    Number(value);

  if (
    !Number.isFinite(number)
  ) {

    return 0;

  }

  return Math.floor(
    number
  );

}


/* =========================================================
   UPLOAD IMAGE TO GITHUB
========================================================= */

async function uploadImageToGitHub(
  file,
  env
) {

  if (!env.GITHUB_TOKEN) {

    throw new Error(
      "GITHUB_TOKEN غير موجود"
    );

  }

  const bytes =
    new Uint8Array(
      await file.arrayBuffer()
    );

  let binary = "";

  const chunkSize =
    0x8000;

  for (
    let i = 0;
    i < bytes.length;
    i += chunkSize
  ) {

    binary += String.fromCharCode(
      ...bytes.subarray(
        i,
        Math.min(
          i + chunkSize,
          bytes.length
        )
      )
    );

  }

  const base64 =
    btoa(binary);

  const originalName =
    safeString(
      file.name || "image",
      150
    );

  const safeFileName =
    originalName.replace(
      /[^a-zA-Z0-9._-]/g,
      "-"
    );

  const fileName =
    `images/${Date.now()}-${safeFileName}`;

  const response =
    await fetch(
      `https://api.github.com/repos/hzshop0/HZ.SHOP/contents/${fileName}`,
      {
        method:
          "PUT",

        headers: {

          "Authorization":
            `Bearer ${env.GITHUB_TOKEN}`,

          "Accept":
            "application/vnd.github+json",

          "X-GitHub-Api-Version":
            "2022-11-28",

          "User-Agent":
            "HZ-SHOP",

          "Content-Type":
            "application/json"

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

  if (
    !response.ok
  ) {

    const error =
      await response.text();

    throw new Error(
      error ||
      `GitHub HTTP ${response.status}`
    );

  }

  return (
    `https://raw.githubusercontent.com/hzshop0/HZ.SHOP/main/${fileName}`
  );

}


/* =========================================================
   NORMALIZE IMAGES
========================================================= */

function normalizeImages(
  value
) {

  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {

    return [];

  }

  function normalizeArray(
    array
  ) {

    return array
      .map(
        image => {

          if (
            typeof image ===
            "string"
          ) {

            return image
              .trim()
              .slice(0, 2000);

          }

          if (
            image &&
            typeof image ===
            "object"
          ) {

            return String(
              image.url ||
              image.image ||
              image.src ||
              image.path ||
              ""
            )
              .trim()
              .slice(0, 2000);

          }

          return "";

        }
      )
      .filter(Boolean)
      .slice(
        0,
        MAX_IMAGES
      );

  }


  if (
    Array.isArray(value)
  ) {

    return normalizeArray(
      value
    );

  }


  if (
    typeof value ===
    "string"
  ) {

    const trimmed =
      value.trim();

    if (!trimmed) {

      return [];

    }

    try {

      const parsed =
        JSON.parse(
          trimmed
        );

      if (
        Array.isArray(parsed)
      ) {

        return normalizeArray(
          parsed
        );

      }

    } catch {
      /* صورة واحدة */
    }

    return [
      trimmed.slice(
        0,
        2000
      )
    ];

  }

  return [];

}


/* =========================================================
   BYTES TO HEX
========================================================= */

function bytesToHex(
  bytes
) {

  return Array.from(
    bytes
  )
    .map(
      b =>
        b
          .toString(16)
          .padStart(
            2,
            "0"
          )
    )
    .join("");

}


/* =========================================================
   HEX TO BYTES
========================================================= */

function hexToBytes(
  hex
) {

  if (
    !hex ||
    typeof hex !== "string" ||
    hex.length % 2 !== 0 ||
    !/^[0-9a-f]+$/i.test(hex)
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

  if (
    saltHex
  ) {

    salt =
      hexToBytes(
        saltHex
      );

    if (
      salt.length !== 16
    ) {

      throw new Error(
        "ملح كلمة المرور غير صالح"
      );

    }

  } else {

    salt =
      crypto.getRandomValues(
        new Uint8Array(16)
      );

  }

  const keyMaterial =
    await crypto.subtle.importKey(
      "raw",
      encoder.encode(
        password
      ),
      {
        name:
          "PBKDF2"
      },
      false,
      [
        "deriveBits"
      ]
    );

  const hashBuffer =
    await crypto.subtle.deriveBits(
      {
        name:
          "PBKDF2",

        salt:
          salt,

        iterations:
          100000,

        hash:
          "SHA-256"

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

  if (
    !storedPassword
  ) {

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

  if (
    !/^[0-9a-f]{32}$/i.test(
      saltHex
    ) ||
    !/^[0-9a-f]{64}$/i.test(
      storedHash
    )
  ) {

    return false;

  }

  const result =
    await hashPassword(
      password,
      saltHex
    );

  return (
    result.hash.toLowerCase() ===
    storedHash.toLowerCase()
  );

}


/* =========================================================
   CREATE HMAC KEY
========================================================= */

async function createHmacKey(
  secret
) {

  if (
    !secret
  ) {

    throw new Error(
      "سر التشفير غير موجود"
    );

  }

  return crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(
      secret
    ),
    {
      name:
        "HMAC",

      hash:
        "SHA-256"
    },
    false,
    [
      "sign",
      "verify"
    ]
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

  const key =
    await createHmacKey(
      env.ADMIN_PASSWORD
    );

  const signatureBuffer =
    await crypto.subtle.sign(
      "HMAC",
      key,
      new TextEncoder().encode(
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
   CREATE ADMIN SESSION
========================================================= */

async function createAdminSession(
  env
) {

  const timestamp =
    Date.now().toString();

  const key =
    await createHmacKey(
      env.ADMIN_PASSWORD
    );

  const signatureBuffer =
    await crypto.subtle.sign(
      "HMAC",
      key,
      new TextEncoder().encode(
        timestamp
      )
    );

  const signature =
    bytesToHex(
      new Uint8Array(
        signatureBuffer
      )
    );

  return (
    `${timestamp}.${signature}`
  );

}


/* =========================================================
   GET COOKIE
========================================================= */

function getCookie(
  request,
  name
) {

  const cookie =
    request.headers.get(
      "Cookie"
    ) || "";

  const escaped =
    name.replace(
      /[.*+?^${}()|[\]\\]/g,
      "\\$&"
    );

  const match =
    cookie.match(
      new RegExp(
        `(?:^|;\\s*)${escaped}=([^;]+)`
      )
    );

  if (!match) {

    return null;

  }

  try {

    return decodeURIComponent(
      match[1]
    );

  } catch {

    return null;

  }

}


/* =========================================================
   VERIFY CUSTOMER SESSION
========================================================= */

async function verifyCustomerSession(
  request,
  env
) {

  if (
    !env.DB ||
    !env.ADMIN_PASSWORD
  ) {

    return null;

  }

  const cookie =
    getCookie(
      request,
      "hz_customer"
    );

  if (!cookie) {

    return null;

  }

  try {

    const parts =
      cookie.split(".");

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
      !Number.isSafeInteger(
        customerId
      ) ||
      customerId <= 0 ||
      !Number.isSafeInteger(
        timestamp
      ) ||
      !signature
    ) {

      return null;

    }

    const age =
      Date.now() -
      timestamp;

    if (
      age < 0 ||
      age > CUSTOMER_SESSION_MAX_AGE
    ) {

      return null;

    }

    const key =
      await createHmacKey(
        env.ADMIN_PASSWORD
      );

    const valid =
      await crypto.subtle.verify(
        "HMAC",
        key,
        hexToBytes(
          signature
        ),
        new TextEncoder().encode(
          `${customerId}.${timestamp}`
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
   VERIFY ADMIN SESSION
========================================================= */

async function verifyAdminSession(
  request,
  env
) {

  if (
    !env.ADMIN_PASSWORD
  ) {

    return false;

  }

  const cookie =
    getCookie(
      request,
      "hz_admin"
    );

  if (!cookie) {

    return false;

  }

  try {

    const parts =
      cookie.split(".");

    if (
      parts.length !== 2
    ) {

      return false;

    }

    const timestamp =
      Number(
        parts[0]
      );

    const signature =
      parts[1];

    if (
      !Number.isSafeInteger(
        timestamp
      ) ||
      !signature
    ) {

      return false;

    }

    const age =
      Date.now() -
      timestamp;

    if (
      age < 0 ||
      age > ADMIN_SESSION_MAX_AGE
    ) {

      return false;

    }

    const key =
      await createHmacKey(
        env.ADMIN_PASSWORD
      );

    return await crypto.subtle.verify(
      "HMAC",
      key,
      hexToBytes(
        signature
      ),
      new TextEncoder().encode(
        String(timestamp)
      )
    );

  } catch {

    return false;

  }

}


/* =========================================================
   WHATSAPP PARAMETER CLEANER
========================================================= */

function cleanWhatsAppParam(
  value
) {

  return String(
    value ?? ""
  )
    .replace(
      /\s+/gu,
      " "
    )
    .trim()
    .slice(
      0,
      1024
    );

}


/* =========================================================
   SEND ORDER TO WHATSAPP
========================================================= */

async function sendOrderToWhatsApp(
  order,
  env
) {

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

  let items =
    order.items;

  if (
    typeof items ===
    "string"
  ) {

    try {

      items =
        JSON.parse(
          items
        );

    } catch {

      items = [];

    }

  }

  const productsText =
    Array.isArray(items)
      ? items
          .map(
            item => {

              const price =
                toMoney(
                  item.price
                );

              const quantity =
                toInteger(
                  item.quantity
                );

              return (
                `${cleanWhatsAppParam(item.name)} x ${quantity} = $${(
                  price *
                  quantity
                ).toFixed(2)}`
              );

            }
          )
          .join(" | ")
      : "";

  /*
     رسم التوصيل الثابت للطلبات:
     $4.00

     نستخدم القيمة التي حسبها السيرفر
     داخل order.delivery.
  */

  const deliveryCost =
    toMoney(
      order.delivery
    );

  const finalTotal =
    toMoney(
      order.total
    );

  const totalBeforeDelivery =
    Math.max(
      0,
      finalTotal -
      deliveryCost
    );

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
                            order.customer_name
                          )
                      },

                      {
                        type:
                          "text",

                        text:
                          cleanWhatsAppParam(
                            order.phone
                          )
                      },

                      {
                        type:
                          "text",

                        text:
                          cleanWhatsAppParam(
                            order.governorate
                          )
                      },

                      {
                        type:
                          "text",

                        text:
                          cleanWhatsAppParam(
                            order.area
                          )
                      },

                      {
                        type:
                          "text",

                        text:
                          cleanWhatsAppParam(
                            order.address
                          )
                      },

                      {
                        type:
                          "text",

                        text:
                          cleanWhatsAppParam(
                            order.payment_method
                          )
                      },

                      {
                        type:
                          "text",

                        text:
                          productsText
                      },

                      {
                        type:
                          "text",

                        text:
                          totalBeforeDelivery.toFixed(2)
                      },

                      {
                        type:
                          "text",

                        text:
                          deliveryCost.toFixed(2)
                      },

                      {
                        type:
                          "text",

                        text:
                          finalTotal.toFixed(2)
                      }

                    ]

                  }

                ]

              }

            })

        }
      );

  } catch (
    error
  ) {

    throw new Error(
      `فشل الاتصال بـ WhatsApp API: ${
        error?.message ||
        "خطأ غير معروف"
      }`
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

  if (
    !response.ok
  ) {

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
   NORMALIZE PRODUCT FOR PUBLIC API
========================================================= */

function normalizeProduct(
  product
) {

  const images =
    normalizeImages(
      product?.image
    );

  const price =
    toMoney(
      product?.price
    );

  const oldPrice =
    product?.old_price ===
      null ||
    product?.old_price ===
      undefined ||
    product?.old_price ===
      ""
      ? null
      : toMoney(
          product.old_price
        );

  const stock =
    Math.max(
      0,
      toInteger(
        product?.stock
      )
    );

  return {

    ...product,

    id:
      toInteger(
        product?.id
      ),

    name:
      safeString(
        product?.name,
        MAX_PRODUCT_NAME_LENGTH
      ),

    category:
      safeString(
        product?.category,
        100
      ),

    description:
      safeString(
        product?.description,
        MAX_PRODUCT_DESCRIPTION_LENGTH
      ),

    price:
      price,

    old_price:
      oldPrice,

    stock:
      stock,

    badge:
      safeString(
        product?.badge,
        MAX_PRODUCT_BADGE_LENGTH
      ),

    images:
      images,

    image:
      images[0] ||
      safeString(
        product?.image,
        2000
      )

  };

}


/* =========================================================
   READ PRODUCTS
========================================================= */

async function getProducts(
  env
) {

  const query =
    await env.DB
      .prepare(
        "SELECT * FROM products ORDER BY id DESC"
      )
      .all();

  const results =
    Array.isArray(
      query?.results
    )
      ? query.results
      : [];

  return results.map(
    normalizeProduct
  );

}


/* =========================================================
   VALIDATE PRODUCT INPUT
========================================================= */

function validateProductInput(
  data
) {

  const name =
    safeString(
      data?.name,
      MAX_PRODUCT_NAME_LENGTH
    );

  const category =
    safeString(
      data?.category,
      100
    );

  const description =
    safeString(
      data?.description,
      MAX_PRODUCT_DESCRIPTION_LENGTH
    );

  const badge =
    safeString(
      data?.badge,
      MAX_PRODUCT_BADGE_LENGTH
    );

  if (
    !name
  ) {

    return {
      error:
        "اسم المنتج مطلوب"
    };

  }

  if (
    !category
  ) {

    return {
      error:
        "قسم المنتج مطلوب"
    };

  }

  if (
    data?.price ===
    undefined ||
    data?.price ===
    null ||
    data?.price ===
    ""
  ) {

    return {
      error:
        "سعر المنتج مطلوب"
    };

  }

  const price =
    toMoney(
      data.price
    );

  if (
    !Number.isFinite(
      Number(data.price)
    ) ||
    price < 0
  ) {

    return {
      error:
        "السعر غير صحيح"
    };

  }

  let oldPrice =
    null;

  if (
    data.old_price !==
      undefined &&
    data.old_price !==
      null &&
    data.old_price !==
      ""
  ) {

    oldPrice =
      toMoney(
        data.old_price
      );

    if (
      !Number.isFinite(
        Number(data.old_price)
      ) ||
      oldPrice < 0
    ) {

      return {
        error:
          "السعر القديم غير صحيح"
      };

    }

  }

  let stock =
    toInteger(
      data?.stock ?? 0
    );

  if (
    !Number.isFinite(
      Number(data?.stock ?? 0)
    ) ||
    stock < 0
  ) {

    return {
      error:
        "المخزون غير صحيح"
    };

  }

  const images =
    normalizeImages(
      Array.isArray(
        data?.images
      )
        ? data.images
        : data?.image
    );

  return {

    name,

    category,

    description,

    badge,

    price,

    oldPrice,

    stock,

    images

  };

}


/* =========================================================
   BUILD VERIFIED ORDER ITEMS
========================================================= */

async function buildVerifiedOrderItems(
  requestedItems,
  env
) {

  if (
    !Array.isArray(
      requestedItems
    )
  ) {

    throw new Error(
      "قائمة المنتجات غير صحيحة"
    );

  }

  if (
    requestedItems.length === 0
  ) {

    throw new Error(
      "السلة فارغة"
    );

  }

  if (
    requestedItems.length >
    MAX_ORDER_ITEMS
  ) {

    throw new Error(
      "عدد المنتجات في الطلب كبير جدًا"
    );

  }

  /*
     نجمع الكميات حسب ID.
     هذا يمنع إرسال المنتج نفسه عدة مرات
     للتحايل على فحص المخزون.
  */

  const quantities =
    new Map();

  for (
    const item of requestedItems
  ) {

    const id =
      toInteger(
        item?.id
      );

    const quantity =
      toInteger(
        item?.quantity
      );

    if (
      !id ||
      id <= 0
    ) {

      throw new Error(
        "معرّف منتج غير صحيح"
      );

    }

    if (
      quantity <= 0 ||
      quantity >
      MAX_ITEM_QUANTITY
    ) {

      throw new Error(
        "كمية منتج غير صحيحة"
      );

    }

    const previous =
      quantities.get(
        id
      ) || 0;

    const totalQuantity =
      previous +
      quantity;

    if (
      totalQuantity >
      MAX_ITEM_QUANTITY
    ) {

      throw new Error(
        "الكمية المطلوبة كبيرة جدًا"
      );

    }

    quantities.set(
      id,
      totalQuantity
    );

  }

  const verifiedItems = [];

  let subtotal =
    0;

  for (
    const [
      productId,
      quantity
    ] of quantities
  ) {

    const product =
      await env.DB
        .prepare(`
          SELECT
            id,
            name,
            price,
            image,
            stock
          FROM products
          WHERE id = ?
          LIMIT 1
        `)
        .bind(
          productId
        )
        .first();

    if (
      !product
    ) {

      throw new Error(
        `المنتج رقم ${productId} غير موجود`
      );

    }

    const price =
      toMoney(
        product.price
      );

    const stock =
      Math.max(
        0,
        toInteger(
          product.stock
        )
      );

    if (
      stock <
      quantity
    ) {

      throw new Error(
        `الكمية المطلوبة من "${safeString(product.name, 200)}" غير متوفرة`
      );

    }

    const lineTotal =
      toMoney(
        price *
        quantity
      );

    subtotal =
      toMoney(
        subtotal +
        lineTotal
      );

    verifiedItems.push({

      id:
        toInteger(
          product.id
        ),

      name:
        safeString(
          product.name,
          MAX_PRODUCT_NAME_LENGTH
        ),

      price:
        price,

      image:
        safeString(
          product.image,
          2000
        ),

      quantity:
        quantity

    });

  }

  return {

    items:
      verifiedItems,

    subtotal:
      subtotal

  };

}


/* =========================================================
   CALCULATE SERVER DISCOUNT
========================================================= */

function calculateDiscount(
  subtotal,
  requestedDiscount
) {

  const safeSubtotal =
    toMoney(
      subtotal
    );

  const requested =
    toMoney(
      requestedDiscount
    );

  if (
    requested <= 0
  ) {

    return 0;

  }

  /*
     index.html يستخدم HZ10 = 10%.
     بما أن الكود الحالي لا يرسل اسم الكوبون
     إلى Worker، نمنع أي خصم أكبر من 10%
     من subtotal.
  */

  const maximumDiscount =
    toMoney(
      safeSubtotal * 0.10
    );

  return Math.min(
    Math.max(
      0,
      requested
    ),
    maximumDiscount
  );

}


/* =========================================================
   VALIDATE PAYMENT METHOD
========================================================= */

function normalizePaymentMethod(
  value
) {

  const payment =
    safeString(
      value,
      100
    );

  const allowed = new Set([
    "cash",
    "cod",
    "cash_on_delivery",
    "الدفع عند الاستلام",
    "عند الاستلام"
  ]);

  /*
     إذا كانت الواجهة الحالية ترسل قيمة مختلفة،
     نحافظ عليها بدل كسر الطلب.
  */

  if (
    payment.length >
    0
  ) {

    return payment;

  }

  return "";

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
       API: CUSTOMER REGISTER
    ===================================================== */

    if (
      url.pathname ===
        "/api/customer-register" &&
      request.method ===
        "POST"
    ) {

      try {

        if (
          !env.DB
        ) {

          return errorResponse(
            "قاعدة البيانات غير متاحة",
            500
          );

        }

        const data =
          await request.json();

        const name =
          safeString(
            data?.name,
            MAX_NAME_LENGTH
          );

        const phone =
          normalizePhone(
            data?.phone
          );

        const password =
          String(
            data?.password || ""
          );

        if (
          !name ||
          !phone ||
          !password
        ) {

          return errorResponse(
            "الاسم ورقم الهاتف وكلمة المرور مطلوبة",
            400
          );

        }

        if (
          password.length <
          6
        ) {

          return errorResponse(
            "كلمة المرور يجب أن تكون 6 أحرف أو أرقام على الأقل",
            400
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

        if (
          existing
        ) {

          return errorResponse(
            "رقم الهاتف مسجل مسبقًا",
            409
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
          result?.meta?.last_row_id;

        if (
          !customerId
        ) {

          return errorResponse(
            "تعذر إنشاء الحساب",
            500
          );

        }

        const session =
          await createCustomerSession(
            customerId,
            env
          );

        return jsonResponse(

          {

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

          },

          200,

          {

            "Set-Cookie":
              `hz_customer=${encodeURIComponent(session)}; ` +
              `Path=/; ` +
              `HttpOnly; ` +
              `Secure; ` +
              `SameSite=Strict; ` +
              `Max-Age=604800`

          }

        );

      } catch (
        error
      ) {

        console.error(
          "CUSTOMER_REGISTER_ERROR",
          error?.stack ||
          error?.message ||
          error
        );

        return errorResponse(
          "تعذر إنشاء الحساب",
          500
        );

      }

    }


    /* =====================================================
       API: CUSTOMER LOGIN
    ===================================================== */

    if (
      url.pathname ===
        "/api/customer-login" &&
      request.method ===
        "POST"
    ) {

      try {

        if (
          !env.DB
        ) {

          return errorResponse(
            "قاعدة البيانات غير متاحة",
            500
          );

        }

        const data =
          await request.json();

        const phone =
          normalizePhone(
            data?.phone
          );

        const password =
          String(
            data?.password || ""
          );

        if (
          !phone ||
          !password
        ) {

          return errorResponse(
            "رقم الهاتف وكلمة المرور مطلوبان",
            400
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

        if (
          !customer
        ) {

          return errorResponse(
            "رقم الهاتف أو كلمة المرور غير صحيحة",
            401
          );

        }

        const valid =
          await verifyPassword(
            password,
            customer.password_hash
          );

        if (
          !valid
        ) {

          return errorResponse(
            "رقم الهاتف أو كلمة المرور غير صحيحة",
            401
          );

        }

        const session =
          await createCustomerSession(
            customer.id,
            env
          );

        return jsonResponse(

          {

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

          },

          200,

          {

            "Set-Cookie":
              `hz_customer=${encodeURIComponent(session)}; ` +
              `Path=/; ` +
              `HttpOnly; ` +
              `Secure; ` +
              `SameSite=Strict; ` +
              `Max-Age=604800`

          }

        );

      } catch (
        error
      ) {

        console.error(
          "CUSTOMER_LOGIN_ERROR",
          error?.stack ||
          error?.message ||
          error
        );

        return errorResponse(
          "حدث خطأ في تسجيل الدخول",
          500
        );

      }

    }


    /* =====================================================
       API: CUSTOMER ME
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

        if (
          !customer
        ) {

          return jsonResponse({
            logged_in:
              false
          });

        }

        return jsonResponse({

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

        return jsonResponse({
          logged_in:
            false
        });

      }

    }


    /* =====================================================
       API: CUSTOMER LOGOUT
    ===================================================== */

    if (
      url.pathname ===
        "/api/customer-logout" &&
      request.method ===
        "POST"
    ) {

      return jsonResponse(

        {
          success:
            true
        },

        200,

        {

          "Set-Cookie":
            "hz_customer=; " +
            "Path=/; " +
            "HttpOnly; " +
            "Secure; " +
            "SameSite=Strict; " +
            "Max-Age=0"

        }

      );

    }


    /* =====================================================
       API: CUSTOMER ORDERS
    ===================================================== */

    if (
      url.pathname ===
        "/api/customer-orders" &&
      request.method ===
        "GET"
    ) {

      try {

        if (
          !env.DB
        ) {

          return errorResponse(
            "قاعدة البيانات غير متاحة",
            500
          );

        }

        const customer =
          await verifyCustomerSession(
            request,
            env
          );

        if (
          !customer
        ) {

          return jsonResponse(
            {

              success:
                false,

              error:
                "يجب تسجيل الدخول لرؤية الطلبات",

              orders:
                []

            },

            401

          );

        }

        const query =
          await env.DB
            .prepare(`
              SELECT
                *
              FROM orders
              WHERE customer_id = ?
              ORDER BY id DESC
            `)
            .bind(
              Number(
                customer.id
              )
            )
            .all();

        const results =
          Array.isArray(
            query?.results
          )
            ? query.results
            : [];

        return jsonResponse({

          success:
            true,

          orders:
            results

        });

      } catch (
        error
      ) {

        console.error(
          "CUSTOMER_ORDERS_ERROR",
          error?.stack ||
          error?.message ||
          error
        );

        return errorResponse(
          "تعذر جلب الطلبات",
          500
        );

      }

    }


    /* =====================================================
       API: TEST SECRET
    ===================================================== */

    if (
      url.pathname ===
      "/api/test-secret"
    ) {

      return jsonResponse({

        exists:
          !!env.ADMIN_PASSWORD,

        whatsapp_token:
          !!env.WHATSAPP_ACCESS_TOKEN,

        whatsapp_phone_id:
          !!env.WHATSAPP_PHONE_NUMBER_ID,

        whatsapp_business_id:
          !!env.WHATSAPP_BUSINESS_ACCOUNT_ID,

        github_token:
          !!env.GITHUB_TOKEN,

        database:
          !!env.DB

      });

    }


    /* =====================================================
       API: ADMIN LOGIN
    ===================================================== */

    if (
      url.pathname ===
        "/api/admin-login" &&
      request.method ===
        "POST"
    ) {

      try {

        if (
          !env.ADMIN_PASSWORD
        ) {

          return errorResponse(
            "ADMIN_PASSWORD غير موجود",
            500
          );

        }

        const data =
          await request.json();

        const password =
          String(
            data?.password || ""
          );

        if (
          !password
        ) {

          return errorResponse(
            "كلمة المرور مطلوبة",
            400
          );

        }

        if (
          password !==
          env.ADMIN_PASSWORD
        ) {

          return errorResponse(
            "كلمة المرور غير صحيحة",
            401
          );

        }

        const session =
          await createAdminSession(
            env
          );

        return jsonResponse(

          {
            success:
              true
          },

          200,

          {

            "Set-Cookie":
              `hz_admin=${encodeURIComponent(session)}; ` +
              `Path=/; ` +
              `HttpOnly; ` +
              `Secure; ` +
              `SameSite=Strict; ` +
              `Max-Age=86400`

          }

        );

      } catch (
        error
      ) {

        console.error(
          "ADMIN_LOGIN_ERROR",
          error?.stack ||
          error?.message ||
          error
        );

        return errorResponse(
          "حدث خطأ في تسجيل الدخول",
          500
        );

      }

    }


    /* =====================================================
       API: ADMIN LOGOUT
    ===================================================== */

    if (
      url.pathname ===
        "/api/admin-logout" &&
      request.method ===
        "POST"
    ) {

      return jsonResponse(

        {
          success:
            true
        },

        200,

        {

          "Set-Cookie":
            "hz_admin=; " +
            "Path=/; " +
            "HttpOnly; " +
            "Secure; " +
            "SameSite=Strict; " +
            "Max-Age=0"

        }

      );

    }


    /* =====================================================
       API: UPLOAD PRODUCT IMAGE
    ===================================================== */

    if (
      url.pathname ===
        "/api/upload-image" &&
      request.method ===
        "POST"
    ) {

      try {

        const isAdmin =
          await verifyAdminSession(
            request,
            env
          );

        if (
          !isAdmin
        ) {

          return errorResponse(
            "غير مصرح",
            401
          );

        }

        const formData =
          await request.formData();

        const file =
          formData.get(
            "image"
          ) ||
          formData.get(
            "file"
          );

        if (
          !file ||
          typeof file.arrayBuffer !==
            "function"
        ) {

          return errorResponse(
            "لم يتم اختيار صورة",
            400
          );

        }

        if (
          !String(
            file.type || ""
          ).startsWith(
            "image/"
          )
        ) {

          return errorResponse(
            "الملف يجب أن يكون صورة",
            400
          );

        }

        if (
          file.size &&
          file.size >
          8 * 1024 * 1024
        ) {

          return errorResponse(
            "حجم الصورة كبير جدًا",
            400
          );

        }

        const imageUrl =
          await uploadImageToGitHub(
            file,
            env
          );

        return jsonResponse({

          success:
            true,

          image:
            imageUrl,

          url:
            imageUrl

        });

      } catch (
        error
      ) {

        console.error(
          "UPLOAD_IMAGE_ERROR",
          error?.stack ||
          error?.message ||
          error
        );

        return errorResponse(
          error?.message ||
          "تعذر رفع الصورة",
          500
        );

      }

    }


    /* =====================================================
       API: CREATE ORDER
    ===================================================== */

    if (
      url.pathname ===
        "/api/orders" &&
      request.method ===
        "POST"
    ) {

      try {

        if (
          !env.DB
        ) {

          return errorResponse(
            "قاعدة البيانات غير متاحة",
            500
          );

        }

        const customer =
          await verifyCustomerSession(
            request,
            env
          );

        const data =
          await request.json();

        const customerName =
          safeString(
            data?.customer_name,
            MAX_NAME_LENGTH
          );

        const phone =
          normalizePhone(
            data?.phone
          );

        const governorate =
          safeString(
            data?.governorate,
            MAX_TEXT_LENGTH
          );

        const area =
          safeString(
            data?.area,
            MAX_TEXT_LENGTH
          );

        const address =
          safeString(
            data?.address,
            MAX_ADDRESS_LENGTH
          );

        const notes =
          safeString(
            data?.notes,
            MAX_NOTES_LENGTH
          );

        const paymentMethod =
          normalizePaymentMethod(
            data?.payment_method
          );

        if (
          !customerName ||
          !phone ||
          !governorate ||
          !area ||
          !address ||
          !paymentMethod
        ) {

          return errorResponse(
            "جميع معلومات الطلب المطلوبة غير مكتملة",
            400
          );

        }

        if (
          !Array.isArray(
            data?.items
          ) ||
          !data.items.length
        ) {

          return errorResponse(
            "السلة فارغة",
            400
          );

        }

        /*
           هنا يبدأ التحقق الحقيقي من المتجر:
           لا نستخدم السعر أو الاسم أو الصورة
           المرسلة من index.html للحساب.
        */

        const verified =
          await buildVerifiedOrderItems(
            data.items,
            env
          );

        const subtotal =
          verified.subtotal;

        /*
           الخصم القادم من المتصفح لا يمكن الوثوق به.
           نسمح فقط بما يعادل 10% كحد أقصى،
           وهو HZ10 الموجود في index.html.
        */

        const discount =
          calculateDiscount(
            subtotal,
            data.discount
          );

        /*
           رسم التوصيل الثابت للطلبات:
           $4.00
        */

        const deliveryCost =
          subtotal > 0
            ? 4
            : 0;

        const total =
          toMoney(
            Math.max(
              0,
              subtotal -
              discount +
              deliveryCost
            )
          );

        /*
           نجهز نسخة الطلب التي ستُحفظ في D1.
        */

        const itemsJson =
          JSON.stringify(
            verified.items
          );

        /*
           خصم المخزون يتم داخل batch
           باستخدام شرط stock >= quantity.
           إذا لم يعد المخزون كافيًا، لن يتم الخصم.
        */

        const stockStatements =
          verified.items.map(
            item =>

              env.DB
                .prepare(`
                  UPDATE products
                  SET stock = stock - ?
                  WHERE id = ?
                    AND stock >= ?
                `)
                .bind(
                  item.quantity,
                  item.id,
                  item.quantity
                )

          );

        const insertStatement =
          env.DB
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

              customer
                ? Number(
                    customer.id
                  )
                : null,

              customerName,

              phone,

              governorate,

              area,

              address,

              notes,

              paymentMethod,

              itemsJson,

              subtotal,

              discount,

              total,

              "new",

              new Date()
                .toISOString()

            );

        /*
           D1 batch:
           تحديث المخزون + إنشاء الطلب.
        */

        const statements = [
          ...stockStatements,
          insertStatement
        ];

        const batchResults =
          await env.DB.batch(
            statements
          );

        /*
           التأكد من أن كل تحديث للمخزون نجح.
        */

        for (
          let i = 0;
          i < verified.items.length;
          i++
        ) {

          const result =
            batchResults[i];

          const changes =
            Number(
              result?.meta?.changes ||
              0
            );

          if (
            changes !== 1
          ) {

            throw new Error(
              `المخزون تغير أثناء تنفيذ الطلب للمنتج ${verified.items[i].id}`
            );

          }

        }

        const insertResult =
          batchResults[
            batchResults.length - 1
          ];

        const orderId =
          insertResult?.meta?.last_row_id;

        if (
          !orderId
        ) {

          throw new Error(
            "تعذر الحصول على رقم الطلب"
          );

        }

        console.log(
          "ORDER_SAVED",
          JSON.stringify({

            order_id:
              orderId,

            customer_id:
              customer
                ? customer.id
                : null,

            subtotal:
              subtotal,

            discount:
              discount,

            delivery:
              deliveryCost,

            total:
              total

          })
        );

        /*
           نرسل إلى WhatsApp فقط البيانات
           التي تحقق منها السيرفر.
        */

        const orderForWhatsApp = {

          id:
            orderId,

          customer_name:
            customerName,

          phone:
            phone,

          governorate:
            governorate,

          area:
            area,

          address:
            address,

          notes:
            notes,

          payment_method:
            paymentMethod,

          items:
            verified.items,

          subtotal:
            subtotal,

          discount:
            discount,

          delivery:
            deliveryCost,

          total:
            total

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

        } catch (
          error
        ) {

          console.error(
            "WHATSAPP_SEND_FAILED",
            error?.message ||
            error
          );

          whatsappError =
            error?.message ||
            "فشل إرسال WhatsApp";

        }

        console.log(
          "ORDER_COMPLETE",
          JSON.stringify({

            order_id:
              orderId,

            customer_id:
              customer
                ? customer.id
                : null,

            whatsapp_sent:
              whatsappSent,

            whatsapp_message_id:
              whatsappMessageId,

            whatsapp_error:
              whatsappError

          })
        );

        /*
           index.html الحالي يبحث عن:
           order_number / orderNumber / id
        */

        return jsonResponse({

          success:
            true,

          order_id:
            orderId,

          order_number:
            orderId,

          orderNumber:
            orderId,

          subtotal:
            subtotal,

          discount:
            discount,

          delivery:
            deliveryCost,

          total:
            total,

          whatsapp_sent:
            whatsappSent,

          whatsapp_message_id:
            whatsappMessageId,

          whatsapp_error:
            whatsappError

        });

      } catch (
        error
      ) {

        console.error(
          "ORDER_ERROR",
          error?.stack ||
          error?.message ||
          error
        );

        const message =
          error?.message ||
          "";

        if (
          message.includes(
            "غير متوفرة"
          ) ||
          message.includes(
            "المخزون"
          ) ||
          message.includes(
            "الكمية"
          ) ||
          message.includes(
            "السلة"
          )
        ) {

          return errorResponse(
            message,
            409
          );

        }

        return errorResponse(
          "تعذر حفظ الطلب",
          500
        );

      }

    }


    /* =====================================================
       API: ADMIN GET ORDERS
    ===================================================== */

    if (
      url.pathname ===
        "/api/orders" &&
      request.method ===
        "GET"
    ) {

      try {

        const isAdmin =
          await verifyAdminSession(
            request,
            env
          );

        if (
          !isAdmin
        ) {

          return errorResponse(
            "غير مصرح",
            401
          );

        }

        const query =
          await env.DB
            .prepare(`
              SELECT *
              FROM orders
              ORDER BY id DESC
            `)
            .all();

        const results =
          Array.isArray(
            query?.results
          )
            ? query.results
            : [];

        return jsonResponse(
          results
        );

      } catch (
        error
      ) {

        console.error(
          "ADMIN_ORDERS_GET_ERROR",
          error?.stack ||
          error?.message ||
          error
        );

        return errorResponse(
          "تعذر جلب الطلبات",
          500
        );

      }

    }


    /* =====================================================
       API: UPDATE ORDER STATUS
    ===================================================== */

    if (
      url.pathname ===
        "/api/orders" &&
      request.method ===
        "PUT"
    ) {

      try {

        const isAdmin =
          await verifyAdminSession(
            request,
            env
          );

        if (
          !isAdmin
        ) {

          return errorResponse(
            "غير مصرح",
            401
          );

        }

        const data =
          await request.json();

        const id =
          toInteger(
            data?.id
          );

        const status =
          safeString(
            data?.status,
            50
          );

        if (
          !id ||
          !status
        ) {

          return errorResponse(
            "معرّف الطلب والحالة مطلوبان",
            400
          );

        }

        /*
           الحالات الأساسية للمتجر.
           نسمح أيضًا بالقيمة الموجودة حاليًا
           إذا كانت الإدارة تستخدم تسمية أخرى.
        */

        const allowedStatuses =
          new Set([
            "new",
            "confirmed",
            "processing",
            "shipped",
            "delivered",
            "cancelled",
            "completed",
            "pending"
          ]);

        if (
          !allowedStatuses.has(
            status
          )
        ) {

          return errorResponse(
            "حالة الطلب غير صحيحة",
            400
          );

        }

        const result =
          await env.DB
            .prepare(`
              UPDATE orders
              SET status = ?
              WHERE id = ?
            `)
            .bind(
              status,
              id
            )
            .run();

        const changes =
          Number(
            result?.meta?.changes ||
            0
          );

        if (
          changes === 0
        ) {

          return errorResponse(
            "الطلب غير موجود",
            404
          );

        }

        return jsonResponse({

          success:
            true

        });

      } catch (
        error
      ) {

        console.error(
          "ORDER_STATUS_UPDATE_ERROR",
          error?.stack ||
          error?.message ||
          error
        );

        return errorResponse(
          "تعذر تحديث الطلب",
          500
        );

      }

    }


    /* =====================================================
       API: PRODUCTS
    ===================================================== */

    if (
      url.pathname ===
      "/api/products"
    ) {


      /* ===================================================
         GET PRODUCTS
      =================================================== */

      if (
        request.method ===
        "GET"
      ) {

        try {

          if (
            !env.DB
          ) {

            return errorResponse(
              "D1 DB binding غير موجود",
              500
            );

          }

          const products =
            await getProducts(
              env
            );

          return jsonResponse(
            products
          );

        } catch (
          error
        ) {

          console.error(
            "PRODUCTS_GET_ERROR",
            error?.stack ||
            error?.message ||
            error
          );

          return errorResponse(
            "تعذر تحميل المنتجات",
            500
          );

        }

      }


      /* ===================================================
         ADMIN CREATE / UPDATE PRODUCT
      =================================================== */

      if (
        request.method ===
          "POST" ||
        request.method ===
          "PUT"
      ) {

        const isAdmin =
          await verifyAdminSession(
            request,
            env
          );

        if (
          !isAdmin
        ) {

          return errorResponse(
            "غير مصرح",
            401
          );

        }

        try {

          const data =
            await request.json();

          const product =
            validateProductInput(
              data
            );

          if (
            product.error
          ) {

            return errorResponse(
              product.error,
              400
            );

          }


          /* ===============================================
             CREATE PRODUCT
          =============================================== */

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

                  product.name,

                  product.category,

                  product.description,

                  product.price,

                  product.oldPrice,

                  product.images.length
                    ? JSON.stringify(
                        product.images
                      )
                    : "",

                  product.stock,

                  product.badge

                )
                .run();

            return jsonResponse({

              success:
                true,

              id:
                result?.meta?.last_row_id

            });

          }


          /* ===============================================
             UPDATE PRODUCT
          =============================================== */

          const id =
            toInteger(
              data?.id
            );

          if (
            !id
          ) {

            return errorResponse(
              "معرّف المنتج مطلوب",
              400
            );

          }

          const result =
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

                product.name,

                product.category,

                product.description,

                product.price,

                product.oldPrice,

                product.images.length
                  ? JSON.stringify(
                      product.images
                    )
                  : "",

                product.stock,

                product.badge,

                id

              )
              .run();

          const changes =
            Number(
              result?.meta?.changes ||
              0
            );

          if (
            changes === 0
          ) {

            return errorResponse(
              "المنتج غير موجود",
              404
            );

          }

          return jsonResponse({

            success:
              true

          });

        } catch (
          error
        ) {

          console.error(
            "PRODUCTS_WRITE_ERROR",
            error?.stack ||
            error?.message ||
            error
          );

          return errorResponse(
            "تعذر حفظ المنتج",
            500
          );

        }

      }


      /* ===================================================
         DELETE PRODUCT
      =================================================== */

      if (
        request.method ===
        "DELETE"
      ) {

        const isAdmin =
          await verifyAdminSession(
            request,
            env
          );

        if (
          !isAdmin
        ) {

          return errorResponse(
            "غير مصرح",
            401
          );

        }

        const id =
          toInteger(
            url.searchParams.get(
              "id"
            )
          );

        if (
          !id
        ) {

          return errorResponse(
            "معرّف المنتج مطلوب",
            400
          );

        }

        try {

          const result =
            await env.DB
              .prepare(
                "DELETE FROM products WHERE id = ?"
              )
              .bind(
                id
              )
              .run();

          const changes =
            Number(
              result?.meta?.changes ||
              0
            );

          if (
            changes === 0
          ) {

            return errorResponse(
              "المنتج غير موجود",
              404
            );

          }

          return jsonResponse({

            success:
              true

          });

        } catch (
          error
        ) {

          console.error(
            "PRODUCT_DELETE_ERROR",
            error?.stack ||
            error?.message ||
            error
          );

          return errorResponse(
            "تعذر حذف المنتج",
            500
          );

        }

      }

    }


    /* =====================================================
       HEALTH CHECK
    ===================================================== */

    if (
      url.pathname ===
        "/api/health" &&
      request.method ===
        "GET"
    ) {

      try {

        if (
          !env.DB
        ) {

          return jsonResponse(
            {

              ok:
                false,

              db:
                false,

              error:
                "D1 DB binding غير موجود"

            },

            500

          );

        }

        const result =
          await env.DB
            .prepare(
              "SELECT COUNT(*) AS count FROM products"
            )
            .first();

        return jsonResponse({

          ok:
            true,

          db:
            true,

          products:
            Number(
              result?.count ||
              0
            )

        });

      } catch (
        error
      ) {

        console.error(
          "HEALTH_ERROR",
          error?.stack ||
          error?.message ||
          error
        );

        return jsonResponse(

          {

            ok:
              false,

            db:
              false,

            error:
              "D1 error"

          },

          500

        );

      }

    }


    /* =====================================================
       STATIC ASSETS
       + SOCIAL SHARE IMAGE
    ===================================================== */

    if (
      !env.ASSETS
    ) {

      return new Response(
        "ASSETS binding غير موجود",
        {

          status:
            500,

          headers: {

            "Content-Type":
              "text/plain; charset=utf-8"

          }

        }
      );

    }

    const assetResponse =
      await env.ASSETS.fetch(
        request
      );


    /* =====================================================
       SOCIAL SHARE IMAGE
    ===================================================== */

    if (
      request.method ===
        "GET" &&
      url.pathname ===
        "/"
    ) {

      const contentType =
        assetResponse.headers.get(
          "content-type"
        ) || "";

      if (
        contentType.includes(
          "text/html"
        )
      ) {

        const ogImage =
          "https://i.ibb.co/v4Xbhb88/IMG-3508.jpg";

        return new HTMLRewriter()

          .on(
            "head",
            {

              element(
                element
              ) {

                element.append(

                  `<meta property="og:image" content="${ogImage}">
<meta property="og:image:type" content="image/jpeg">
<meta property="og:image:width" content="1440">
<meta property="og:image:height" content="768">`,

                  {
                    html:
                      true
                  }

                );

              }

            }
          )

          .transform(
            assetResponse
          );

      }

    }


    return assetResponse;

  }

};
