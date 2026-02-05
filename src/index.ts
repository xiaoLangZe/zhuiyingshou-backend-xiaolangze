// import { index, login } from "./lib/zeHttp/httpPathApi";
import { zeRouter } from "./httpLib/zeRouter"
import { index, login_sendCaptcha, login_checkCaptcha } from "./httpLib/zeRouterHeader"

const http = new zeRouter();
http.HandleFunc("/", index);
http.HandleFunc("/login_sendCaptcha", login_sendCaptcha);
http.HandleFunc("/login_checkCaptcha", login_checkCaptcha);

export default {
  async fetch(request, env, ctx) {
        // const jwtSecret = env.JWT_SECRET;
        // console.log(jwtSecret);
        
    return http.ServeHTTP(request, env, ctx);
  },
} satisfies ExportedHandler<Env>;
