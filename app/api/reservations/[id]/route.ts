import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Reservation from '@/models/Reservation';
import Slot from '@/models/Slot';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await connectDB();
  const { id } = await params;
  const reservation = await Reservation.findById(id);
  if (!reservation) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  reservation.status = 'cancelled';
  await reservation.save();

  const slot = await Slot.findById(reservation.slotId);
  if (slot) {
    slot.status = 'available';
    await slot.save();
  }

  return NextResponse.json(reservation);
}