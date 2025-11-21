import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import clientPromise from "../../../lib/mongodb";
import { ObjectId } from "mongodb";
import { getUserIdFromRequest } from "../../../lib/auth";

export async function GET(request: NextRequest) {
  try {
    const userId = await getUserIdFromRequest(request);
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const client = await clientPromise;
    const db = client.db("calendarDB");
    const eventsCollection = db.collection("events");
    const tasksCollection = db.collection("tasks");

    // Get today's date in YYYY-MM-DD
    const today = new Date().toISOString().split("T")[0];

    // Fetch all events for this user
    const allEvents = await eventsCollection.find({ userId }).toArray();

    // Filter out those happening today
    const todaysEvents = allEvents.filter(event => event && event.date === today);

    // Move each today's event into the tasks collection (linked to user)
    for (const event of todaysEvents) {
      const task = {
        userId,
        id: `event_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        title: event.title,
        start: event.start || "09:00",
        end: event.end || "10:00",
        date: event.date,
        color: event.color || "bg-green-100 border-l-4 border-green-500",
        createdAt: new Date(),
      };

      await tasksCollection.insertOne(task);
      await eventsCollection.deleteOne({ _id: event._id, userId }); // remove it from events
    }

    // Fetch remaining (future) events for user
    const remainingEvents = await eventsCollection.find({ userId }).toArray();

    return NextResponse.json(remainingEvents);
  } catch (err) {
    console.error("GET /api/events error:", err);
    return NextResponse.json({ error: "Failed to fetch events" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = await getUserIdFromRequest(req);
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const client = await clientPromise;
    const db = client.db("calendarDB");
    const data = await req.json();

    const newEvent = {
      userId,
      _id: new ObjectId(),
      title: data.title,
      date: data.date,
      start: data.start,
      end: data.end,
      color: data.color || "bg-blue-100 border-l-4 border-blue-500",
      description: data.description || "",
      id: data.id || new ObjectId().toHexString(), // keep client id or generate new
    };

    await db.collection("events").insertOne(newEvent);
    return NextResponse.json(newEvent, { status: 201 });
  } catch (err) {
    console.error("POST /api/events error:", err);
    return NextResponse.json({ error: "Failed to save event" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const userId = await getUserIdFromRequest(req);
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const client = await clientPromise;
    const db = client.db("calendarDB");
    const data = await req.json();

    if (!data.id) {
      return NextResponse.json({ error: "Missing event id" }, { status: 400 });
    }

    const query = { $or: [{ _id: data.id }, { id: data.id }], userId };
    const update = {
      $set: {
        title: data.title,
        date: data.date,
        start: data.start,
        end: data.end,
        color: data.color,
        description: data.description,
      },
    };

    const result = await db.collection("events").updateOne(query, update);

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Event not found or unauthorized" }, { status: 403 });
    }

    return NextResponse.json({ message: "Event updated" }, { status: 200 });
  } catch (err) {
    console.error("PUT /api/events error:", err);
    return NextResponse.json({ error: "Failed to update event" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const userId = await getUserIdFromRequest(req);
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const client = await clientPromise;
    const db = client.db("calendarDB");
    const url = new URL(req.url);
    const id = url.searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Missing event id" }, { status: 400 });
    }

    // try to convert id to ObjectId for _id queries
    let query;
    try {
      query = { $or: [{ _id: new ObjectId(id) }, { id: id }], userId };
    } catch {
      query = { id: id, userId }; // fallback to string id if not valid ObjectId
    }
    const result = await db.collection("events").deleteOne(query);

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Event not found or unauthorized" }, { status: 403 });
    }

    return NextResponse.json({ message: "Event deleted" }, { status: 200 });
  } catch (err) {
    console.error("DELETE /api/events error:", err);
    return NextResponse.json({ error: "Failed to delete event" }, { status: 500 });
  }
}