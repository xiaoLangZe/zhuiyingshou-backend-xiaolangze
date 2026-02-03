import { RequestsZe, Method } from "./lib/httpRequests";

function req400() {
  return new Response("HTTP 400 Bad Request", {
    status: 400,
    headers: { "content-type": "text/plain; charset=utf-8" },
  });
}

function req405() {
  return new Response("HTTP 405 Method Not Allowed", {
    status: 405,
    headers: { "content-type": "text/plain; charset=utf-8" },
  });
}

function utf8ToBase64(str: string) {
  // 先用 encodeURIComponent 转义为 UTF-8 百分号编码
  // 再将 %XX 转为字节，最后用 btoa 编码
  const utf8Bytes = encodeURIComponent(str).replace(
    /%([0-9A-F]{2})/g,
    (match, p1) => String.fromCharCode(parseInt(p1, 16)),
  );
  return btoa(utf8Bytes);
}

function base64ToUtf8(b64: string) {
  // 先用 atob 解码为字节字符串
  // 再转为百分号编码，最后 decodeURIComponent 还原
  const byteString = atob(b64);
  const percentEncoded = byteString
    .split("")
    .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
    .join("");
  return decodeURIComponent(percentEncoded);
}

function randomNum_6digit() {
  const arr = new Uint32Array(1);
  crypto.getRandomValues(arr);
  return String(arr[0] % 1000000).padStart(6, "0");
}

export default {
  async fetch(request, env, ctx) {
    const http = new RequestsZe(request, env);

    http.HandleFunc("/", (request, env) => {
      if (request.method === Method.GET) {
        return new Response("GET", {
          status: 200,
          headers: { "content-type": "text/plain; charset=utf-8" },
        });
      }

      return new Response("POST", {
        status: 200,
        headers: { "content-type": "text/plain; charset=utf-8" },
      });
    });

    http.HandleFunc("/login", async (request, env) => {
      if (request.method !== Method.POST) {
        return req405();
      }

      const formData = await request.formData();
      const data = Object.fromEntries(formData.entries());

      if (data.type === undefined || data.userid === undefined) {
        return req400();
      }

      const useridBase64 = utf8ToBase64(String(data.userid));

	  

      // switch (data.type) {
      //   case "getcode":
      //     var kv_key = useridBase64 + "getcode";
      //     var value = await env.KV.get(kv_key);
      //     if (value === null) {
      //       value = await env.KV.put("KEY", randomNum_6digit(), {
      //         expirationTtl: 600,
      //       });
      //     }
      //     // 验证码
      //     // value;
      //     connect

      //     break;
      //   case "checkcode":
      //     break;
      //   case "pwdlogin":
      //     break;
      // }

      return new Response(JSON.stringify(data), {
        status: 200,
        headers: { "content-type": "text/plain; charset=utf-8" },
      });
    });

    return http.ServeHTTP();
  },
} satisfies ExportedHandler<Env>;
