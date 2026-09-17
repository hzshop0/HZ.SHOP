```javascript
import {
    MAX_ORDER_ITEMS,
    MAX_ITEM_QUANTITY
} from "../config/constants.js";

import { safeString } from "../utils/sanitize.js";
import { toMoney, toInteger } from "../utils/number.js";

export function buildVerifiedOrderItems(
    requestedItems = [],
    products = []
) {
    if (!Array.isArray(requestedItems)) {
        return [];
    }

    const productMap = new Map(
        products.map(product => [
            String(product.id),
            product
        ])
    );

    return requestedItems
        .slice(0, MAX_ORDER_ITEMS)
        .map(item => {
            if (!item || typeof item !== "object") {
                return null;
            }

            const productId =
                item.id ??
                item.productId ??
                item.product_id;

            if (productId === null || productId === undefined) {
                return null;
            }

            const product = productMap.get(
                String(productId)
            );

            if (!product) {
                return null;
            }

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

            const price = toMoney(
                product.price
            );

            return {
                id: product.id,
                product_id: product.id,
                name: safeString(
                    product.name,
                    200
                ),
                price,
                quantity,
                subtotal: toMoney(
                    price * quantity
                )
            };
        })
        .filter(Boolean);
}
```
