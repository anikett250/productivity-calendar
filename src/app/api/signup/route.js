import clientPromise from "../../../lib/mongodb";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";

function generateUniqueUserId() {
  return `user_${uuidv4()}`;
}

export async function POST(req) {
  try {
    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return Response.json({ message: "All fields are required" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("calendarDB"); // change this to your database name

    const existingUser = await db.collection("users").findOne({ email });
    if (existingUser) {
      return Response.json({ message: "User already exists" }, { status: 409 });
    }

    // Generate unique userId
    const userId = generateUniqueUserId();

    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user with unique userId to MongoDB
    await db.collection("users").insertOne({
      userId,           // ✅ Unique user identifier
      name,
      email,
      password: hashedPassword,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return Response.json(
      {
        message: "User created successfully",
        userId,   // ✅ Return userId to frontend
        email,
        name,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Signup error:", error);
    return Response.json({ message: "Internal server error" }, { status: 500 });
  }
}
