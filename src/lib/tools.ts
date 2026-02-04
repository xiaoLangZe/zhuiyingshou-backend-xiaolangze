
export function utf8ToBase64(str: string) {
    // 先用 encodeURIComponent 转义为 UTF-8 百分号编码
    // 再将 %XX 转为字节，最后用 btoa 编码
    const utf8Bytes = encodeURIComponent(str).replace(
        /%([0-9A-F]{2})/g,
        (match, p1) => String.fromCharCode(parseInt(p1, 16)),
    );
    return btoa(utf8Bytes);
}

export function base64ToUtf8(b64: string) {
    // 先用 atob 解码为字节字符串
    // 再转为百分号编码，最后 decodeURIComponent 还原
    const byteString = atob(b64);
    const percentEncoded = byteString
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("");
    return decodeURIComponent(percentEncoded);
}

export function randomNum_6digit() {
    const arr = new Uint32Array(1);
    crypto.getRandomValues(arr);
    return String(arr[0] % 1000000).padStart(6, "0");
}