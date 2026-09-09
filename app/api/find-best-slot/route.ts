import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Slot from "@/models/Slot";

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const body = await req.json();
    console.log("Find Best Slot request:", body);

    const bestSlot = await Slot.findOne({
      status: "available",
    })
      .populate("locationId", "name address")
      .sort({ slotNumber: 1 });

    console.log("BEST SLOT:", bestSlot);

    if (!bestSlot) {
      return NextResponse.json(
        { error: "No parking slots are currently available." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      slot: bestSlot,
    });
  } catch (error) {
    console.error("Find Best Slot Error:", error);

    return NextResponse.json(
      { error: "Failed to find the best parking slot." },
      { status: 500 }
    );
  }
}