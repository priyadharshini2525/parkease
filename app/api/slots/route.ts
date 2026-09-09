
import { NextRequest, NextResponse } from 'next/server';

import connectDB from '@/lib/mongodb';
import Slot from '@/models/Slot';

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const locationId = req.nextUrl.searchParams.get('locationId');

    // If no locationId is provided, return all slots
    if (!locationId) {
      const slots = await Slot.find({}).sort({ slotNumber: 1 });

      return NextResponse.json(slots, { status: 200 });
    }

    // Get slots belonging to this location
    const slots = await Slot.find({
      locationId: locationId,
    }).sort({ slotNumber: 1 });

    return NextResponse.json(slots, { status: 200 });
  } catch (error) {
    console.error('GET /api/slots error:', error);

    return NextResponse.json(
      {
        message: 'Failed to fetch slots',
        error:
          error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const body = await req.json();

    console.log('Creating slot:', body);

    if (!body.locationId) {
      return NextResponse.json(
        {
          message: 'locationId is required',
        },
        { status: 400 }
      );
    }

    if (body.slotNumber === undefined || body.slotNumber === null) {
      return NextResponse.json(
        {
          message: 'slotNumber is required',
        },
        { status: 400 }
      );
    }

    const slot = await Slot.create({
      locationId: body.locationId,
      slotNumber: body.slotNumber,
      status: body.status || 'available',
    });

    return NextResponse.json(slot, { status: 201 });
  } catch (error) {
    console.error('POST /api/slots error:', error);

    return NextResponse.json(
      {
        message: 'Failed to create slot',
        error:
          error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

