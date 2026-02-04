

export enum method {
  GET = "GET",
  POST = "POST",
  HEAD = "HEAD",
  PUT = "PUT",
  DELETE = "DELETE",
  OPTIONS = "OPTIONS",
  TRACE = "TRACE",
  CONNECT = "CONNECT",
}

// export enum reqType {
//   html,
//   text,
//   json,
//   xml,
// }

export interface ReData {
  code: number
  message: string
  data: Object
}

export class RequestsZe {
  private request: Request;
  private env: Env;
  private pathDict = new Map<string, Function>();

  constructor(request: Request, env: Env) {
    this.request = request;
    this.env = env;
  }
  HandleFunc(
    path: string,
    hand: (request: Request, env: Env) => Response | Promise<Response>,
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
      var redata: ReData = {
        code: 404,
        message: "HTTP 404 Not Found :" + decodedPath,
        data: {}
      }
      return requestZe(redata);
    }

    return func(this.request, this.env);
  }
}

export function requestZe(redata: ReData) {
  // var contentType = "";
  // switch (reqtype) {
  //   case reqType.html:
  //     contentType = "text/html; charset=utf-8";
  //   case reqType.text:
  //     contentType = "text/plain; charset=utf-8";
  //   case reqType.json:
  //     contentType = "application/json; charset=utf-8";
  //   case reqType.xml:
  //     contentType = "application/xml; charset=utf-8";
  // }

  if (redata.message === "") {
    switch (redata.code) {
      case 405:
        redata.message = "HTTP 405 Method Not Allowed";
    }
  }

  return new Response(JSON.stringify(redata), {
    status: redata.code,
    // headers: { "content-type": contentType },
  });
}
