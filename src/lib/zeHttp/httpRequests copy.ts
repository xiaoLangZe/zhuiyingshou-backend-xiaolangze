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

export enum reqType {
  html,
  text,
  json,
  xml,
}

export interface ApiResponse {
  code: number; // 状态码是数字类型（200、400、500 等）
  msg: string; // 提示信息是字符串类型
  data: Object; // 嵌套使用上面定义的 ResponseData 接口
}


