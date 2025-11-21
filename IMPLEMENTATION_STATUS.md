# ✅ MongoDB User ID Implementation - COMPLETE

## What's Been Done ✨

### 1. UUID Package Installed ✅
- Command: `npm install uuid`
- Status: Successfully installed
- Audit: 0 vulnerabilities found

### 2. Signup Route Updated ✅
**File:** `src/app/api/signup/route.js`

Changes made:
- ✅ Imported `uuid` package: `import { v4 as uuidv4 } from "uuid"`
- ✅ Created `generateUniqueUserId()` function that returns `user_${uuid}`
- ✅ Generate userId on account creation
- ✅ Save userId to MongoDB alongside user data
- ✅ Return userId in the response

**How it works:**
```javascript
const userId = generateUniqueUserId();  // Generates: user_550e8400-e29b-41d4-a716-446655440000

await db.collection("users").insertOne({
  userId,           // ← Saved to MongoDB
  name,
  email,
  password: hashedPassword,
  createdAt: new Date(),
  updatedAt: new Date(),
});

// Response includes:
return Response.json({
  message: "User created successfully",
  userId,   // ← Returned to frontend
  email,
  name,
});
```

### 3. Auth Helpers Created ✅
**File:** `src/lib/auth-helpers.ts`

Functions available:
- `getUserIdFromSession()` - Get user's unique ID from session
- `verifyUserOwnership()` - Verify user owns requested data
- `getCurrentUserProfile()` - Get full user profile including userId

### 4. Documentation Created ✅
**File:** `MONGODB_USER_ID_SETUP.md`

Includes:
- Complete MongoDB schema setup
- API route templates with userId filtering
- Test cases and verification commands
- Troubleshooting guide

---

## Current MongoDB Structure 🗄️

### Users Collection
```javascript
{
  _id: ObjectId("507f1f77bcf86cd799439011"),
  userId: "user_550e8400-e29b-41d4-a716-446655440000",  // ← UNIQUE
  name: "Alice Johnson",
  email: "alice@example.com",
  password: "$2a$10$...",  // hashed
  createdAt: ISODate("2025-11-10T10:30:00Z"),
  updatedAt: ISODate("2025-11-10T10:30:00Z")
}
```

### Todos Collection (Example - needs userId)
```javascript
{
  _id: ObjectId("507f1f77bcf86cd799439012"),
  userId: "user_550e8400-e29b-41d4-a716-446655440000",  // ← ADD THIS
  text: "Learn React",
  completed: false,
  time: "2h",
  date: "10 Nov",
  label: "Dev"
}
```

---

## Next Steps to Complete Implementation 🚀

### STEP 1: Update Todos API Route
**File:** `src/app/api/todos/route.ts`

Replace the entire file with this:

```typescript
import { NextResponse } from "next/server";
import clientPromise from "../../../lib/mongodb";
import { ObjectId } from "mongodb";
import { getUserIdFromSession } from "../../../lib/auth-helpers";

export async function GET() {
  try {
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
    const userId = await getUserIdFromSession();
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db("calendarDB");
    const data = await req.json();

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
      { _id: new ObjectId(data._id), userId },
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
      userId
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

### STEP 2: Update Events API Route
**File:** `src/app/api/events/route.ts`

Apply the same pattern:
- Add `getUserIdFromSession()` at start of each handler
- Return 401 if no userId
- Filter all queries by `{ userId }`
- Check userId in update/delete operations

See the Todos API above as the template.

### STEP 3: Update Components (Optional but Recommended)
Components like `todo.tsx`, `events.tsx`, etc. should:
- Use auth helpers to display user's data only
- Not need to pass userId explicitly (API handles filtering)

### STEP 4: Create MongoDB Indexes
Run these commands in MongoDB shell:

```javascript
// Users collection
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ userId: 1 }, { unique: true });

// Todos collection
db.todos.createIndex({ userId: 1 });
db.todos.createIndex({ userId: 1, date: 1 });

// Events collection
db.events.createIndex({ userId: 1 });
```

### STEP 5: Test the Implementation

**Create a test account:**
```javascript
// 1. Sign up as Alice
// POST /api/signup
// Body: { name: "Alice", email: "alice@example.com", password: "test123" }
// Response includes: { userId: "user_550e8400-e29b-41d4-a716-446655440000" }

// 2. Check MongoDB
db.users.findOne({ email: "alice@example.com" })
// Should show userId field

// 3. Create a todo as Alice
// POST /api/todos with data
// Should automatically include userId

// 4. Sign up as Bob
// POST /api/signup
// Body: { name: "Bob", email: "bob@example.com", password: "test123" }

// 5. Bob fetches todos
// GET /api/todos
// Should only see Bob's todos, NOT Alice's todos
```

---

## How Data Isolation Works 🔒

1. **User Signs Up**
   - UUID generated: `user_550e8400-e29b-41d4-a716-446655440000`
   - Saved to MongoDB `users` collection
   - Returned to frontend

2. **User Creates Todo**
   - Frontend calls `/api/todos` POST
   - API validates session → Gets userId from auth-helpers
   - Automatically includes userId in todo document
   - Only this user's todos are visible

3. **User Logs In Later**
   - NextAuth retrieves session with email
   - API looks up email in users collection → Gets userId
   - All queries filtered by userId
   - User only sees their data

4. **Security**
   - userId is unique (UUID ensures this)
   - userId is verified server-side (not user-controlled)
   - Every query filtered by userId at database level
   - Even if user hacks frontend, API rejects unowned data

---

## Key Files Updated ✅

| File | Change |
|------|--------|
| `src/app/api/signup/route.js` | ✅ Now generates & saves userId |
| `src/lib/auth-helpers.ts` | ✅ Gets userId from session |
| `MONGODB_USER_ID_SETUP.md` | ✅ Complete documentation |
| **To Do:** `src/app/api/todos/route.ts` | Filter by userId |
| **To Do:** `src/app/api/events/route.ts` | Filter by userId |

---

## Architecture Summary

```
User Signs Up
    ↓
POST /api/signup
    ↓
Generate userId = user_${uuid}
    ↓
Save to MongoDB: { userId, name, email, password, ... }
    ↓
Return userId to frontend

User Creates Todo
    ↓
POST /api/todos
    ↓
getUserIdFromSession() → Lookup user by email → Get userId
    ↓
Save todo: { userId, text, completed, ... }
    ↓
Return todo

User Fetches Todos
    ↓
GET /api/todos
    ↓
getUserIdFromSession() → Get userId
    ↓
Query todos: { userId: "user_xxx" }
    ↓
Return ONLY that user's todos ✅
```

---

## Verification Checklist ✅

- [x] UUID package installed
- [x] Signup route generates userId
- [x] Signup saves userId to MongoDB
- [x] Signup returns userId in response
- [x] Auth helpers retrieve userId from session
- [ ] Todos API filters by userId
- [ ] Events API filters by userId
- [ ] MongoDB indexes created
- [ ] Test: User A cannot see User B's data
- [ ] Test: Backfill existing users with userId

---

**Status: Implementation 60% Complete - Ready for API Route Updates!** 🚀
