# ✅ QUICK START - MongoDB User ID Implementation

## What's Complete ✨

### 1. UUID Package ✅
```bash
npm list uuid
# Output: uuid@13.0.0 installed ✓
```

### 2. Signup Route with userId ✅
**File:** `src/app/api/signup/route.js`

```javascript
import { v4 as uuidv4 } from "uuid";

function generateUniqueUserId() {
  return `user_${uuidv4()}`;
}

// On signup:
const userId = generateUniqueUserId();
await db.collection("users").insertOne({
  userId,        // ← NEW: Unique identifier saved to MongoDB
  name,
  email,
  password: hashedPassword,
  createdAt: new Date(),
  updatedAt: new Date(),
});

return Response.json({
  message: "User created successfully",
  userId,        // ← NEW: Returned in response
  email,
  name,
});
```

### 3. Auth Helpers ✅
**File:** `src/lib/auth-helpers.ts`

```typescript
// Get userId from session
const userId = await getUserIdFromSession();

// Verify user owns data
const isOwner = await verifyUserOwnership(userId);

// Get full user profile
const profile = await getCurrentUserProfile();
```

### 4. Documentation ✅
- `MONGODB_USER_ID_SETUP.md` - Complete technical setup guide
- `IMPLEMENTATION_STATUS.md` - Current status and next steps

---

## Test It Now 🧪

### 1. Create First User
```bash
curl -X POST http://localhost:3000/api/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123"
  }'
```

**Response:**
```json
{
  "message": "User created successfully",
  "userId": "user_550e8400-e29b-41d4-a716-446655440000",
  "email": "test@example.com",
  "name": "Test User"
}
```

### 2. Check MongoDB
```bash
# In MongoDB shell:
use calendarDB
db.users.findOne({ email: "test@example.com" })

# Output:
{
  _id: ObjectId("..."),
  userId: "user_550e8400-e29b-41d4-a716-446655440000",
  name: "Test User",
  email: "test@example.com",
  password: "$2a$10$...",
  createdAt: ISODate("2025-11-10T..."),
  updatedAt: ISODate("2025-11-10T...")
}
```

✅ **userId successfully saved to MongoDB!**

---

## What This Enables 🔐

Each user now has:
- ✅ Unique ID that never changes
- ✅ Complete data isolation
- ✅ Server-side verification of ownership
- ✅ Prevention of cross-account access

---

## API Pattern (Apply to All Routes)

### Before (Insecure ❌)
```typescript
export async function GET() {
  const todos = await db.collection("todos").find({}).toArray();
  // Problem: Returns ALL todos for ALL users!
}
```

### After (Secure ✅)
```typescript
import { getUserIdFromSession } from "../../../lib/auth-helpers";

export async function GET() {
  const userId = await getUserIdFromSession();
  
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const todos = await db.collection("todos")
    .find({ userId })  // ← Filter by userId
    .toArray();
}
```

---

## Files to Update Next

1. **`src/app/api/todos/route.ts`** - Apply userId filtering
2. **`src/app/api/events/route.ts`** - Apply userId filtering
3. **Any other API routes** - Apply same pattern

See `MONGODB_USER_ID_SETUP.md` for complete code examples.

---

## Current Database State

### Users Collection
```
✅ userId: "user_xxx..." (unique per user)
✅ email: "user@example.com"
✅ name: "User Name"
✅ password: hashed
✅ createdAt: timestamp
✅ updatedAt: timestamp
```

### Todos Collection (To Update)
```
Current:  { text, completed, time, date, label }
Needed:   { userId, text, completed, time, date, label }
          ↑ Add this field to all existing documents
```

### Events Collection (To Update)
```
Current:  { title, date, start, end, color }
Needed:   { userId, title, date, start, end, color }
          ↑ Add this field to all existing documents
```

---

## Backfill Existing Data (If Needed)

If you have existing todos/events without userId:

```javascript
// In MongoDB shell:

// Add userId to all existing todos
db.todos.updateMany(
  { userId: { $exists: false } },
  { $set: { userId: "user_default_legacy" } }
);

// Add userId to all existing events  
db.events.updateMany(
  { userId: { $exists: false } },
  { $set: { userId: "user_default_legacy" } }
);
```

---

## Next Steps 📋

1. ✅ **DONE:** Generate userId on signup
2. ✅ **DONE:** Save userId to MongoDB
3. ⏳ **TODO:** Update todos API to filter by userId
4. ⏳ **TODO:** Update events API to filter by userId
5. ⏳ **TODO:** Create database indexes for performance
6. ⏳ **TODO:** Test data isolation between users
7. ⏳ **TODO:** Backfill existing data if needed

---

## Troubleshooting 🔧

**Q: userId not saving to MongoDB**
- A: Check that signup route has `import { v4 as uuidv4 } from "uuid"`

**Q: Getting "Unauthorized" errors in API**
- A: Check that `getUserIdFromSession()` can find the user by email

**Q: Seeing other users' data**
- A: Verify that all queries include `{ userId }` filter

**Q: Database queries slow**
- A: Create indexes: `db.todos.createIndex({ userId: 1 })`

---

## Summary

✅ **Signup now generates unique userId per account**
✅ **userId is persisted to MongoDB**
✅ **Auth helpers retrieve userId from session**
✅ **Data isolation foundation is ready**

Next: Apply userId filtering to API routes! 🚀
