// src/lib/jwt.ts
import { SignJWT, jwtVerify, JWTPayload, errors } from 'jose';

const encoder = new TextEncoder();

/**
 * 生成 JWT
 * @param payload 用户数据（如 { sub: "user_123" }）
 * @param secret 通过 env.JWT_SECRET 传入
 * @param expiresIn 过期时间（如 "15m", "1h"）
 */
export async function signJWT(
  payload: JWTPayload,
  secret: string,
  expiresIn?: string // 改为可选参数
): Promise<string> {
  const key = encoder.encode(secret);
  const jwt = new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
    .setIssuedAt();

  // 仅当明确提供 expiresIn 时才设置过期时间
  if (expiresIn !== undefined && expiresIn !== null && expiresIn !== '') {
    jwt.setExpirationTime(expiresIn); // jose 会自动校验格式
  }

  return jwt.sign(key);
}

/**
 * 校验 JWT
 * @returns 解码后的 payload，或 null（无效/过期）
 */

export async function verifyJWT(token: string, secret: string): Promise<{
  valid: boolean;
  payload: JWTPayload | null;
  errorType: 'expired' | 'invalid' | null;
}> {
  try {
    const key = encoder.encode(secret);
    const { payload } = await jwtVerify(token, key);
    return {
      valid: true,
      payload,
      errorType: null
    };
  } catch (error) {
    if (error instanceof errors.JWTExpired) {
      return {
        valid: false,
        payload: null,
        errorType: 'expired'
      };
    }
    return {
      valid: false,
      payload: null,
      errorType: 'invalid'
    };
  }
}

// export async function verifyJWT(token: string, secret: string): Promise<JWTPayload | null> {
//   try {
//     const key = encoder.encode(secret);
//     const { payload } = await jwtVerify(token, key);
//     return payload;
//   } catch (error) {
//     console.error("JWT verification failed:", error);
//     return null;
//   }
// }
