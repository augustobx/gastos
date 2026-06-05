import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import "server-only";

const secretKey = process.env.SESSION_SECRET || "default_super_secret_key_change_me_in_prod";
const encodedKey = new TextEncoder().encode(secretKey);

type SessionPayload = {
  userId: string;
  username: string;
  name: string | null;
  expiresAt: Date;
};

export async function createSession(userId: string, username: string, name: string | null) {
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  const session = await new SignJWT({ userId, username, name, expiresAt })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(encodedKey);

  const cookieStore = await cookies();
  cookieStore.set("session", session, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    expires: expiresAt,
    sameSite: "lax",
    path: "/",
  });
}

export async function verifySession() {
  const cookieStore = await cookies();
  const cookie = cookieStore.get("session")?.value;
  if (!cookie) return null;

  try {
    const { payload } = await jwtVerify(cookie, encodedKey, {
      algorithms: ["HS256"],
    });
    return payload as SessionPayload;
  } catch (error) {
    return null;
  }
}

export async function deleteSession() {
  const cookieStore = await cookies();
  cookieStore.delete("session");
}
