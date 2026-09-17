export async function uploadImageToGitHub(env, file, path) {
    if (!env.GITHUB_TOKEN) {
        throw new Error("GitHub token is not configured");
    }

    const owner = "hzshop0";
    const repo = "HZ.SHOP";
    const branch = env.GITHUB_BRANCH || "hz.shop1";

    const arrayBuffer = await file.arrayBuffer();

    let binary = "";
    const bytes = new Uint8Array(arrayBuffer);

    const chunkSize = 0x8000;

    for (let i = 0; i < bytes.length; i += chunkSize) {
        binary += String.fromCharCode(
            ...bytes.subarray(i, i + chunkSize)
        );
    }

    const content = btoa(binary);

    const apiUrl =
        `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;

    const response = await fetch(apiUrl, {
        method: "PUT",
        headers: {
            "Authorization": `Bearer ${env.GITHUB_TOKEN}`,
            "Accept": "application/vnd.github+json",
            "Content-Type": "application/json",
            "User-Agent": "HZ.SHOP"
        },
        body: JSON.stringify({
            message: `Upload ${path}`,
            content,
            branch
        })
    });

    const result = await response.json();

    if (!response.ok) {
        throw new Error(
            result?.message || "GitHub image upload failed"
        );
    }

    return {
        path,
        url: result?.content?.download_url || null,
        sha: result?.content?.sha || null
    };
}
