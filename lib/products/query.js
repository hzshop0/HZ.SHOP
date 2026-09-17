```javascript
import { normalizeProduct } from "./normalize.js";

export async function getProducts(env) {
    const result = await env.DB
        .prepare(`
            SELECT
                p.*,
                COALESCE(
                    SUM(
                        CASE
                            WHEN o.status != 'cancelled'
                            THEN oi.quantity
                            ELSE 0
                        END
                    ),
                    0
                ) AS sales
            FROM products p
            LEFT JOIN order_items oi
                ON oi.product_id = p.id
            LEFT JOIN orders o
                ON o.id = oi.order_id
            GROUP BY p.id
            ORDER BY p.id DESC
        `)
        .all();

    return (result.results || [])
        .map(normalizeProduct)
        .filter(Boolean);
}
```
