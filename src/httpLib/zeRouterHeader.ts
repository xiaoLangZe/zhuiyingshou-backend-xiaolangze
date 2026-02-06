import { Method, requestHtml, requestJson } from "./zeRouter"

import { sendEmail } from "./../lib/sendEmail/sendEmail"
import { captchaHtml } from "./html/captchaHtml"

import { getCache, setCache } from "./../lib/cache/cache"
import { randomNum_6digit } from "./../lib/tools"
import { signJWT, verifyJWT } from "./jwt/jwt"

interface CacheValue {
    code: string;
    type: string;
}


// 鉴权
async function authentication(request: Request, env: Env) {
    const authHeader = request.headers.get("Authorization");
    let token = null;
    if (authHeader && authHeader.startsWith("Bearer ")) {
        token = authHeader.substring(7);
    }

    if (token == null) {
        return requestJson(400, "鉴权失败!请先登录!");
    }

    const result = await verifyJWT(token, env.JWT_SECRET);
    if (!result.valid) {
        if (result.errorType === 'expired') {
            return requestJson(401, "token 过期(不是哥们,我都没设过期时间！)");
        } else {
            return requestJson(403, "token 无效,密码变了?");
        }
    }
};

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

    var needSend = true;
    // 用户email
    var userId = String(data.userid)
    var value = await getCache("captcha", userId);
    if (value === null) {
        value = {
            "code": randomNum_6digit(),
            "type": String(data.type),
        }
        ctx.waitUntil(setCache("captcha", userId, value))
    } else {
        needSend = false;
    }

    console.log("userId:", userId);
    console.log("value:", value);


    switch (data.type) {
        case "email":
            try {
                if (needSend) {
                    // await sendEmail([userId], "呐，这个是你的验证码 - " + value, captchaHtml(userId, String(value)),)
                } else {
                    ctx.waitUntil(setCache("captcha", userId, value))
                    return requestJson(201, "请使用上次验证码，将为你的验证码延迟十分钟")
                }
            } catch (e) {
                return requestJson(500, "发送邮件失败")
            }
            return requestJson(200, "发送邮件成功")

        case "phoneNum":
            try {
                // 发送手机验证码
            } catch (e) {
                return requestJson(500, "发送手机验证码失败")
            }
            return requestJson(200, "发送手机验证码成功")

        default:
            return requestJson(400, "发送手机验证码成功")
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
            "SELECT * FROM userMeta WHERE email = ? OR phoneNum = ?"
        )
            .bind(userId, userId)
            .run();
        var redata = result.results[0]
        var userID = redata.userID;
        var passwd = redata.passwd;
        if (passwd == null || passwd == "") {
            // 设密码
            // console.log("用户还没设密码");

            return requestJson(200, "ok", {
                type: "setpwd"
            })
        } else {
            var token = await signJWT({ userID: userID, passwd: passwd }, env.JWT_SECRET)
            // 登录
            delete redata.passwd;
            return requestJson(200, "ok", {
                type: "login",
                token: token,
                userData: redata,
            })
        }
    } else {
        return requestJson(400, "验证码不正确", {})
    }
}

export function setPasswd(request: Request, env: Env, ctx: ExecutionContext): Response {
    return requestHtml(200, request.method + " 200 ok")
}



export async function getUserData(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    // 获取header的token
    const authHeader = request.headers.get("Authorization");
    let token = null;
    if (authHeader && authHeader.startsWith("Bearer ")) {
        token = authHeader.substring(7); // "Bearer ".length === 7
    }
    // 请先登录
    if (token == null) {
        return requestJson(400, "鉴权失败!请先登录!");
    }

    const result = await verifyJWT(token, env.JWT_SECRET);
    if (!result.valid) {
        if (result.errorType === 'expired') {
            return requestJson(401, "token 过期(不是哥们,我都没设过期时间！)");
        } else {
            return requestJson(403, "token 无效,密码变了?");
        }
    }
    interface MyJWTPayload {
        userID: string;
        // 其他字段如 exp, iat, role 等可选
        [key: string]: unknown; // 允许额外字段
    }
    const { userID, passwd } = result.payload as MyJWTPayload;

    const dbResult = await env.DB.prepare(
        "SELECT * FROM userMeta WHERE userID = ?"
    )
        .bind(userID)
        .run();
    var redata = dbResult.results[0]

    return requestJson(200, "success", {
        userID, passwd, redata
    })
}

export function login_(request: Request, env: Env, ctx: ExecutionContext): Response {
    return requestHtml(200, request.method + " 200 ok")
}

export async function test(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    return requestJson(200, env.JWT_SECRET)
}