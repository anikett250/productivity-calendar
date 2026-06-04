import { NextRequest, NextResponse } from "next/server";
import clientPromise from "../../../lib/mongodb";
import { ObjectId } from "mongodb";

const DB_NAME = "calendarDB";
const COLLECTION = "events";


// GET ALL EVENTS
export async function GET() {
  try {
    const client = await clientPromise;

    const db = client.db(DB_NAME);

    const events = await db
      .collection(COLLECTION)
      .find({})
      .toArray();

    return NextResponse.json(events);

  } catch (err) {
    console.error("GET ERROR:", err);

    return NextResponse.json(
      { message: "Failed to fetch events" },
      { status: 500 }
    );
  }
}


// CREATE EVENT
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const client = await clientPromise;

    const db = client.db(DB_NAME);

    const result = await db
      .collection(COLLECTION)
      .insertOne(body);

    const createdEvent = {
      ...body,
      _id: result.insertedId,
    };

    return NextResponse.json(createdEvent);

  } catch (err) {
    console.error("POST ERROR:", err);

    return NextResponse.json(
      { message: "Failed to create event" },
      { status: 500 }
    );
  }
}


// UPDATE EVENT
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();

    const client = await clientPromise;

    const db = client.db(DB_NAME);

    const updatedEvent = await db
      .collection(COLLECTION)
      .findOneAndUpdate(
        {
          _id: new ObjectId(body.id),
        },
        {
          $set: {
            title: body.title,
            date: body.date,
            start: body.start,
            end: body.end,
            color: body.color,
            description: body.description,
          },
        },
        {
          returnDocument: "after",
        }
      );

    return NextResponse.json(updatedEvent);

  } catch (err) {
    console.error("PUT ERROR:", err);

    return NextResponse.json(
      { message: "Failed to update event" },
      { status: 500 }
    );
  }
}


// DELETE EVENT
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { message: "Missing ID" },
        { status: 400 }
      );
    }

    const client = await clientPromise;

    const db = client.db(DB_NAME);

    await db.collection(COLLECTION).deleteOne({
      _id: new ObjectId(id),
    });

    return NextResponse.json({
      message: "Deleted successfully",
    });

  } catch (err) {
    console.error("DELETE ERROR:", err);

    return NextResponse.json(
      { message: "Failed to delete event" },
      { status: 500 }
    );
  }
}