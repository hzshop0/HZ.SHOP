```javascript
import {
    MAX_ORDER_ITEMS,
    MAX_ITEM_QUANTITY
} from "../config/constants.js";

import { safeString } from "../utils/sanitize.js";
import { toMoney, toInteger } from "../utils/number.js";

export async function buildVerifiedOrderItems(
    requestedItems,
    env
) {
    if (!Array.isArray(requestedItems)) {
        throw new Error(
            "قائمة المنتجات غير صحيحة"
        );
    }

    const items = requestedItems
        .slice(0, MAX_ORDER_ITEMS);

    if (!items.length) {
        throw new Error(
            "السلة فارغة"
        );
    }

    const verifiedItems = [];

    for (const item of items) {
        if (!item || typeof item !== "object") {
            throw new Error(
                "بيانات المنتج غير صحيحة"
            );
        }

        const productId =
            item.id ??
            item.productId ??
            item.product_id;

        const quantity = Math.min(
            MAX_ITEM_QUANTITY,
            Math.max(
                1,
                toInteger(
                    item.quantity,
                    1
                )
            )
        );

        if (
            productId === null ||
            productId === undefined
        ) {
            throw new Error(
                "معرّف المنتج غير صحيح"
            );
        }

        const product =
            await env.DB
                .prepare(`
                    SELECT *
                    FROM products
                    WHERE id = ?
                    LIMIT 1
                `)
                .bind(productId)
                .first();

        if (!product) {
            throw new Error(
                "أحد المنتجات غير موجود"
            );
        }

        const stock = Math.max(
            0,
            toInteger(product.stock)
        );

        if (stock < quantity) {
            throw new Error(
                `الكمية المطلوبة من المنتج "${safeString(product.name, 200)}" غير متوفرة`
            );
        }

        const price = toMoney(
            product.price
        );

        verifiedItems.push({
            id: product.id,
            name: safeString(
                product.name,
                200
            ),
            price,
            quantity,
            subtotal: toMoney(
                price * quantity
            )
        });
    }

    return verifiedItems;
}
```
