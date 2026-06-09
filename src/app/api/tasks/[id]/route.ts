import { NextRequest, NextResponse } from "next/server";
import clientPromise from "../../../../lib/mongodb";
import { ObjectId } from "mongodb";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    const client = await clientPromise;

    const db = client.db("calendarDB");

    const result = await db.collection("tasks").findOneAndUpdate(
      {
        _id: new ObjectId(id),
      },
      {
        $set: {
          title: body.title,
          start: body.start,
          end: body.end,
          color: body.color,
          date: body.date,
        },
      },
      {
        returnDocument: "after",
      }
    );

    return NextResponse.json(result);

  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { message: "Update failed" },
      { status: 500 }
    );
  }
}