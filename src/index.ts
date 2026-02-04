import { index, login } from "./lib/zeHttp/httpPathApi";


export default {
  async fetch(request, env, ctx) {
    const http = new zeRouter(request, env, ctx);

    http.HandleFunc("/", index);
    http.HandleFunc("/login", login);

    return http.ServeHTTP();
  },
} satisfies ExportedHandler<Env>;
function async(
  request: Request<unknown, CfProperties<unknown>>,
  env: Env,
): Response | Promise<Response> {
  throw new Error("Function not implemented.");
}


export class zeRouter {
  private request: Request;
  private env: Env;
  private ctx: ExecutionContext;
  private pathDict = new Map<string, Function>();

  constructor(request: Request, env: Env, ctx: ExecutionContext) {
    this.request = request;
    this.env = env;
    this.ctx = ctx
  }
  HandleFunc(
    path: string,
    hand: (request: Request, env: Env, ctx: ExecutionContext) => Response | Promise<Response>
  ): void {
    this.pathDict.set(path.replace(/\/+/g, "/").replace(/\/$/, ""), hand);
  }

  async ServeHTTP(): Promise<Response> {
    const { pathname } = new URL(this.request.url);

    const decodedPath = decodeURIComponent(pathname)
      .replace(/\/+/g, "/")
      .replace(/\/$/, "");

    const func = this.pathDict.get(decodedPath);

    if (!func) {
      var redata = {
        code: 404,
        path: decodedPath,
        message: "HTTP 404 Not Found",
        data: {}
      }
      return new Response(JSON.stringify(redata), {
        status: 404,
        // headers: { "content-type": "text/plain; charset=utf-8" },
      });
    }

    return func(this.request, this.env,this.ctx);
  }
}
