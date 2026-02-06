export enum Method {
    GET = "GET",
    POST = "POST",
    HEAD = "HEAD",
    PUT = "PUT",
    DELETE = "DELETE",
    OPTIONS = "OPTIONS",
    TRACE = "TRACE",
    CONNECT = "CONNECT",
}

export interface ReqData {
    code: number
    msg: string
    data: Record<string, unknown> | null
}

export class zeRouter {
    private pathDict = new Map<string, Function>();
    method: typeof Method;

    constructor() {
        this.method = Method;
    }

    HandleFunc(
        path: string,
        hand: (request: Request, env: Env, ctx: ExecutionContext) => Response | Promise<Response>
    ): void {
        this.pathDict.set(path.replace(/\/+/g, "/").replace(/\/$/, ""), hand);
    }

    async ServeHTTP(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
        const { pathname } = new URL(request.url);
        const decodedPath = decodeURIComponent(pathname)
            .replace(/\/+/g, "/")
            .replace(/\/$/, "");

        const func = this.pathDict.get(decodedPath);
        if (!func) {
            return requestJson(404, "HTTP 404 Not Found: " + decodedPath)
            // requestHtml(404, "HTTP 404 Not Found: " + decodedPath)
        }
        return func(request, env, ctx);
    }
}

export function requestJson(code: number, msg: string = "", data: Record<string, unknown> | null = null) {
    var reqData: ReqData = { code, msg, data }
    return new Response(JSON.stringify(reqData), {
        status: code,
        headers: { 'Content-Type': 'application/json; charset=utf-8' }
    });
}

export function requestHtml(code: number, message: string = "") {
    return new Response(message, {
        status: code,
        headers: { 'Content-Type': 'text/html; charset=utf-8' }
    });
}