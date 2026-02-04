import { Method, requestHtml, requestJson } from "./zeRouter"
import { sendEmail } from "./../lib/sendEmail/sendEmail"
import { getCache, setCache } from "./../lib/cache/cache"
import { captchaHtml } from "./html/captchaHtml"
import { randomNum_6digit } from "./../lib/tools"
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

    if (data.type === "email") {
        var value = await getCache(userId);
        if (value === null) {
            value = randomNum_6digit()
            ctx.waitUntil(setCache(userId, value))
        }
        console.log("value:", value);

        // 发送邮件 目前cpu时间不够 
        // try {
        //     await sendEmail([userId], "呐，这个是你的验证码 - " + value, captchaHtml(userId, String(value)),)
        // } catch (e) {
        //     return requestJson(500, "发送邮件失败", {})
        // }

        return requestJson(200, "发送邮件成功", { code: value })
    } else {
        return requestJson(200, "不是邮件", { code: value })
    }
}

export function login_(request: Request, env: Env, ctx: ExecutionContext): Response {
    return requestHtml(200, request.method + " 200 ok")
}