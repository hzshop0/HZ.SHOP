```javascript
import { safeString } from "../utils/sanitize.js";
import { toMoney } from "../utils/number.js";
import { normalizeImages } from "./normalize-images.js";

export function normalizeProduct(product) {
    if (!product || typeof product !== "object") {
        return null;
    }

    return {
        ...product,
        id: product.id ?? null,
        name: safeString(product.name, 200),
        description: safeString(product.description, 5000),
        category: safeString(product.category, 120),
        brand: safeString(product.brand, 120),
        price: toMoney(product.price),
        old_price: toMoney(product.old_price),
        stock: Math.max(
            0,
            Number.isFinite(Number(product.stock))
                ? Math.trunc(Number(product.stock))
                : 0
        ),
        images: normalizeImages(product.images),
        image: safeString(
            product.image ||
            normalizeImages(product.images)[0] ||
            "",
            2000
        )
    };
}
```
