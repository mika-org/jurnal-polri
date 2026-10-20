import { SignJWT, jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "fallback-secret-at-least-32-characters-long!!"
);

const JWT_REFRESH_SECRET = new TextEncoder().encode(
  process.env.JWT_REFRESH_SECRET || "fallback-refresh-secret-at-least-32-characters!!"
);

export interface JWTPayload {
  sub: string; // user id
  username: string;
  roleId: string;
  roleSlug?: string;
  name?: string;
}

export async function signAccessToken(payload: JWTPayload): Promise<string> {
  return new SignJWT({
    username: payload.username,
    roleId: payload.roleId,
    roleSlug: payload.roleSlug,
    name: payload.name,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime("15m")
    .sign(JWT_SECRET);
}

export async function verifyAccessToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return {
      sub: payload.sub as string,
      username: payload.username as string,
      roleId: payload.roleId as string,
      roleSlug: payload.roleSlug as string | undefined,
      name: payload.name as string | undefined,
    };
  } catch {
    return null;
  }
}

export async function signRefreshToken(userId: string): Promise<string> {
  return new SignJWT({})
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(userId)
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(JWT_REFRESH_SECRET);
}

export async function verifyRefreshToken(token: string): Promise<string | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_REFRESH_SECRET);
    return (payload.sub as string) || null;
  } catch {
    return null;
  }
}
