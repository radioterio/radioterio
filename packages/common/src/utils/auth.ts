import { SignJWT } from "jose";

export async function createToken(userId: number, jwtSecret: Uint8Array, expirationTime = "2h") {
  const alg = "HS256";
  return await new SignJWT({ userId })
    .setProtectedHeader({ alg })
    .setExpirationTime(expirationTime)
    .sign(jwtSecret);
}
