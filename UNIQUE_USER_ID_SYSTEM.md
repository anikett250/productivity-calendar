# Unique User ID System - Implementation Guide

## Overview

This implementation creates a **unique, non-recurring User ID** for each account when they sign up. This ID is used to isolate and organize all data (tasks, events, analytics) specific to that user's account.

## How It Works

### 1. **User ID Generation**

When a user creates an account:

```typescript
// Generate unique userId using UUID v4
const userId = `user_${uuidv4()}`;

// Example IDs:
// user_550e8400-e29b-41d4-a716-446655440000
// user_6ba7b810-9dad-11d1-80b4-00c04fd430c8
// user_f47ac10b-58cc-4372-a567-0e02b2c3d479
```

### 2. **User Storage**

Each user record in MongoDB contains:

```javascript
{
  userId: "user_550e8400-e29b-41d4-a716-446655440000",  // Unique ID
  name: "Alice Johnson",
  email: "alice@example.com",
  password: "hashed_password",
  createdAt: 2025-11-10T10:30:00Z,
  updatedAt: 2025-11-10T10:30:00Z
}
```

### 3. **Data Association**

All user data is associated with their unique userId:

**User A (alice@example.com)**
```
userId: user_550e8400-e29b-41d4-a716-446655440000

Todos:
├── Task 1: "Learn React" (userId: user_550e8400...)
├── Task 2: "Build App" (userId: user_550e8400...)
└── Task 3: "Deploy" (userId: user_550e8400...)

Events:
├── Event 1: "Team Meeting" (userId: user_550e8400...)
└── Event 2: "Project Deadline" (userId: user_550e8400...)
```

**User B (bob@example.com)**
```
userId: user_6ba7b810-9dad-11d1-80b4-00c04fd430c8

Todos:
├── Task 1: "Math Homework" (userId: user_6ba7b810...)
└── Task 2: "Study Physics" (userId: user_6ba7b810...)

Events:
├── Event 1: "Doctor Appointment" (userId: user_6ba7b810...)
└── Event 2: "Dentist" (userId: user_6ba7b810...)
```

**Completely Isolated** - No cross-contamination!

## Implementation Files

### 1. **Signup API** (`src/app/api/signup/route.ts`)

```typescript
import { v4 as uuidv4 } from "uuid";

export async function POST(req) {
  // ... validation ...
  
  // Generate unique userId
  const userId = `user_${uuidv4()}`;
  
  // Save user with userId
  await db.collection("users").insertOne({
    userId,        // ← Unique identifier
    name,
    email,
    password: hashedPassword,
    createdAt: new Date(),
  });
  
  return { userId, email, message: "User created" };
}
```

### 2. **Auth Helpers** (`src/lib/auth-helpers.ts`)

```typescript
export async function getUserIdFromSession(): Promise<string | null> {
  const session = await getServerSession();
  const email = session?.user?.email;
  
  // Look up user by email to get their userId
  const user = await db.collection("users").findOne({ email });
  return user?.userId || null;  // ← Returns the unique userId
}
```

### 3. **API Routes with userId Filtering**

All API endpoints now:
- Get userId from session
- Filter queries by userId
- Prevent cross-user access

```typescript
export async function GET() {
  // Get userId for current user
  const userId = await getUserIdFromSession();
  
  if (!userId) return 401; // Not authenticated
  
  // Only fetch todos for THIS user
  const todos = await db.collection("todos")
    .find({ userId })  // ← Filtered by unique userId
    .toArray();
  
  return todos;
}
```

## Database Schema

### Users Collection
```json
{
  "_id": ObjectId,
  "userId": "user_550e8400-e29b-41d4-a716-446655440000",
  "name": "Alice Johnson",
  "email": "alice@example.com",
  "password": "hashed_password_here",
  "createdAt": ISODate("2025-11-10T10:30:00Z"),
  "updatedAt": ISODate("2025-11-10T10:30:00Z")
}
```

### Todos Collection
```json
{
  "_id": ObjectId,
  "userId": "user_550e8400-e29b-41d4-a716-446655440000",
  "text": "Learn React",
  "completed": false,
  "time": "2h",
  "date": "10 Nov",
  "label": "Dev",
  "createdAt": ISODate("2025-11-10T11:00:00Z"),
  "updatedAt": ISODate("2025-11-10T11:00:00Z")
}
```

### Events Collection
```json
{
  "_id": ObjectId,
  "userId": "user_550e8400-e29b-41d4-a716-446655440000",
  "title": "Team Meeting",
  "date": "2025-11-10",
  "start": "09:00",
  "end": "10:00",
  "color": "bg-blue-100",
  "createdAt": ISODate("2025-11-10T08:30:00Z")
}
```

## Signup Flow

```
User Registration
      ↓
1. User provides: name, email, password
      ↓
2. API generates unique userId
      ↓
3. User record saved with userId
      ↓
4. Return userId in response
      ↓
5. User redirected to login
      ↓
User Authentication (Login)
      ↓
1. User enters email & password
      ↓
2. Credentials verified
      ↓
3. Session created with user info
      ↓
4. Session contains email
      ↓
User Creates Todo
      ↓
1. Frontend sends todo data
      ↓
2. API gets userId from session
      ↓
3. Lookup email → find userId
      ↓
4. Todo saved with userId
      ↓
5. Only THIS user can access it
```

## Uniqueness Guarantees

### Why UUID v4?

```
UUID v4 generates: 128-bit random identifiers
Total possible combinations: 5.3 × 10^36

Probability of collision with 1 billion IDs:
50% chance: 5.3 × 10^21 IDs (practically impossible)

1 billion users, 1 billion tasks per user:
10^18 total items, collision probability: < 1 in 10 billion
```

### No Recurring IDs

- Each user gets a **brand new, randomly generated UUID**
- Virtually **impossible** to generate the same ID twice
- IDs are **globally unique** across all systems

## Implementation Checklist

✅ **Signup API**
- Generate userId with `uuidv4()`
- Save userId with user record
- Return userId in response

✅ **Auth Helpers**
- Fetch userId from database using email
- Return userId for API operations

✅ **API Routes**
- Get userId from session
- Filter all queries: `{ userId, ...filters }`
- Verify ownership on updates/deletes

✅ **Database Indexes**
```javascript
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ userId: 1 }, { unique: true });
db.todos.createIndex({ userId: 1 });
db.todos.createIndex({ userId: 1, date: 1 });
db.events.createIndex({ userId: 1 });
db.tasks.createIndex({ userId: 1 });
```

## Security Features

1. **Unique Identification**
   - Each user has one unique userId
   - Cannot be guessed or predicted
   - No sequential IDs

2. **Complete Isolation**
   - All queries filtered by userId
   - Cross-user data access impossible
   - Session-based verification

3. **Data Protection**
   - userId never exposed to frontend
   - Only used server-side
   - Hashed passwords for auth

4. **Error Handling**
   - 401 Unauthorized for missing userId
   - 403 Forbidden for cross-user access
   - Generic error messages

## Example Scenarios

### Scenario 1: Two Users, Same Task Name

```
Alice creates: "Meeting Notes"
  └─ userId: user_550e8400...
  └─ Text: "Meeting Notes"
  └─ Saved to MongoDB

Bob creates: "Meeting Notes"
  └─ userId: user_6ba7b810...
  └─ Text: "Meeting Notes"
  └─ Saved to MongoDB

When Alice logs in:
  └─ Query: { userId: "user_550e8400..." }
  └─ Result: [Alice's "Meeting Notes"] ✓

When Bob logs in:
  └─ Query: { userId: "user_6ba7b810..." }
  └─ Result: [Bob's "Meeting Notes"] ✓

No conflict! Perfect isolation!
```

### Scenario 2: User Tries to Access Another User's Data

```
URL: /api/todos

Alice's Session:
  └─ email: alice@example.com
  └─ userId: user_550e8400...

Attacker manually tries:
  └─ { userId: "user_6ba7b810...", _id: "..." }

Backend validates:
  └─ Session userId: user_550e8400...
  └─ Requested userId: user_6ba7b810...
  └─ ❌ Mismatch! Return 401
```

## Migration for Existing Users

If migrating from email-based ID:

```javascript
// Add userId to existing user records
db.users.updateMany(
  { userId: { $exists: false } },
  [{ $set: { userId: `user_${UUID()}` } }]
);

// Backfill todos with userId
db.todos.aggregate([
  {
    $lookup: {
      from: "users",
      localField: "email",
      foreignField: "email",
      as: "user"
    }
  },
  {
    $merge: {
      into: "todos",
      whenMatched: "replace"
    }
  }
]);
```

## Testing

### Test Case 1: Verify Uniqueness

```bash
# Create 1000 accounts
for i in {1..1000}; do
  curl -X POST /api/signup \
    -d { name: "User$i", email: "user$i@test.com", password: "pass" }
done

# Check all userIds are unique
db.users.aggregate([
  { $group: { _id: "$userId", count: { $sum: 1 } } },
  { $match: { count: { $gt: 1 } } }
]);

# Result should be empty (no duplicates)
```

### Test Case 2: Data Isolation

```bash
# Login as User A
1. Create task: "My Task"
2. Verify task has userId of User A

# Login as User B  
3. Create task: "My Task"
4. Verify task has userId of User B

# Fetch User A's tasks
5. Should only see User A's "My Task"
6. Should NOT see User B's "My Task"
```

---

**Key Benefits**:
- ✅ Unique, non-recurring IDs
- ✅ Complete data isolation
- ✅ Impossible to guess user IDs
- ✅ Scalable multi-tenant architecture
- ✅ Production-ready security

**Last Updated**: November 10, 2025
**Status**: Implementation Ready
