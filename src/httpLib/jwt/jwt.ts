// src/lib/jwt.ts
import { SignJWT, jwtVerify, JWTPayload } from 'jose';

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
  expiresIn: string = '15m'
): Promise<string> {
  const key = encoder.encode(secret);
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(key);
}

/**
 * 校验 JWT
 * @returns 解码后的 payload，或 null（无效/过期）
 */
export async function verifyJWT(token: string, secret: string): Promise<JWTPayload | null> {
  try {
    const key = encoder.encode(secret);
    const { payload } = await jwtVerify(token, key);
    return payload;
  } catch (error) {
    console.error("JWT verification failed:", error);
    return null;
  }
}