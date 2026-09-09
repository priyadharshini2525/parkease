import { NextRequest, NextResponse } from "next/server";

import connectDB from "@/lib/mongodb";
import Location from "@/models/Location";
import Slot from "@/models/Slot";

export async function GET() {
  try {
    await connectDB();

    const locations = await Location.find({});

    return NextResponse.json(locations);
  } catch (error) {
    console.error("Get Locations Error:", error);

    return NextResponse.json(
      {
        error: "Failed to fetch locations",
      },
      {
        status: 500,
      }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const body = await req.json();

    if (
      !body.name ||
      !body.address ||
      !body.destination ||
      body.totalSlots === undefined ||
      body.latitude === undefined ||
      body.longitude === undefined
    ) {
      return NextResponse.json(
        {
          error:
            "Parking name, address, destination, total slots, latitude and longitude are required.",
        },
        {
          status: 400,
        }
      );
    }

    const totalSlots = Number(body.totalSlots);
    const latitude = Number(body.latitude);
    const longitude = Number(body.longitude);

    if (
      !Number.isFinite(totalSlots) ||
      totalSlots <= 0 ||
      !Number.isFinite(latitude) ||
      !Number.isFinite(longitude)
    ) {
      return NextResponse.json(
        {
          error: "Invalid parking location information.",
        },
        {
          status: 400,
        }
      );
    }

    const location = await Location.create({
      name: body.name,
      address: body.address,
      destination: body.destination,
      totalSlots,
      latitude,
      longitude,
    });

    const slots = [];

    for (let i = 1; i <= totalSlots; i++) {
      slots.push({
        locationId: location._id,
        slotNumber: i,
        status: "available",
      });
    }

    await Slot.insertMany(slots);

    return NextResponse.json(
      {
        success: true,
        location,
        slots,
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error("Create Location Error:", error);

    return NextResponse.json(
      {
        error: "Failed to create location and slots",
      },
      {
        status: 500,
      }
    );
  }
}