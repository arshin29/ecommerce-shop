import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { prisma } from './prisma';

const SECRET_KEY = new TextEncoder().encode(
  process.env.AUTH_SECRET || 'super-secret-ecommerce-demo-key-at-least-32-chars!'
);

const TOKEN_COOKIE_NAME = 'nexa_auth_token';

export interface AuthSession {
  userId: string;
  email: string;
  name: string;
  role: 'CUSTOMER' | 'ADMIN';
}

export async function createSessionToken(payload: AuthSession): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(SECRET_KEY);
}

export async function verifySessionToken(token: string): Promise<AuthSession | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET_KEY);
    return {
      userId: payload.userId as string,
      email: payload.email as string,
      name: payload.name as string,
      role: payload.role as 'CUSTOMER' | 'ADMIN',
    };
  } catch {
    return null;
  }
}

export async function getCurrentUser(): Promise<AuthSession | null> {
  try {
    const cookieStore = await cookies();
    const token =
      cookieStore.get(TOKEN_COOKIE_NAME)?.value ||
      cookieStore.get('aura_auth_token')?.value;

    if (!token) return null;
    const session = await verifySessionToken(token);
    if (!session) return null;

    // Fetch live user from database to ensure fresh name & role
    try {
      const dbUser = await prisma.user.findUnique({
        where: { id: session.userId },
        select: { id: true, email: true, name: true, role: true },
      });

      if (dbUser) {
        return {
          userId: dbUser.id,
          email: dbUser.email,
          name: dbUser.name,
          role: dbUser.role,
        };
      }
    } catch {
      // Fallback to JWT payload if DB temporarily unreachable
    }

    return session;
  } catch {
    return null;
  }
}

export async function requireAdmin(): Promise<AuthSession> {
  const user = await getCurrentUser();
  if (!user || user.role !== 'ADMIN') {
    throw new Error('Unauthorized: Admin access required');
  }
  return user;
}

export async function setAuthCookie(token: string) {
  const cookieStore = await cookies();
  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  };

  cookieStore.set(TOKEN_COOKIE_NAME, token, options);
  // Also sync aura_auth_token for backwards compatibility
  cookieStore.set('aura_auth_token', token, options);
}

export async function removeAuthCookie() {
  const cookieStore = await cookies();
  const clearOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge: 0,
  };

  cookieStore.set(TOKEN_COOKIE_NAME, '', clearOptions);
  cookieStore.set('aura_auth_token', '', clearOptions);
}
