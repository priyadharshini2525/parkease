import { NextRequest, NextResponse } from "next/server";

import connectDB from "@/lib/mongodb";
import Location from "@/models/Location";
import Slot from "@/models/Slot";

function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
) {
  const earthRadius = 6371;

  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return earthRadius * c;
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const body = await req.json();

    const userLatitude = Number(body.latitude);
    const userLongitude = Number(body.longitude);

    if (
      !Number.isFinite(userLatitude) ||
      !Number.isFinite(userLongitude)
    ) {
      return NextResponse.json(
        {
          error: "Valid user location is required.",
        },
        { status: 400 }
      );
    }

    // Get every registered parking location
    const locations = await Location.find({});

    if (locations.length === 0) {
      return NextResponse.json(
        {
          error: "No parking locations are available.",
        },
        { status: 404 }
      );
    }

    const candidates = [];

    for (const location of locations) {
      // Find available slots at this location
      const availableSlots = await Slot.find({
        locationId: location._id,
        status: "available",
      }).sort({ slotNumber: 1 });

      // Ignore locations with no available slots
      if (availableSlots.length === 0) {
        continue;
      }

      const distance = calculateDistance(
        userLatitude,
        userLongitude,
        location.latitude,
        location.longitude
      );

      candidates.push({
        location,
        availableSlots,
        availableCount: availableSlots.length,
        distance,
      });
    }

    if (candidates.length === 0) {
      return NextResponse.json(
        {
          error: "No parking slots are currently available.",
        },
        { status: 404 }
      );
    }

    /*
      Ranking logic:

      1. Prefer the closest parking location.
      2. If two locations are almost equally close,
         prefer the one with more available slots.
    */

    candidates.sort((a, b) => {
      const distanceDifference = a.distance - b.distance;

      if (Math.abs(distanceDifference) < 0.5) {
        return b.availableCount - a.availableCount;
      }

      return distanceDifference;
    });

    const best = candidates[0];

    const bestSlot = best.availableSlots[0];

    return NextResponse.json({
      success: true,

      location: {
        id: best.location._id,
        name: best.location.name,
        address: best.location.address,
        latitude: best.location.latitude,
        longitude: best.location.longitude,
      },

      slot: {
        id: bestSlot._id,
        slotNumber: bestSlot.slotNumber,
        status: bestSlot.status,
      },

      distance: Number(best.distance.toFixed(2)),

      availableSlots: best.availableCount,

      message: "Best parking slot found.",
    });
  } catch (error) {
    console.error("Find Best Slot Error:", error);

    return NextResponse.json(
      {
        error: "Failed to find the best parking slot.",
      },
      { status: 500 }
    );
  }
}