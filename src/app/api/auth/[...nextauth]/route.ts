import type { NextAuthOptions } from "next-auth"
import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"
import bcrypt from "bcryptjs"
import { v4 as uuidv4 } from "uuid"
import clientPromise from "../../../../lib/mongodb"

export const authOptions: NextAuthOptions = {
  providers: [
    // 🔹 Google OAuth Provider
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),

    // 🔹 Credentials Provider (your existing login)
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        // Connect to MongoDB
        const client = await clientPromise
        const db = client.db("calendarDB")

        // Find user
        const user = await db.collection("users").findOne({ email: credentials?.email })
        if (!user) throw new Error("User not found")

        // Validate password
        const isValid = await bcrypt.compare(credentials!.password, user.password)
        if (!isValid) throw new Error("Invalid password")

        // Return user object with userId for session
        return { id: user.userId, email: user.email, name: user.name }
      },
    }),
  ],

  // ✅ Redirect after successful login (works for both Google + Credentials)
  callbacks: {
    async signIn({ user, account }) {
      // Handle Google OAuth sign-in: create/update user in database and save provider info
      if (account?.provider === "google" && user.email) {
        try {
          const client = await clientPromise
          const db = client.db("calendarDB")
          const usersCollection = db.collection("users")

          // Check if user exists
          const existingUser = await usersCollection.findOne({ email: user.email })

          const providerInfo: Record<string, unknown> = {}
          if (account.providerAccountId) providerInfo.googleProviderId = account.providerAccountId
          // account may include tokens depending on provider response; guard safely
          const acct: Record<string, unknown> = account as unknown as Record<string, unknown>
          if (acct.access_token) providerInfo.googleAccessToken = String(acct.access_token)
          if (acct.refresh_token) providerInfo.googleRefreshToken = String(acct.refresh_token)
          providerInfo.googleLinked = true

          if (!existingUser) {
            // Create new user with userId and provider info
            await usersCollection.insertOne({
              userId: `user_${uuidv4()}`,
              name: user.name || "",
              email: user.email,
              image: user.image || "",
              createdAt: new Date(),
              updatedAt: new Date(),
              ...providerInfo,
            })
          } else {
            // Update existing user with latest profile + provider info
            await usersCollection.updateOne(
              { email: user.email },
              {
                $set: {
                  name: user.name || existingUser.name,
                  image: user.image || existingUser.image,
                  updatedAt: new Date(),
                  ...providerInfo,
                },
              }
            )
          }
        } catch (error) {
          console.error("Error in signIn callback:", error)
          return false
        }
      }
      return true
    },
    async redirect() {
      return "/calendar"
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }