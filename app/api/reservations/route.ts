
import { NextRequest, NextResponse } from "next/server";

import connectDB from "@/lib/mongodb";
import Reservation from "@/models/Reservation";
import Slot from "@/models/Slot";
import Location from "@/models/Location";

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const userId = req.nextUrl.searchParams.get("userId");

    const filter = userId ? { userId } : {};

    const reservations = await Reservation.find(filter)
      .populate({
        path: "slotId",
        populate: {
          path: "locationId",
          model: Location,
        },
      })
      .sort({ createdAt: -1 });

    return NextResponse.json(reservations);
  } catch (error) {
    console.error("GET reservations error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to load reservations",
      },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const body = await req.json();

    const {
      slotId,
      userId,
      userName,
      phoneNumber,
    } = body;

    if (!slotId || !userId || !userName || !phoneNumber) {
      return NextResponse.json(
        {
          error:
            "Slot ID, user ID, name, and phone number are required",
        },
        { status: 400 }
      );
    }

    const slot = await Slot.findById(slotId);

    if (!slot) {
      return NextResponse.json(
        { error: "Slot not found" },
        { status: 404 }
      );
    }

    if (slot.status === "reserved") {
      return NextResponse.json(
        { error: "Slot not available" },
        { status: 400 }
      );
    }

    const reservation = await Reservation.create({
      slotId,
      userId,
      userName,
      phoneNumber,
    });

    slot.status = "reserved";
    await slot.save();

    return NextResponse.json(
      reservation,
      { status: 201 }
    );
  } catch (error) {
    console.error("POST reservations error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to create reservation",
      },
      { status: 500 }
    );
  }
}

