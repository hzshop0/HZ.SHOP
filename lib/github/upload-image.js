```javascript
export async function uploadImageToGitHub(env, file, safeString) {
    if (!env.GITHUB_TOKEN) {
        throw new Error(
            "GITHUB_TOKEN غير موجود"
        );
    }

    const arrayBuffer =
        await file.arrayBuffer();

    let binary = "";

    const bytes =
        new Uint8Array(arrayBuffer);

    const chunkSize =
        0x8000;

    for (
        let i = 0;
        i < bytes.length;
        i += chunkSize
    ) {
        binary += String.fromCharCode(
            ...bytes.subarray(
                i,
                i + chunkSize
            )
        );
    }

    const base64 =
        btoa(binary);

    const originalName =
        safeString(
            file.name || "image",
            150
        );

    const safeFileName =
        originalName.replace(
            /[^a-zA-Z0-9._-]/g,
            "-"
        );

    const fileName =
        `images/${Date.now()}-${safeFileName}`;

    const response =
        await fetch(
            `https://api.github.com/repos/hzshop0/HZ.SHOP/contents/${fileName}`,
            {
                method: "PUT",

                headers: {
                    "Authorization":
                        `Bearer ${env.GITHUB_TOKEN}`,

                    "Accept":
                        "application/vnd.github+json",

                    "X-GitHub-Api-Version":
                        "2022-11-28",

                    "User-Agent":
                        "HZ-SHOP",

                    "Content-Type":
                        "application/json"
                },

                body:
                    JSON.stringify({
                        message:
                            `Upload product image ${fileName}`,

                        content:
                            base64
                    })
            }
        );

    if (!response.ok) {
        const error =
            await response.text();

        throw new Error(
            error ||
            `GitHub HTTP ${response.status}`
        );
    }

    return (
        `https://raw.githubusercontent.com/hzshop0/HZ.SHOP/main/${fileName}`
    );
}
```
