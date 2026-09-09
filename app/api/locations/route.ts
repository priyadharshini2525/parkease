import { NextRequest, NextResponse } from 'next/server';

import connectDB from '@/lib/mongodb';
import Location from '@/models/Location';
import Slot from '@/models/Slot';

export async function GET() {
  try {
    await connectDB();

    const locations = await Location.find({});

    return NextResponse.json(locations);
  } catch (error) {
    console.error('Get Locations Error:', error);

    return NextResponse.json(
      { error: 'Failed to fetch locations' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const body = await req.json();

    // Create the location
    const location = await Location.create(body);

    // Automatically create slots based on totalSlots
    const slots = [];

    for (let i = 1; i <= body.totalSlots; i++) {
      slots.push({
        locationId: location._id,
        slotNumber: i,
        status: 'available',
      });
    }

    await Slot.insertMany(slots);

    return NextResponse.json(
      {
        success: true,
        location,
        slots,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create Location Error:', error);

    return NextResponse.json(
      { error: 'Failed to create location and slots' },
      { status: 500 }
    );
  }
}