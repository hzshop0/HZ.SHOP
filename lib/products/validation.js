```javascript
import {
    MAX_PRODUCT_NAME_LENGTH,
    MAX_PRODUCT_DESCRIPTION_LENGTH,
    MAX_PRODUCT_BADGE_LENGTH
} from "../config/constants.js";

import { safeString } from "../utils/sanitize.js";
import { toMoney, toInteger } from "../utils/number.js";
import { normalizeImages } from "./normalize-images.js";

export function validateProduct(product = {}) {
    const name = safeString(
        product.name,
        MAX_PRODUCT_NAME_LENGTH
    );

    if (!name) {
        return {
            valid: false,
            error: "اسم المنتج مطلوب"
        };
    }

    const price = toMoney(product.price);

    if (price < 0) {
        return {
            valid: false,
            error: "سعر المنتج غير صالح"
        };
    }

    const stock = toInteger(
        product.stock,
        0
    );

    if (stock < 0) {
        return {
            valid: false,
            error: "الكمية غير صالحة"
        };
    }

    const images = normalizeImages(
        product.images
    );

    return {
        valid: true,
        product: {
            ...product,
            name,
            description: safeString(
                product.description,
                MAX_PRODUCT_DESCRIPTION_LENGTH
            ),
            badge: safeString(
                product.badge,
                MAX_PRODUCT_BADGE_LENGTH
            ),
            price,
            stock,
            images
        }
    };
}
```
