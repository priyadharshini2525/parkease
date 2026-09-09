import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Slot from '@/models/Slot';
import Reservation from '@/models/Reservation';

export async function POST(req: NextRequest) {
  await connectDB();
  const body = await req.json();
  const { userId } = body;

  const slot = await Slot.findOne({ status: 'available' }).populate('locationId');

  if (!slot) {
    return NextResponse.json({ error: 'No slots available' }, { status: 404 });
  }

  const reservation = await Reservation.create({ slotId: slot._id, userId });
  slot.status = 'reserved';
  await slot.save();

  return NextResponse.json({ reservation, slot });
}