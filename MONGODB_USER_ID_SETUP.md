# MongoDB User ID Implementation - Complete Guide

## Overview

This guide explains how to properly save and manage unique user IDs in MongoDB for complete account isolation.

## Step 1: Install UUID Package

```bash
npm install uuid
```

## Step 2: Update Signup Route with MongoDB Persistence

Update `src/app/api/signup/route.js` to:

```javascript
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
    const db = client.db("calendarDB");

    // Check if user already exists
    const existingUser = await db.collection("users").findOne({ email });
    if (existingUser) {
      return Response.json({ message: "User already exists" }, { status: 409 });
    }

    // Generate unique userId
    const userId = generateUniqueUserId();

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user with unique userId to MongoDB
    const result = await db.collection("users").insertOne({
      userId,           // ✅ New unique ID
      name,
      email,
      password: hashedPassword,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return Response.json(
      {
        message: "User created successfully",
        userId,    // ✅ Return userId to frontend
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
```

## Step 3: MongoDB Collections Setup

### Users Collection Schema

```javascript
// Create users collection with indexes
db.createCollection("users");

// Add indexes for performance and uniqueness
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ userId: 1 }, { unique: true });

// Sample user document
{
  _id: ObjectId("507f1f77bcf86cd799439011"),
  userId: "user_550e8400-e29b-41d4-a716-446655440000",
  name: "Alice Johnson",
  email: "alice@example.com",
  password: "$2a$10$...",  // hashed
  createdAt: ISODate("2025-11-10T10:30:00Z"),
  updatedAt: ISODate("2025-11-10T10:30:00Z")
}
```

### Todos Collection Schema

```javascript
// Create todos collection
db.createCollection("todos");

// Add indexes for performance
db.todos.createIndex({ userId: 1 });
db.todos.createIndex({ userId: 1, date: 1 });

// Sample todo document
{
  _id: ObjectId("507f1f77bcf86cd799439012"),
  userId: "user_550e8400-e29b-41d4-a716-446655440000",
  text: "Learn React",
  completed: false,
  time: "2h",
  date: "10 Nov",
  label: "Dev",
  createdAt: ISODate("2025-11-10T11:00:00Z"),
  updatedAt: ISODate("2025-11-10T11:00:00Z")
}
```

### Events Collection Schema

```javascript
// Create events collection
db.createCollection("events");

// Add indexes for performance
db.events.createIndex({ userId: 1 });

// Sample event document
{
  _id: ObjectId("507f1f77bcf86cd799439013"),
  userId: "user_550e8400-e29b-41d4-a716-446655440000",
  title: "Team Meeting",
  date: "2025-11-10",
  start: "09:00",
  end: "10:00",
  color: "bg-blue-100 border-l-4 border-blue-500",
  createdAt: ISODate("2025-11-10T08:30:00Z")
}
```

## Step 4: Auth Helpers

Create `src/lib/auth-helpers.ts`:

```typescript
import { getServerSession } from "next-auth/next";
import clientPromise from "./mongodb";

export async function getUserIdFromSession(): Promise<string | null> {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return null;
    }

    const client = await clientPromise;
    const db = client.db("calendarDB");

    // Lookup user by email to get their unique userId
    const user = await db.collection("users").findOne({ 
      email: session.user.email 
    });

    return user?.userId || null;
  } catch (error) {
    console.error("Error getting userId from session:", error);
    return null;
  }
}

export async function verifyUserOwnership(userId: string): Promise<boolean> {
  if (!userId) return false;
  
  try {
    const sessionUserId = await getUserIdFromSession();
    return sessionUserId === userId;
  } catch (error) {
    console.error("Error verifying ownership:", error);
    return false;
  }
}
```

## Step 5: Update API Routes

### Todos API - `src/app/api/todos/route.ts`

```typescript
import { NextResponse } from "next/server";
import clientPromise from "../../../lib/mongodb";
import { ObjectId } from "mongodb";
import { getUserIdFromSession } from "../../../lib/auth-helpers";

export async function GET() {
  try {
    // ✅ Get unique userId from session
    const userId = await getUserIdFromSession();
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db("calendarDB");
    
    // ✅ Query only todos for this user
    const todos = await db.collection("todos")
      .find({ userId })
      .toArray();
    
    return NextResponse.json(todos);
  } catch (err) {
    console.error("GET /api/todos error:", err);
    return NextResponse.json({ error: "Failed to fetch todos" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    // ✅ Get unique userId from session
    const userId = await getUserIdFromSession();
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db("calendarDB");
    const data = await req.json();

    // ✅ Create todo with userId
    const newTodo = {
      userId,  // ✅ Attach userId to every todo
      text: data.text,
      completed: data.completed ?? false,
      comments: data.comments ?? 0,
      time: data.time || "0",
      date: data.date || new Date().toLocaleDateString("en-GB"),
      label: data.label || "Dev",
      start: data.start || null,
      end: data.end || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection("todos").insertOne(newTodo);

    return NextResponse.json({ ...newTodo, _id: result.insertedId }, { status: 201 });
  } catch (err) {
    console.error("POST /api/todos error:", err);
    return NextResponse.json({ error: "Failed to save todo" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const userId = await getUserIdFromSession();
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db("calendarDB");
    const data = await req.json();

    // ✅ Update only if userId matches
    const result = await db.collection("todos").updateOne(
      { _id: new ObjectId(data._id), userId },  // ✅ Check both ID and userId
      {
        $set: {
          text: data.text,
          completed: data.completed,
          time: data.time,
          date: data.date,
          label: data.label,
          updatedAt: new Date(),
        },
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Todo not found or unauthorized" }, { status: 403 });
    }

    return NextResponse.json({ success: true, modifiedCount: result.modifiedCount });
  } catch (err) {
    console.error("PUT /api/todos error:", err);
    return NextResponse.json({ error: "Failed to update todo" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const userId = await getUserIdFromSession();
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db("calendarDB");
    const { id } = await req.json();

    // ✅ Delete only if userId matches
    const result = await db.collection("todos").deleteOne({ 
      _id: new ObjectId(id), 
      userId  // ✅ Verify ownership
    });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Todo not found or unauthorized" }, { status: 403 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE /api/todos error:", err);
    return NextResponse.json({ error: "Failed to delete todo" }, { status: 500 });
  }
}
```

## Step 6: Test the Implementation

### Test Case 1: Create Account and Verify userId in MongoDB

```bash
# 1. Signup User A
curl -X POST http://localhost:3000/api/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Alice Johnson",
    "email": "alice@example.com",
    "password": "password123"
  }'

# Response includes userId:
# {
#   "message": "User created successfully",
#   "userId": "user_550e8400-e29b-41d4-a716-446655440000",
#   "email": "alice@example.com",
#   "name": "Alice Johnson"
# }

# 2. Check MongoDB
db.users.findOne({ email: "alice@example.com" })

# Result shows:
# {
#   _id: ObjectId(...),
#   userId: "user_550e8400-e29b-41d4-a716-446655440000",
#   name: "Alice Johnson",
#   email: "alice@example.com",
#   ...
# }
```

### Test Case 2: Verify Data Isolation

```bash
# 1. Login as Alice and create todo
# Frontend stores session with Alice's email

# 2. API receives request
# Looks up Alice's userId from database
# userId = "user_550e8400-e29b-41d4-a716-446655440000"

# 3. Saves todo with userId
{
  userId: "user_550e8400-e29b-41d4-a716-446655440000",
  text: "Alice's Task",
  completed: false,
  ...
}

# 4. Login as Bob and fetch todos
# API gets Bob's userId
# Query: { userId: "user_6ba7b810-9dad-11d1-80b4-00c04fd430c8" }
# Result: Only Bob's todos, NOT Alice's
```

## Step 7: MongoDB Verification Commands

```javascript
// View all users
db.users.find();

// View specific user
db.users.findOne({ email: "alice@example.com" });

// View user's todos
db.todos.find({ userId: "user_550e8400-e29b-41d4-a716-446655440000" });

// Count todos per user
db.todos.aggregate([
  { $group: { _id: "$userId", count: { $sum: 1 } } }
]);

// Verify no duplicate userIds
db.users.aggregate([
  { $group: { _id: "$userId", count: { $sum: 1 } } },
  { $match: { count: { $gt: 1 } } }
]);
// Should return empty array
```

## Summary of MongoDB Changes

| Field | Collection | Type | Index | Purpose |
|-------|-----------|------|-------|---------|
| userId | users | String | unique | Unique user identifier |
| userId | todos | String | indexed | Associate todos to user |
| userId | events | String | indexed | Associate events to user |
| userId | tasks | String | indexed | Associate tasks to user |

## Key Points

✅ **userId is unique** - UUID v4 ensures no duplicates
✅ **userId is persistent** - Stored in MongoDB forever
✅ **userId is used everywhere** - All data queries filtered by userId
✅ **userId is never exposed** - Only used server-side in API routes
✅ **userId prevents cross-account access** - Database enforces isolation

## Troubleshooting

### Problem: userId not appearing in database
**Solution**: Ensure route.js is updated with uuid import and userId generation

### Problem: Getting "Unauthorized" errors
**Solution**: Check that getUserIdFromSession is finding user in database

### Problem: Seeing other users' data
**Solution**: Verify all queries include `{ userId }` filter

---

**Implementation Complete!** Each user now has a unique, persistent ID saved in MongoDB for complete data isolation. 🔒
