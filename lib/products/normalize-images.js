```javascript
import { MAX_IMAGES } from "../config/constants.js";

export function normalizeImages(value) {
    if (
        value === null ||
        value === undefined ||
        value === ""
    ) {
        return [];
    }

    function normalizeArray(array) {
        return array
            .map(image => {
                if (typeof image === "string") {
                    return image
                        .trim()
                        .slice(0, 2000);
                }

                if (
                    image &&
                    typeof image === "object"
                ) {
                    return String(
                        image.url ||
                        image.image ||
                        image.src ||
                        image.path ||
                        ""
                    )
                        .trim()
                        .slice(0, 2000);
                }

                return "";
            })
            .filter(Boolean)
            .slice(0, MAX_IMAGES);
    }

    if (Array.isArray(value)) {
        return normalizeArray(value);
    }

    if (typeof value === "string") {
        const trimmed = value.trim();

        if (!trimmed) {
            return [];
        }

        try {
            const parsed = JSON.parse(trimmed);

            if (Array.isArray(parsed)) {
                return normalizeArray(parsed);
            }
        } catch {
            /* صورة واحدة */
        }

        return [
            trimmed.slice(0, 2000)
        ];
    }

    return [];
}
```
