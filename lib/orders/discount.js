```javascript
import { toMoney } from "../utils/number.js";

const DISCOUNT_CODE = "HZ10";
const DISCOUNT_RATE = 0.10;
const MIN_SUBTOTAL = 50;

export function calculateDiscount(
    subtotal,
    code = ""
) {
    const amount = toMoney(subtotal);
    const normalizedCode = String(code || "")
        .trim()
        .toUpperCase();

    if (
        normalizedCode !== DISCOUNT_CODE ||
        amount < MIN_SUBTOTAL
    ) {
        return {
            code: "",
            rate: 0,
            amount: 0
        };
    }

    return {
        code: DISCOUNT_CODE,
        rate: DISCOUNT_RATE,
        amount: toMoney(
            amount * DISCOUNT_RATE
        )
    };
}
```
