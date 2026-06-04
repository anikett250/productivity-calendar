// lib/auth.ts

import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { getServerSession } from "next-auth";
import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import clientPromise from "./mongodb";
import { v4 as uuidv4 } from "uuid";

export const authOptions: NextAuthOptions = {
  providers: [
    // GOOGLE LOGIN
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),

    // EMAIL LOGIN
    CredentialsProvider({
      name: "Credentials",

      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },

      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) {
          return null;
        }

        const client = await clientPromise;
        const db = client.db("calendarDB");

        const user = await db.collection("users").findOne({
          email: credentials.email,
        });

        if (!user) return null;

        const validPassword = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!validPassword) return null;

        return {
          id: user.userId,
          email: user.email,
          name: user.name,
          userId: user.userId,
        };
      },
    }),
  ],

  pages: {
    signIn: "/login",
  },

  session: {
    strategy: "jwt",
  },

  secret: process.env.NEXTAUTH_SECRET,

  callbacks: {
    async signIn({ user, account }) {
      // GOOGLE LOGIN HANDLING
      if (account?.provider === "google" && user.email) {
        const client = await clientPromise;
        const db = client.db("calendarDB");

        const usersCollection = db.collection("users");

        let existingUser = await usersCollection.findOne({
          email: user.email,
        });

        // CREATE USER IF NOT EXISTS
        if (!existingUser) {
          const newUser = {
            userId: `user_${uuidv4()}`,
            googleId: account.providerAccountId,
            name: user.name || "",
            email: user.email,
            image: user.image || "",
            googleLinked: true,
            createdAt: new Date(),
            updatedAt: new Date(),
          };

          await usersCollection.insertOne(newUser);

          existingUser = newUser;
        }

        // attach custom userId
        user.id = existingUser.userId;
      }

      return true;
    },

    async jwt({ token, user }) {
      // FIRST LOGIN
      if (user) {
        token.userId = user.id;
      }

      // GOOGLE SESSION REFRESH
      if (!token.userId && token.email) {
        const client = await clientPromise;
        const db = client.db("calendarDB");

        const dbUser = await db.collection("users").findOne({
          email: token.email,
        });

        if (dbUser) {
          token.userId = dbUser.userId;
        }
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.userId = token.userId as string;
      }

      return session;
    },
  },
};

/**
 * GET USER ID FROM SESSION
 */
export async function getUserIdFromRequest(
  request: NextRequest
): Promise<string | null> {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.userId) {
      return null;
    }

    return session.user.userId;
  } catch (error) {
    console.error("Error getting userId:", error);
    return null;
  }
}