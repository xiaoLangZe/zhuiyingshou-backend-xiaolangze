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

type Handler = (r: Request, e: Env) => Response | Promise<Response>;

export class RequestsZe {
  private request: Request;
  private env: Env;
  private pathDict = new Map<string, Function>();

  constructor(request: Request, env: Env) {
    this.request = request;
    this.env = env;
  }
  HandleFunc(path: string, hand: Handler): void {
    this.pathDict.set(path.replace(/\/+/g, "/").replace(/\/$/, ""), hand);
  }

  async ServeHTTP(): Promise<Response> {
    const { pathname } = new URL(this.request.url);

    const decodedPath = decodeURIComponent(pathname)
      .replace(/\/+/g, "/")
      .replace(/\/$/, "");

    const func = this.pathDict.get(decodedPath);
    if (!func) {
      return new Response("404:" + decodedPath, {
        status: 404,
        headers: { "content-type": "text/plain; charset=utf-8" },
      });
    }

    return func(this.request, this.env);
  }
}
