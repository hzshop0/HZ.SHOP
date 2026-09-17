const PBKDF2_ITERATIONS = 100000;
const HASH_ALGORITHM = "SHA-256";
const KEY_LENGTH = 256;

function toBase64(bytes) {
    let binary = "";

    const chunkSize = 0x8000;

    for (let i = 0; i < bytes.length; i += chunkSize) {
        binary += String.fromCharCode(
            ...bytes.subarray(i, i + chunkSize)
        );
    }

    return btoa(binary);
}

function fromBase64(value) {
    const binary = atob(value);

    const bytes = new Uint8Array(binary.length);

    for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
    }

    return bytes;
}

function constantTimeEqual(a, b) {
    if (a.length !== b.length) {
        return false;
    }

    let result = 0;

    for (let i = 0; i < a.length; i++) {
        result |= a[i] ^ b[i];
    }

    return result === 0;
}

export async function hashPassword(password) {
    const salt = crypto.getRandomValues(new Uint8Array(16));

    const keyMaterial = await crypto.subtle.importKey(
        "raw",
        new TextEncoder().encode(password),
        "PBKDF2",
        false,
        ["deriveBits"]
    );

    const derivedBits = await crypto.subtle.deriveBits(
        {
            name: "PBKDF2",
            salt,
            iterations: PBKDF2_ITERATIONS,
            hash: HASH_ALGORITHM
        },
        keyMaterial,
        KEY_LENGTH
    );

    const hash = new Uint8Array(derivedBits);

    return [
        "pbkdf2",
        HASH_ALGORITHM,
        PBKDF2_ITERATIONS,
        toBase64(salt),
        toBase64(hash)
    ].join("$");
}

export async function verifyPassword(password, storedHash) {
    if (!password || !storedHash) {
        return false;
    }

    const parts = String(storedHash).split("$");

    if (parts.length !== 5) {
        return false;
    }

    const [
        algorithm,
        hashAlgorithm,
        iterationsValue,
        saltValue,
        hashValue
    ] = parts;

    if (
        algorithm !== "pbkdf2" ||
        hashAlgorithm !== HASH_ALGORITHM
    ) {
        return false;
    }

    const iterations = Number(iterationsValue);

    if (
        !Number.isInteger(iterations) ||
        iterations <= 0
    ) {
        return false;
    }

    try {
        const salt = fromBase64(saltValue);
        const expectedHash = fromBase64(hashValue);

        const keyMaterial = await crypto.subtle.importKey(
            "raw",
            new TextEncoder().encode(password),
            "PBKDF2",
            false,
            ["deriveBits"]
        );

        const derivedBits = await crypto.subtle.deriveBits(
            {
                name: "PBKDF2",
                salt,
                iterations,
                hash: HASH_ALGORITHM
            },
            keyMaterial,
            expectedHash.length * 8
        );

        const actualHash = new Uint8Array(derivedBits);

        return constantTimeEqual(actualHash, expectedHash);
    } catch {
        return false;
    }
}
