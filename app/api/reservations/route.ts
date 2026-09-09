import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Reservation from '@/models/Reservation';
import Slot from '@/models/Slot';

export async function GET(req: NextRequest) {
  await connectDB();
  const userId = req.nextUrl.searchParams.get('userId');
  const filter = userId ? { userId } : {};
  const reservations = await Reservation.find(filter).populate('slotId');
  return NextResponse.json(reservations);
}

export async function POST(req: NextRequest) {
  await connectDB();
  const body = await req.json();

  const slot = await Slot.findById(body.slotId);
  if (!slot || slot.status === 'reserved') {
    return NextResponse.json({ error: 'Slot not available' }, { status: 400 });
  }

  const reservation = await Reservation.create(body);
  slot.status = 'reserved';
  await slot.save();

  return NextResponse.json(reservation, { status: 201 });
}