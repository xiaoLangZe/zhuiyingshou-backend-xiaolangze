export async function setCache(database: string, key: string, value: any) {
    const url = `https://${database}/` + encodeURIComponent(key);
    const response = new Response(JSON.stringify(value), {
        headers: { 'Cache-Control': 'max-age=300' } // 300秒 = 5分钟
    });
    await caches.default.put(new Request(url), response);
}

export async function getCache(database: string, key: string): Promise<Object | null> {
    const url = `https://${database}/` + encodeURIComponent(key);
    const request = new Request(url);
    const response = await caches.default.match(request);
    return response ? await response.json() : null;
}