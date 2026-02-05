
import { SignJWT, jwtVerify } from 'jose';

// 生成
const token = await new SignJWT({ sub: 'user123' })
  .setProtectedHeader({ alg: 'HS256',typ:"JWT" })
  .setIssuedAt()
  .setExpirationTime('1h')
  .sign(new TextEncoder().encode(env.JWT_SECRET));

// 验证
const { payload } = await jwtVerify(token, new TextEncoder().encode(env.JWT_SECRET));