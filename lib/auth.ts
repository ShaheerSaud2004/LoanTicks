import NextAuth, { DefaultSession } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';

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
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      allowDangerousEmailAccountLinking: true, // Allow linking accounts with same email
    }),
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

          // Check if user is approved (only for non-admin users)
          if (user.role !== 'admin' && !user.isApproved) {
            throw new Error('Your account is pending admin approval. Please wait for approval before signing in.');
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
    async signIn({ user, account, profile: _profile }) {
      // Handle Google OAuth sign-in
      if (account?.provider === 'google') {
        try {
          const connectDB = (await import('@/lib/mongodb')).default;
          const User = (await import('@/models/User')).default;
          
          await connectDB();
          
          // Check if user exists
          const existingUser = await User.findOne({ 
            $or: [
              { email: user.email?.toLowerCase() },
              { providerId: account.providerAccountId }
            ]
          });
          
          if (existingUser) {
            // Update existing user with Google provider info
            existingUser.provider = 'google';
            existingUser.providerId = account.providerAccountId;
            if (!existingUser.name && user.name) {
              existingUser.name = user.name;
            }
            await existingUser.save();
            
            // Check approval status
            if (existingUser.role !== 'admin' && !existingUser.isApproved) {
              // Block sign-in - NextAuth will redirect to error page with AccessDenied
              // Error page will show pending approval message
              return false;
            }
            // User exists and is approved - allow sign in
            return true;
          } else {
            // User doesn't exist - don't auto-create, block sign-in
            // NextAuth will redirect to error page with AccessDenied
            // Error page will show "account not found, please sign up" message
            return false;
          }
        } catch (error) {
          console.error('Google OAuth error:', error);
          return false;
        }
      }
      return true;
    },
    async jwt({ token, user, account }) {
      if (user) {
        token.role = user.role;
        token.id = user.id;
      }
      
      // For Google OAuth, fetch user from DB to get latest approval status
      if (account?.provider === 'google' && user?.email) {
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
      if (session.user && token.role && token.id) {
        session.user.role = token.role as UserRole;
        session.user.id = token.id as string;
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
  secret: nextAuthSecret || 'fallback-secret-change-in-production',
  trustHost: true,
  debug: process.env.NODE_ENV === 'development',
});


