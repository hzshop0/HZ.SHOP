```javascript
import {
    MAX_PRODUCT_NAME_LENGTH,
    MAX_PRODUCT_DESCRIPTION_LENGTH,
    MAX_PRODUCT_BADGE_LENGTH
} from "../config/constants.js";

import { safeString } from "../utils/sanitize.js";
import { toMoney, toInteger } from "../utils/number.js";
import { normalizeImages } from "./normalize-images.js";

export function validateProductInput(data) {
    const name = safeString(
        data?.name,
        MAX_PRODUCT_NAME_LENGTH
    );

    const category = safeString(
        data?.category,
        100
    );

    const description = safeString(
        data?.description,
        MAX_PRODUCT_DESCRIPTION_LENGTH
    );

    const badge = safeString(
        data?.badge,
        MAX_PRODUCT_BADGE_LENGTH
    );

    if (!name) {
        return {
            error: "اسم المنتج مطلوب"
        };
    }

    if (!category) {
        return {
            error: "قسم المنتج مطلوب"
        };
    }

    if (
        data?.price === undefined ||
        data?.price === null ||
        data?.price === ""
    ) {
        return {
            error: "سعر المنتج مطلوب"
        };
    }

    const price = toMoney(data.price);

    if (
        !Number.isFinite(Number(data.price)) ||
        price < 0
    ) {
        return {
            error: "السعر غير صحيح"
        };
    }

    let oldPrice = null;

    if (
        data.old_price !== undefined &&
        data.old_price !== null &&
        data.old_price !== ""
    ) {
        oldPrice = toMoney(
            data.old_price
        );

        if (
            !Number.isFinite(
                Number(data.old_price)
            ) ||
            oldPrice < 0
        ) {
            return {
                error: "السعر القديم غير صحيح"
            };
        }
    }

    const stock = toInteger(
        data?.stock ?? 0
    );

    if (
        !Number.isFinite(
            Number(data?.stock ?? 0)
        ) ||
        stock < 0
    ) {
        return {
            error: "المخزون غير صحيح"
        };
    }

    const images = normalizeImages(
        Array.isArray(data?.images)
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
```
