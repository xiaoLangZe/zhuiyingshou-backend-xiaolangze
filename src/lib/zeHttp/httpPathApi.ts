import { requestZe, method, ReData } from "./httpRequests";
import { setCache, getCache } from "./cache"
import { randomNum_6digit } from "./../tools"

export function index(request: Request, env: Env, ctx: ExecutionContext): Response {
    const redata: ReData = {
        code: 200,
        message: "",
        data: {}
    }
    return requestZe(redata);
}

export async function login(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    var redata: ReData = {
        code: 200,
        message: "",
        data: {}
    }
    if (request.method != method.POST) {
        redata.code = 405
        return requestZe(redata);
    }

    const data = Object.fromEntries((await request.formData()).entries());
    if (data.type === undefined || data.userid === undefined) {
        redata.code = 400
        redata.message = "传入参数错误: " + (data.type === undefined ? "类型" : "用户名") + "为空"
        return requestZe(redata);
    }

    var cache_key = String(data.userid)
    switch (data.type) {
        case "getcode":
            var value = await getCache(cache_key);
            if (value === null) {
                value = randomNum_6digit();
                ctx.waitUntil(setCache(cache_key, value));
            }
            redata.message = "获取验证码成功";
            redata.data = {
                captchaCode: value
            }
            return requestZe(redata);

        case "checkcode":
            var value = await getCache(cache_key);
            console.log(data.code );
            
            if (value === null || data.code === undefined) {
                redata.code = 400;
                redata.message = value === null ?"验证码已失效或不存在":"传入参数错误: code";
                return requestZe(redata);
            }

            if (value === data.code) {
                redata.message = "验证码正确";
                redata.data = {
                    captchaCode: value
                }
            } else {
                redata.code = 400
                redata.message = "验证码错误";
                redata.data = {
                    captchaCode: value
                }
            }
            return requestZe(redata);
        case "pwdlogin":
            // 密码加密方式 md5_32("xiaolangze["+密码+"]")
            break;
    }



    return requestZe(redata);
}

// export async function aaaa(request: Request, env: Env) {
//     if (request.method !== Method.POST) {
//         return RequestZe(405);
//       }

//       const formData = await request.formData();
//       const data = Object.fromEntries(formData.entries());

//       if (data.type === undefined || data.userid === undefined) {
//         return RequestZe(400, "传入参数错误", ReqStruct.text);
//       }

//       const useridBase64 = utf8ToBase64(String(data.userid));

//       switch (data.type) {
//         case "getcode":
//           var kv_key = useridBase64 + "getcode";
//           var value = await env.KV_CaptchaCode.get(kv_key);

//           if (value === null) {
//             value = randomNum_6digit();
//             await env.KV_CaptchaCode.put(kv_key, value, {
//               expirationTtl: 600,
//             });
//           }

//           return new Response(value, {
//             status: 200,
//             headers: { "content-type": "text/plain; charset=utf-8" },
//           });

//         case "checkcode":
//           var kv_key = useridBase64 + "getcode";
//           var value = await env.KV_CaptchaCode.get(kv_key);

//           if (value === null) {
//             return RequestZe(400, "验证码不存在或已过期", ReqStruct.text);
//           }

//           if (data.code === value) {
//             env.KV_CaptchaCode.delete(kv_key);
//             return RequestZe(200, "ok", ReqStruct.text);
//           } else {
//             return RequestZe(400, "验证码错误", ReqStruct.text);
//           }
//         case "pwdlogin":
//           break;
//       }

//       return RequestZe(200, "test", ReqStruct.text);
// }
