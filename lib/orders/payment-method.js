```javascript id="q7m2vx"
import { safeString } from "../utils/sanitize.js";

const ALLOWED_PAYMENT_METHODS = [
    "cash_on_delivery",
    "whatsapp",
    "card",
    "online"
];

export function normalizePaymentMethod(value) {
    const paymentMethod = safeString(
        value,
        50
    );

    if (!paymentMethod) {
        return "";
    }

    if (
        ALLOWED_PAYMENT_METHODS.includes(
            paymentMethod
        )
    ) {
        return paymentMethod;
    }

    return paymentMethod;
}
```
