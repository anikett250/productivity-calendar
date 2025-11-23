// lib/auth.ts
import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"
import type { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import clientPromise from './mongodb';

// Dynamic NEXTAUTH_URL - use environment variable or auto-detect from request
const getAuthUrl = () => {
  if (process.env.NEXTAUTH_URL) {
    return process.env.NEXTAUTH_URL;
  }
  // Fallback for Vercel: use the VERCEL_URL if available
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  // Fallback for local development
  return "http://localhost:3000";
};

export const authOptions: NextAuthOptions = {
  providers: [
    // Google login
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),

    // Email-password login
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const user = await verifyUser(credentials?.email, credentials?.password)
        if (!user) return null
        return user
      },
    }),
  ],

  pages: {
    signIn: "/login", // redirects here for login
  },

  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
  // Use dynamic URL detection for Vercel compatibility
  ...(getAuthUrl() && { 
    trustHost: true,
  }),
}

// Dummy function for example
async function verifyUser(email?: string, password?: string) {
  // Replace this with DB check (e.g., MongoDB)
  if (email === "test@example.com" && password === "123456") {
    return { id: "1", name: "Test User", email }
  }
  return null
}

/**
 * Get userId from either the custom user_session cookie or NextAuth session
 * This ensures both email login and Google login work with the same backend
 */
export async function getUserIdFromRequest(request: NextRequest): Promise<string | null> {
  try {
    // First, try to get userId from custom user_session cookie (email login)
    const userSessionCookie = request.cookies.get('user_session');
    if (userSessionCookie) {
      try {
        const userSession = JSON.parse(userSessionCookie.value);
        if (userSession?.userId) {
          return userSession.userId;
        }
      } catch {
        // Cookie parsing failed, continue to try NextAuth session
      }
    }

    // If no cookie, try to get from NextAuth session (Google login)
    const session = await getServerSession(authOptions);
    if (session?.user?.email) {
      // Look up userId from database using email
      const client = await clientPromise;
      const db = client.db('calendarDB');
      const user = await db.collection('users').findOne({ email: session.user.email });
      if (user?.userId) {
        return user.userId;
      }
    }

    return null;
  } catch (error) {
    console.error('Error getting userId from request:', error);
    return null;
  }
}
