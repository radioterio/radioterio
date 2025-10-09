import { SignJWT } from "jose";

export async function createToken(userId: number, jwtSecret: Uint8Array) {
  const alg = "HS256";
  return await new SignJWT({ userId })
    .setProtectedHeader({ alg })
    .setExpirationTime("2h")
    .sign(jwtSecret);
}
