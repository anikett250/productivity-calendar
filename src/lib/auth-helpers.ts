import { getServerSession } from "next-auth/next";
import clientPromise from "./mongodb";

export async function getUserIdFromSession(): Promise<string | null> {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      console.log("No session or email found");
      return null;
    }

    const client = await clientPromise;
    const db = client.db("calendarDB");

    const user = await db.collection("users").findOne({ email: session.user.email });
    
    if (!user?.userId) {
      console.log("User not found or has no userId:", session.user.email);
      return null;
    }

    return user.userId;
  } catch (error) {
    console.error("Error getting userId from session:", error);
    return null;
  }
}

export async function verifyUserOwnership(userId: string): Promise<boolean> {
  if (!userId) {
    console.log("No userId provided for ownership verification");
    return false;
  }
  
  try {
    const sessionUserId = await getUserIdFromSession();
    
    if (!sessionUserId) {
      console.log("Could not get userId from session");
      return false;
    }

    const isOwner = sessionUserId === userId;

    if (!isOwner) {
      console.log(
        "User does not own this data. Session userId:",
        sessionUserId,
        "Requested userId:",
        userId
      );
    }

    return isOwner;
  } catch (error) {
    console.error("Error verifying user ownership:", error);
    return false;
  }
}

/**
 * Get the current user's profile data including userId
 */
export async function getCurrentUserProfile() {
  try {
    const session = await getServerSession();

    if (!session?.user?.email) {
      return null;
    }

    const client = await clientPromise;
    const db = client.db("calendarDB");

    const user = await db.collection("users").findOne({
      email: session.user.email,
    });

    if (!user) {
      return null;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...userProfile } = user;
    return userProfile;
  } catch (error) {
    console.error("Error getting current user profile:", error);
    return null;
  }
}
