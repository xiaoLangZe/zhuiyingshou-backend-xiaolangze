// import { index, login } from "./lib/zeHttp/httpPathApi";
import { zeRouter } from "./httpLib/zeRouter"
import { index, login_sendCaptcha } from "./httpLib/zeRouterHeader"



export default {
  async fetch(request, env, ctx) {
    const http = new zeRouter();
    http.HandleFunc("/", index);
    http.HandleFunc("/login_sendCaptcha", login_sendCaptcha);

    return http.ServeHTTP(request, env, ctx);
  },
} satisfies ExportedHandler<Env>;
