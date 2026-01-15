import NextAuth, { DefaultSession } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

export type UserRole = 'admin' | 'employee' | 'customer';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      role: UserRole;
      email: string;
      name: string;
    } & DefaultSession['user'];
  }

  interface User {
    role: UserRole;
  }
}

declare module 'next-auth' {
  interface JWT {
    role: UserRole;
    id: string;
  }
}

// Get NEXTAUTH_SECRET with fallback
const nextAuthSecret = process.env.NEXTAUTH_SECRET;

if (!nextAuthSecret) {
  console.warn('⚠️  WARNING: NEXTAUTH_SECRET is not set in environment variables');
  console.warn('   Authentication may not work correctly. Please set NEXTAUTH_SECRET in .env.local');
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Please enter your email and password');
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
            throw new Error('Invalid email or password');
          }

          const isPasswordValid = await user.comparePassword(
            credentials.password as string
          );

          if (!isPasswordValid) {
            // Never log authentication failures with user details
            if (process.env.NODE_ENV === 'development') {
              console.error('Invalid password');
            }
            throw new Error('Invalid email or password');
          }

          // Only log success in development, never in production
          if (process.env.NODE_ENV === 'development') {
            console.log('✓ Login successful');
          }

          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            role: user.role,
          };
        } catch (error) {
          console.error('Authorization error:', error);
          // Re-throw the original error if it's already a user-friendly message
          if (error instanceof Error && error.message.includes('Invalid email or password')) {
            throw error;
          }
          throw new Error('Authentication failed. Please try again.');
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.role && token.id) {
        session.user.role = token.role as UserRole;
        session.user.id = token.id as string;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
  },
  secret: nextAuthSecret || 'fallback-secret-change-in-production',
  trustHost: true,
  debug: process.env.NODE_ENV === 'development',
});


