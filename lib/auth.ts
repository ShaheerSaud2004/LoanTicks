// Run first so AUTH_SECRET is set from NEXTAUTH_SECRET before we read env
import '@/lib/ensureAuthEnv';
import NextAuth, { DefaultSession } from 'next-auth';
import { CredentialsSignin } from '@auth/core/errors';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import GitHubProvider from 'next-auth/providers/github';
import { isCustomerAutoApproveEnabled } from '@/lib/customerAutoApprove';

export type UserRole = 'admin' | 'employee' | 'customer';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      role: UserRole;
      email: string;
      name: string;
      /** Mirrors MongoDB; refreshed from DB on each session read. */
      isApproved: boolean;
    } & DefaultSession['user'];
  }

  interface User {
    role: UserRole;
    isApproved?: boolean;
  }
}

declare module 'next-auth' {
  interface JWT {
    role: UserRole;
    id: string;
  }
}

// Read secret after ensureAuthEnv (warnings only; actual secret is read per-request in NextAuth() below).
if (process.env.NODE_ENV === 'production') {
  const s = (process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET)?.trim();
  if (!process.env.NEXTAUTH_URL) {
    console.warn('⚠️  NEXTAUTH_URL should be set to your production URL (e.g. https://www.loanaticks.com).');
  }
  if (!s || s.length < 32) {
    console.warn(
      '⚠️  AUTH_SECRET or NEXTAUTH_SECRET must be set in production (32+ chars). ' +
      'Set in Vercel → Settings → Environment Variables for Production, then redeploy. ' +
      'See https://next-auth.js.org/configuration/pages#errors (NO_SECRET).'
    );
  }
}

/** Absolute or site-relative URL for custom auth error messages (OAuth denials). */
function authErrorUrl(errorCode: string): string {
  const base = (process.env.AUTH_URL || process.env.NEXTAUTH_URL || '').replace(/\/$/, '');
  const qs = new URLSearchParams({ error: errorCode }).toString();
  return base ? `${base}/auth/error?${qs}` : `/auth/error?${qs}`;
}

async function authorizeOAuthUser(
  oauthProvider: 'google' | 'github',
  user: { email?: string | null; name?: string | null },
  providerAccountId: string
): Promise<true | string> {
  if (!user.email) {
    return authErrorUrl('OAuthEmailRequired');
  }

  try {
    const connectDB = (await import('@/lib/mongodb')).default;
    const User = (await import('@/models/User')).default;

    await connectDB();

    const emailLower = user.email.toLowerCase();
    let dbUser = await User.findOne({
      $or: [{ email: emailLower }, { providerId: providerAccountId }],
    });

    if (!dbUser) {
      const displayName =
        (typeof user.name === 'string' && user.name.trim()) ||
        emailLower.split('@')[0] ||
        'Customer';
      const doc = new User({
        name: displayName,
        email: emailLower,
        role: 'customer',
        provider: oauthProvider,
        providerId: providerAccountId,
        isApproved: isCustomerAutoApproveEnabled(),
      });
      try {
        await doc.save();
        return true;
      } catch (err: unknown) {
        const dup =
          typeof err === 'object' &&
          err !== null &&
          'code' in err &&
          (err as { code: number }).code === 11000;
        if (dup) {
          dbUser = await User.findOne({
            $or: [{ email: emailLower }, { providerId: providerAccountId }],
          });
          if (!dbUser) {
            return authErrorUrl('OAuthDatabaseError');
          }
        } else {
          console.error(`${oauthProvider} OAuth create user:`, err);
          return authErrorUrl('OAuthDatabaseError');
        }
      }
    }

    if (dbUser) {
      dbUser.provider = oauthProvider;
      dbUser.providerId = providerAccountId;
      if (!dbUser.name?.trim() && user.name?.trim()) {
        dbUser.name = user.name.trim();
      }
      await dbUser.save();
    }

    return true;
  } catch (error) {
    console.error(`${oauthProvider} OAuth error:`, error);
    return authErrorUrl('OAuthDatabaseError');
  }
}

/**
 * Lazy config: read OAuth env vars on each request so Vercel runtime secrets are visible.
 * If we read GOOGLE_* only at module load, `next build` often has no secrets and Google is omitted from the bundle.
 */
export const { handlers, signIn, signOut, auth } = NextAuth(() => {
  const googleClientId = process.env.GOOGLE_CLIENT_ID?.trim();
  const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET?.trim();
  const githubClientId = (
    process.env.AUTH_GITHUB_ID ||
    process.env.GITHUB_ID ||
    ''
  ).trim();
  const githubClientSecret = (
    process.env.AUTH_GITHUB_SECRET ||
    process.env.GITHUB_SECRET ||
    ''
  ).trim();
  const authSecret = (process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET)?.trim() || undefined;

  return {
  secret: authSecret,
  providers: [
    ...(googleClientId && googleClientSecret
      ? [
          GoogleProvider({
            clientId: googleClientId,
            clientSecret: googleClientSecret,
            allowDangerousEmailAccountLinking: true,
          }),
        ]
      : []),
    ...(githubClientId && githubClientSecret
      ? [
          GitHubProvider({
            clientId: githubClientId,
            clientSecret: githubClientSecret,
            allowDangerousEmailAccountLinking: true,
          }),
        ]
      : []),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new CredentialsSignin();
        }

        try {
          // Dynamic imports to avoid loading in Edge Runtime
          const connectDB = (await import('@/lib/mongodb')).default;
          const User = (await import('@/models/User')).default;

          await connectDB();
          // Removed sensitive logging - only log in development
          if (process.env.NODE_ENV === 'development') {
            console.log('Database connected, searching for user...');
          }

          // Normalize email to lowercase for lookup (User model stores emails in lowercase)
          const normalizedEmail = (credentials.email as string).toLowerCase().trim();
          
          const user = await User.findOne({ email: normalizedEmail });
          
          // Only log in development, never log user details in production
          if (process.env.NODE_ENV === 'development') {
            console.log('User lookup result:', user ? 'Found' : 'NOT FOUND');
          }

          if (!user) {
            // Never log user emails or expose user data in logs
            if (process.env.NODE_ENV === 'development') {
              console.error('User not found');
            }
            throw new CredentialsSignin();
          }

          const isPasswordValid = await user.comparePassword(
            credentials.password as string
          );

          if (!isPasswordValid) {
            // Never log authentication failures with user details
            if (process.env.NODE_ENV === 'development') {
              console.error('Invalid password');
            }
            throw new CredentialsSignin();
          }

          // Pending approval: still sign in; staff dashboards gate on isApproved.
          if (process.env.NODE_ENV === 'development') {
            console.log('✓ Login successful');
          }

          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            role: user.role,
            isApproved: user.isApproved,
          };
        } catch (error) {
          if (error instanceof CredentialsSignin) {
            throw error;
          }
          console.error('Authorization error:', error);
          throw new CredentialsSignin();
        }
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      const provider = account?.provider;
      if (provider === 'google' || provider === 'github') {
        const providerAccountId = account?.providerAccountId;
        if (!providerAccountId) {
          return authErrorUrl('OAuthConfiguration');
        }
        return authorizeOAuthUser(provider, user, providerAccountId);
      }
      return true;
    },
    async jwt({ token, user, account }) {
      if (user) {
        token.role = user.role;
        token.id = user.id;
      }

      if (
        (account?.provider === 'google' || account?.provider === 'github') &&
        user?.email
      ) {
        try {
          const connectDB = (await import('@/lib/mongodb')).default;
          const User = (await import('@/models/User')).default;
          await connectDB();
          const dbUser = await User.findOne({ email: user.email.toLowerCase() });
          if (dbUser) {
            token.role = dbUser.role;
            token.id = dbUser._id.toString();
          }
        } catch (error) {
          console.error('Error fetching user in JWT callback:', error);
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (!session.user || !token.id) {
        return session;
      }

      try {
        const connectDB = (await import('@/lib/mongodb')).default;
        const User = (await import('@/models/User')).default;
        await connectDB();
        const dbUser = await User.findById(token.id).select('role isApproved name email').lean();
        if (dbUser) {
          session.user.id = String(dbUser._id);
          session.user.role = dbUser.role as UserRole;
          session.user.email = dbUser.email;
          session.user.name = dbUser.name;
          session.user.isApproved = Boolean(dbUser.isApproved);
        } else {
          session.user.role = token.role as UserRole;
          session.user.id = token.id as string;
          session.user.isApproved = false;
        }
      } catch (error) {
        console.error('Session hydrate error:', error);
        session.user.role = token.role as UserRole;
        session.user.id = token.id as string;
        session.user.isApproved = false;
      }

      return session;
    },
  },
  pages: {
    signIn: '/login',
    error: '/auth/error',
  },
  session: {
    strategy: 'jwt',
  },
  trustHost: true,
  debug: process.env.NODE_ENV === 'development',
  };
});


