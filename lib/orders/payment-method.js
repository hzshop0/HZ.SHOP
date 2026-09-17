```javascript
import { safeString } from "../utils/sanitize.js";

export function normalizePaymentMethod(value) {
    const payment = safeString(
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

    if (payment.length > 0) {
        return payment;
    }

    return "";
}
```
