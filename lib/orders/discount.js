```javascript
import { toMoney } from "../utils/number.js";

export function calculateDiscount(
    subtotal,
    requestedDiscount
) {
    const safeSubtotal =
        toMoney(subtotal);

    const requested =
        toMoney(requestedDiscount);

    if (requested <= 0) {
        return 0;
    }

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
```
