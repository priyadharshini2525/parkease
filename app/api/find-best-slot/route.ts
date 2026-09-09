import { NextRequest, NextResponse } from "next/server";

import connectDB from "@/lib/mongodb";
import Location from "@/models/Location";
import Slot from "@/models/Slot";

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const body = await req.json();

    const destination = String(
      body.destination || ""
    ).trim();

    if (!destination) {
      return NextResponse.json(
        {
          error: "Please enter a destination.",
        },
        {
          status: 400,
        }
      );
    }

    // Find all parking areas belonging to
    // the requested destination.
    const locations = await Location.find({
      destination: {
        $regex: destination,
        $options: "i",
      },
    });

    if (locations.length === 0) {
      return NextResponse.json(
        {
          error:
            "No parking locations found for this destination.",
        },
        {
          status: 404,
        }
      );
    }

    const candidates = [];

    // Check every parking area for live availability.
    for (const location of locations) {
      const availableSlots = await Slot.find({
        locationId: location._id,
        status: "available",
      }).sort({
        slotNumber: 1,
      });

      // Don't recommend a completely full parking area.
      if (availableSlots.length === 0) {
        continue;
      }

      candidates.push({
        location,
        availableSlots,
        availableCount: availableSlots.length,
      });
    }

    if (candidates.length === 0) {
      return NextResponse.json(
        {
          error:
            "All parking locations for this destination are currently full.",
        },
        {
          status: 404,
        }
      );
    }

    /*
      Best parking logic:

      1. Prefer parking areas with more available slots.
      2. If availability is the same, prefer the
         parking area with the smaller slot number.
    */

    candidates.sort((a, b) => {
      return b.availableCount - a.availableCount;
    });

    const best = candidates[0];

    const bestSlot = best.availableSlots[0];

    return NextResponse.json({
      success: true,

      destination: best.location.destination,

      location: {
        id: best.location._id,
        name: best.location.name,
        address: best.location.address,
      },

      slot: {
        id: bestSlot._id,
        slotNumber: bestSlot.slotNumber,
        status: bestSlot.status,
      },

      availableSlots: best.availableCount,

      totalSlots: best.location.totalSlots,

      message:
        "Best parking option found.",
    });
  } catch (error) {
    console.error(
      "Find Best Slot Error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Failed to find the best parking slot.",
      },
      {
        status: 500,
      }
    );
  }
}