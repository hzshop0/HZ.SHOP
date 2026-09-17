```javascript
export async function getProducts(env) {
    const query = await env.DB
        .prepare(`
            WITH sales AS (
                SELECT
                    CAST(
                        json_extract(
                            item.value,
                            '$.id'
                        ) AS INTEGER
                    ) AS product_id,

                    SUM(
                        CAST(
                            json_extract(
                                item.value,
                                '$.quantity'
                            ) AS INTEGER
                        )
                    ) AS salesCount

                FROM orders AS o,
                     json_each(o.items) AS item

                WHERE LOWER(
                    COALESCE(
                        o.status,
                        ''
                    )
                ) <> 'cancelled'

                GROUP BY product_id
            )

            SELECT
                p.*,
                COALESCE(
                    s.salesCount,
                    0
                ) AS salesCount

            FROM products AS p

            LEFT JOIN sales AS s
                ON s.product_id = p.id

            ORDER BY p.id DESC
        `)
        .all();

    const results = Array.isArray(query?.results)
        ? query.results
        : [];

    return results;
}
```
