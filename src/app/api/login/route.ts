import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import clientPromise from "../../../lib/mongodb";

export async function POST(req: Request) {
    try {
        const body = await req.json()
        const { email, password } = body

        if (!email || !password) {
            return NextResponse.json({ error: "All fields are required" }, { status: 400 });
        }

        const client = await clientPromise;
        const db = client.db("calendarDB");
        const users = db.collection("users");

        // Find user by email
        const existingUser = await users.findOne({ email });

        if (!existingUser) {
            return NextResponse.json({ error: "No account found. Please sign up." }, { status: 404 });
        }

        // Compare password
        const isMatch = await bcrypt.compare(password, existingUser.password);

        if (!isMatch) {
            return NextResponse.json({ error: "Invalid credentials." }, { status: 401 });
        }

        // Success - create response with cookie
        const response = NextResponse.json({ 
            message: "Login successful", 
            user: { 
                email: existingUser.email,
                name: existingUser.name,
                userId: existingUser.userId 
            } 
        });

        // Set secure httpOnly cookie with user info
        response.cookies.set({
            name: 'user_session',
            value: JSON.stringify({
                email: existingUser.email,
                userId: existingUser.userId,
                name: existingUser.name
            }),
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 7, // 7 days
            path: '/'
        });

        return response;
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
    }
}
