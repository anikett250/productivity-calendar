import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import clientPromise from "../../../lib/mongodb";
import { ObjectId, Filter, UpdateFilter, Document } from "mongodb";
import { getUserIdFromRequest } from "../../../lib/auth";

export async function GET(request: NextRequest) {
  try {
    const userId = await getUserIdFromRequest(request);
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const client = await clientPromise;
    const db = client.db("calendarDB");
    const todos = await db.collection("todos").find({ userId }).toArray();
    return NextResponse.json(todos);
  } catch (err) {
    console.error("GET /api/todos error:", err);
    return NextResponse.json({ error: "Failed to fetch todos" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = await getUserIdFromRequest(req);
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const client = await clientPromise;
    const db = client.db("calendarDB");
    const data = await req.json();

    const newTodo = {
      userId,
      text: data.text,
      completed: data.completed ?? false,
      comments: data.comments ?? 0,
      time: data.time || "0",
      date:
        data.date ||
        new Date().toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }),
      label: data.label || "Dev",
      start: data.start || null,
      end: data.end || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Insert Todo
    const result = await db.collection("todos").insertOne(newTodo);

    // If Todo has start & end, also create a matching calendar event (linked to user)
    if (data.start && data.end) {
      const calendarEvent = {
        userId,
        id: `task_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        title: data.text,
        start: data.start,
        end: data.end,
        date: new Date().toISOString().split("T")[0],
        color: "bg-blue-100 border-l-4 border-blue-500",
        createdAt: new Date(),
      };

      await db.collection("tasks").insertOne(calendarEvent);
    }

    return NextResponse.json({ ...newTodo, _id: result.insertedId }, { status: 201 });
  } catch (err) {
    console.error("POST /api/todos error:", err);
    return NextResponse.json({ error: "Failed to save todo" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const userId = await getUserIdFromRequest(req);
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const client = await clientPromise;
    const db = client.db("calendarDB");
    const data = await req.json();

    if (!data._id && !data.id) {
      return NextResponse.json({ error: "Missing todo id" }, { status: 400 });
    }

    // Build query to match by ObjectId or string id, plus userId ownership
    let query: Record<string, unknown>;
    try {
      query = { _id: new ObjectId(data._id || data.id), userId };
    } catch {
      query = { id: data.id || data._id, userId };
    }

    const setFields: Record<string, unknown> = { updatedAt: new Date() };
    if (data.text !== undefined) setFields.text = data.text;
    if (typeof data.completed === 'boolean') setFields.completed = data.completed;
    if (data.time !== undefined) setFields.time = data.time;
    if (data.date !== undefined) setFields.date = data.date;
    if (data.label !== undefined) setFields.label = data.label;

    const update = { $set: setFields };

    const result = await db.collection("todos").updateOne(query as Filter<Document>, update as UpdateFilter<Document>);

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Todo not found or unauthorized" }, { status: 403 });
    }

    return NextResponse.json({ success: true, modifiedCount: result.modifiedCount });
  } catch (err) {
    console.error("PUT /api/todos error:", err);
    return NextResponse.json({ error: "Failed to update todo" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const userId = await getUserIdFromRequest(req);
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const client = await clientPromise;
    const db = client.db("calendarDB");
    const { id, text, start, end } = await req.json();

    let deletedTodo = null;

    // Handle both ObjectId and string IDs safely and enforce ownership
    if (id) {
      try {
        deletedTodo = await db.collection("todos").deleteOne({ _id: new ObjectId(id), userId });
      } catch {
        deletedTodo = await db.collection("todos").deleteOne({ id, userId }); // fallback
      }
    } else if (text) {
      deletedTodo = await db.collection("todos").deleteOne({ text, userId });
    }

    // Also delete matching calendar task (owned by user)
    if (start && end) {
      await db.collection("tasks").deleteOne({
        title: text,
        start,
        end,
        userId,
      });
    }

    return NextResponse.json({ success: true, deletedCount: deletedTodo?.deletedCount || 0 });
  } catch (err) {
    console.error("DELETE /api/todos error:", err);
    return NextResponse.json({ error: "Failed to delete todo" }, { status: 500 });
  }
}
