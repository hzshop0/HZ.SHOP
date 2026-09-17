export function safeString(value, maxLength = 1000) {
    if (value === null || value === undefined) {
        return "";
    }

    return String(value)
        .trim()
        .slice(0, maxLength);
}

export function normalizePhone(value) {
    const phone = safeString(value, 30);

    if (!phone) {
        return "";
    }

    return phone.replace(/[^\d+]/g, "");
}
