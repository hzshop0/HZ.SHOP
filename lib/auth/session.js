import {
    CUSTOMER_SESSION_MAX_AGE,
    ADMIN_SESSION_MAX_AGE
} from "../config/constants.js";

const CUSTOMER_COOKIE_NAME = "hz_customer";
const ADMIN_COOKIE_NAME = "hz_admin";

function base64UrlEncode(value) {
    const bytes = new TextEncoder().encode(value);

    let binary = "";

    for (const byte of bytes) {
        binary += String.fromCharCode(byte);
    }

    return btoa(binary)
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/g, "");
}

function base64UrlDecode(value) {
    const normalized = value
        .replace(/-/g, "+")
        .replace(/_/g, "/");

    const padding =
        normalized.length % 4 === 0
            ? ""
            : "=".repeat(4 - (normalized.length % 4));

    const binary = atob(normalized + padding);

    const bytes = new Uint8Array(binary.length);

    for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
    }

    return new TextDecoder().decode(bytes);
}

async function createSignature(payload, secret) {
    const key = await crypto.subtle.importKey(
        "raw",
        new TextEncoder().encode(secret),
        {
            name: "HMAC",
            hash: "SHA-256"
        },
        false,
        ["sign"]
    );

    const signature = await crypto.subtle.sign(
        "HMAC",
        key,
        new TextEncoder().encode(payload)
    );

    return base64UrlEncode(
        String.fromCharCode(...new Uint8Array(signature))
    );
}

async function verifySignature(payload, signature, secret) {
    const expected = await createSignature(payload, secret);

    if (expected.length !== signature.length) {
        return false;
    }

    let result = 0;

    for (let i = 0; i < expected.length; i++) {
        result |= expected.charCodeAt(i) ^ signature.charCodeAt(i);
    }

    return result === 0;
}

function getCookie(request, name) {
    const cookieHeader = request.headers.get("Cookie");

    if (!cookieHeader) {
        return null;
    }

    const cookies = cookieHeader.split(";");

    for (const cookie of cookies) {
        const [key, ...parts] = cookie.trim().split("=");

        if (key === name) {
            return parts.join("=") || null;
        }
    }

    return null;
}

function createCookie(name, value, maxAge) {
    return [
        `${name}=${value}`,
        "Path=/",
        "HttpOnly",
        "Secure",
        "SameSite=Lax",
        `Max-Age=${Math.floor(maxAge / 1000)}`
    ].join("; ");
}

function createExpiredCookie(name) {
    return [
        `${name}=`,
        "Path=/",
        "HttpOnly",
        "Secure",
        "SameSite=Lax",
        "Max-Age=0"
    ].join("; ");
}

async function createSession(payload, secret, maxAge) {
    const data = {
        ...payload,
        iat: Date.now(),
        exp: Date.now() + maxAge
    };

    const encodedPayload = base64UrlEncode(
        JSON.stringify(data)
    );

    const signature = await createSignature(
        encodedPayload,
        secret
    );

    return `${encodedPayload}.${signature}`;
}

async function readSession(token, secret) {
    if (!token || !secret) {
        return null;
    }

    const parts = token.split(".");

    if (parts.length !== 2) {
        return null;
    }

    const [payload, signature] = parts;

    try {
        const valid = await verifySignature(
            payload,
            signature,
            secret
        );

        if (!valid) {
            return null;
        }

        const data = JSON.parse(
            base64UrlDecode(payload)
        );

        if (
            !data ||
            !Number.isFinite(data.exp) ||
            Date.now() >= data.exp
        ) {
            return null;
        }

        return data;
    } catch {
        return null;
    }
}

export async function createCustomerSession(
    customerId,
    secret
) {
    return createSession(
        {
            customerId
        },
        secret,
        CUSTOMER_SESSION_MAX_AGE
    );
}

export async function getCustomerSession(
    request,
    secret
) {
    const token = getCookie(
        request,
        CUSTOMER_COOKIE_NAME
    );

    return readSession(token, secret);
}

export async function createAdminSession(secret) {
    return createSession(
        {
            admin: true
        },
        secret,
        ADMIN_SESSION_MAX_AGE
    );
}

export async function getAdminSession(request, secret) {
    const token = getCookie(
        request,
        ADMIN_COOKIE_NAME
    );

    return readSession(token, secret);
}

export function setCustomerSessionCookie(token) {
    return createCookie(
        CUSTOMER_COOKIE_NAME,
        token,
        CUSTOMER_SESSION_MAX_AGE
    );
}

export function clearCustomerSessionCookie() {
    return createExpiredCookie(
        CUSTOMER_COOKIE_NAME
    );
}

export function setAdminSessionCookie(token) {
    return createCookie(
        ADMIN_COOKIE_NAME,
        token,
        ADMIN_SESSION_MAX_AGE
    );
}

export function clearAdminSessionCookie() {
    return createExpiredCookie(
        ADMIN_COOKIE_NAME
    );
}
