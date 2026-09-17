```javascript
import { bytesToHex, hexToBytes } from "../utils/crypto.js";

export async function hashPassword(
    password,
    saltHex = null
) {
    const encoder =
        new TextEncoder();

    let salt;

    if (saltHex) {
        salt =
            hexToBytes(
                saltHex
            );

        if (salt.length !== 16) {
            throw new Error(
                "ملح كلمة المرور غير صالح"
            );
        }
    } else {
        salt =
            crypto.getRandomValues(
                new Uint8Array(16)
            );
    }

    const keyMaterial =
        await crypto.subtle.importKey(
            "raw",
            encoder.encode(password),
            {
                name: "PBKDF2"
            },
            false,
            [
                "deriveBits"
            ]
        );

    const hashBuffer =
        await crypto.subtle.deriveBits(
            {
                name: "PBKDF2",
                salt,
                iterations: 100000,
                hash: "SHA-256"
            },
            keyMaterial,
            256
        );

    return {
        salt:
            bytesToHex(salt),

        hash:
            bytesToHex(
                new Uint8Array(
                    hashBuffer
                )
            )
    };
}

export async function verifyPassword(
    password,
    storedPassword
) {
    if (!storedPassword) {
        return false;
    }

    const parts =
        String(
            storedPassword
        ).split(":");

    if (parts.length !== 2) {
        return false;
    }

    const saltHex =
        parts[0];

    const storedHash =
        parts[1];

    if (
        !/^[0-9a-f]{32}$/i.test(
            saltHex
        ) ||
        !/^[0-9a-f]{64}$/i.test(
            storedHash
        )
    ) {
        return false;
    }

    const result =
        await hashPassword(
            password,
            saltHex
        );

    return (
        result.hash.toLowerCase() ===
        storedHash.toLowerCase()
    );
}
```
