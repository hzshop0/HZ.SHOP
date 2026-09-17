```javascript
import {
    CUSTOMER_SESSION_MAX_AGE,
    ADMIN_SESSION_MAX_AGE
} from "../config/constants.js";

import {
    bytesToHex,
    hexToBytes
} from "../utils/crypto.js";

async function createHmacKey(secret) {
    return crypto.subtle.importKey(
        "raw",
        new TextEncoder().encode(secret),
        {
            name: "HMAC",
            hash: "SHA-256"
        },
        false,
        [
            "sign",
            "verify"
        ]
    );
}

export async function createCustomerSession(
    customerId,
    env
) {
    const timestamp =
        Date.now().toString();

    const value =
        `${customerId}.${timestamp}`;

    const key =
        await createHmacKey(
            env.ADMIN_PASSWORD
        );

    const signatureBuffer =
        await crypto.subtle.sign(
            "HMAC",
            key,
            new TextEncoder().encode(
                value
            )
        );

    const signature =
        bytesToHex(
            new Uint8Array(
                signatureBuffer
            )
        );

    return (
        `${value}.${signature}`
    );
}

export async function createAdminSession(
    env
) {
    const timestamp =
        Date.now().toString();

    const key =
        await createHmacKey(
            env.ADMIN_PASSWORD
        );

    const signatureBuffer =
        await crypto.subtle.sign(
            "HMAC",
            key,
            new TextEncoder().encode(
                timestamp
            )
        );

    const signature =
        bytesToHex(
            new Uint8Array(
                signatureBuffer
            )
        );

    return (
        `${timestamp}.${signature}`
    );
}

function getCookie(
    request,
    name
) {
    const cookie =
        request.headers.get(
            "Cookie"
        ) || "";

    const escaped =
        name.replace(
            /[.*+?^${}()|[\]\\]/g,
            "\\$&"
        );

    const match =
        cookie.match(
            new RegExp(
                `(?:^|;\\s*)${escaped}=([^;]+)`
            )
        );

    if (!match) {
        return null;
    }

    try {
        return decodeURIComponent(
            match[1]
        );
    } catch {
        return null;
    }
}

export async function verifyCustomerSession(
    request,
    env
) {
    if (
        !env.DB ||
        !env.ADMIN_PASSWORD
    ) {
        return null;
    }

    const cookie =
        getCookie(
            request,
            "hz_customer"
        );

    if (!cookie) {
        return null;
    }

    try {
        const parts =
            cookie.split(".");

        if (parts.length !== 3) {
            return null;
        }

        const customerId =
            Number(parts[0]);

        const timestamp =
            Number(parts[1]);

        const signature =
            parts[2];

        if (
            !Number.isSafeInteger(
                customerId
            ) ||
            customerId <= 0 ||
            !Number.isSafeInteger(
                timestamp
            ) ||
            !signature
        ) {
            return null;
        }

        const age =
            Date.now() -
            timestamp;

        if (
            age < 0 ||
            age > CUSTOMER_SESSION_MAX_AGE
        ) {
            return null;
        }

        const key =
            await createHmacKey(
                env.ADMIN_PASSWORD
            );

        const valid =
            await crypto.subtle.verify(
                "HMAC",
                key,
                hexToBytes(
                    signature
                ),
                new TextEncoder().encode(
                    `${customerId}.${timestamp}`
                )
            );

        if (!valid) {
            return null;
        }

        const customer =
            await env.DB
                .prepare(`
                    SELECT
                        id,
                        name,
                        phone,
                        created_at
                    FROM customers
                    WHERE id = ?
                    LIMIT 1
                `)
                .bind(
                    customerId
                )
                .first();

        if (!customer) {
            return null;
        }

        return customer;
    } catch {
        return null;
    }
}

export async function verifyAdminSession(
    request,
    env
) {
    if (!env.ADMIN_PASSWORD) {
        return null;
    }

    const cookie =
        getCookie(
            request,
            "hz_admin"
        );

    if (!cookie) {
        return null;
    }

    try {
        const parts =
            cookie.split(".");

        if (parts.length !== 2) {
            return null;
        }

        const timestamp =
            Number(parts[0]);

        const signature =
            parts[1];

        if (
            !Number.isSafeInteger(
                timestamp
            ) ||
            !signature
        ) {
            return null;
        }

        const age =
            Date.now() -
            timestamp;

        if (
            age < 0 ||
            age > ADMIN_SESSION_MAX_AGE
        ) {
            return null;
        }

        const key =
            await createHmacKey(
                env.ADMIN_PASSWORD
            );

        const valid =
            await crypto.subtle.verify(
                "HMAC",
                key,
                hexToBytes(
                    signature
                ),
                new TextEncoder().encode(
                    timestamp.toString()
                )
            );

        if (!valid) {
            return null;
        }

        return {
            admin: true
        };
    } catch {
        return null;
    }
}

export function setCustomerSessionCookie(
    token
) {
    return (
        `hz_customer=${encodeURIComponent(token)}; ` +
        `Path=/; ` +
        `HttpOnly; ` +
        `Secure; ` +
        `SameSite=Strict; ` +
        `Max-Age=604800`
    );
}

export function clearCustomerSessionCookie() {
    return (
        "hz_customer=; " +
        "Path=/; " +
        "HttpOnly; " +
        "Secure; " +
        "SameSite=Strict; " +
        "Max-Age=0"
    );
}

export function setAdminSessionCookie(
    token
) {
    return (
        `hz_admin=${encodeURIComponent(token)}; ` +
        `Path=/; ` +
        `HttpOnly; ` +
        `Secure; ` +
        `SameSite=Strict; ` +
        `Max-Age=86400`
    );
}

export function clearAdminSessionCookie() {
    return (
        "hz_admin=; " +
        "Path=/; " +
        "HttpOnly; " +
        "Secure; " +
        "SameSite=Strict; " +
        "Max-Age=0"
    );
}
```
