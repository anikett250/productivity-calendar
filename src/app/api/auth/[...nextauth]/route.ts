import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import clientPromise from "../../../../lib/mongodb";
import { v4 as uuidv4 } from "uuid";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),

    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) return null;

        const client = await clientPromise;
        const db = client.db("calendarDB");

        const user = await db
          .collection("users")
          .findOne({ email: credentials.email });

        if (!user) return null;

        const valid = await bcrypt.compare(
          credentials.password,
          user.password
        );
        if (!valid) return null;

        return {
          id: user.userId,
          email: user.email,
          name: user.name,
        };
      },
    }),
  ],

  callbacks: {
    async signIn({ user, account }) {
      // Handle Google sign-in
      if (account?.provider === "google" && user.email) {
        const client = await clientPromise;
        const db = client.db("calendarDB");
        const usersCollection = db.collection("users");

        const existingUser = await usersCollection.findOne({
          email: user.email,
        });

        if (!existingUser) {
          await usersCollection.insertOne({
            userId: `user_${uuidv4()}`,
            name: user.name || "",
            email: user.email,
            image: user.image || "",
            googleLinked: true,
            createdAt: new Date(),
            updatedAt: new Date(),
          });
        } else {
          await usersCollection.updateOne(
            { email: user.email },
            {
              $set: {
                name: user.name || existingUser.name,
                image: user.image || existingUser.image,
                googleLinked: true,
                updatedAt: new Date(),
              },
            }
          );
        }
      }

      return true;
    },

    async redirect() {
      return "/calendar"; // redirect after login
    },

    async session({ session, token }) {
      // Add userId to session
      if (session.user && token.sub) {
        session.user.userId = token.sub;
      }
      return session;
    },

    async jwt({ token, user }) {
      if (user) token.sub = user.id;
      return token;
    },
  },

  session: {
    strategy: "jwt",
  },

  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
