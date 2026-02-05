import { Method, requestHtml, requestJson } from "./zeRouter"
import { sendEmail } from "./../lib/sendEmail/sendEmail"
import { getCache, setCache } from "./../lib/cache/cache"
import { captchaHtml } from "./html/captchaHtml"
import { randomNum_6digit } from "./../lib/tools"

interface CacheValue {
    code: string;
    type: string; // 或根据 data.type 的实际类型调整
}


// 主页 
export function index(request: Request, env: Env, ctx: ExecutionContext): Response {
    return requestHtml(200, request.method + " 200 ok")
}

// 登录-发送验证码
export async function login_sendCaptcha(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    if (request.method !== Method.POST) {
        return requestHtml(405, "HTTP 405 Method Not Allowed")
    }

    const data = Object.fromEntries((await request.formData()).entries());
    // 判断数据
    if (data.type === undefined || data.userid === undefined) {
        var message = "传入参数错误: " + (data.type === undefined ? "类型" : "用户名")
        return requestJson(400, message)
    }
    // 用户email
    var userId = String(data.userid)

    console.log("userId:", userId);
    var value = await getCache("captcha", userId);
    if (value === null) {
        value = {
            "code": randomNum_6digit(),
            "type": String(data.type),
        }
        ctx.waitUntil(setCache("captcha", userId, value))

    }

    console.log("value:", value);

    if (data.type === "email") {
        try {
            // await sendEmail([userId], "呐，这个是你的验证码 - " + value, captchaHtml(userId, String(value)),)
        } catch (e) {
            return requestJson(500, "发送邮件失败", {})
        }

        return requestJson(200, "发送邮件成功")
    } else {
        return requestJson(200, "不是邮件")
    }
}

// 登录-验证验证码
export async function login_checkCaptcha(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    if (request.method !== Method.POST) {
        return requestHtml(405, "HTTP 405 Method Not Allowed")
    }

    const data = Object.fromEntries((await request.formData()).entries());
    // 判断数据
    if (data.code === undefined || data.userid === undefined) {
        var message = "传入参数错误: " + (data.type === undefined ? "类型" : "用户名")
        return requestJson(400, message)
    }

    var userId = String(data.userid)
    console.log("userId:", userId);
    var value = await getCache("captcha", userId);;

    console.log("value:", value);
    if (value === null) {
        return requestJson(400, "验证码不存在或已失效", {})
    }
    if (String(value.code) === data.code) {
        const result = await env.DB.prepare(
            "SELECT userId,passwd FROM userMeta WHERE email = ? OR phoneNum = ?"
        )
            .bind(userId, userId)
            .run();
        var redata = result.results[0]
        var userID = redata.userID;
        var passwd = redata.passwd;
        if (passwd == null) {
            // 设密码
            return requestJson(200, "ok", {
                type: "setpwd"
            })
        } else {
            "xiaolangze|" + userID + "|" + passwd
            // 登录
            return requestJson(200, "ok", {
                type: "login",
                token: "",
            })
        }

    } else {
        return requestJson(400, "验证码不正确", {})
    }
}

export function login_(request: Request, env: Env, ctx: ExecutionContext): Response {
    return requestHtml(200, request.method + " 200 ok")
}

export async function test(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    return requestJson(200, env.JWT_SECRET)
}