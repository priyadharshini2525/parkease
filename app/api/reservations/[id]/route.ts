
import { NextRequest, NextResponse } from 'next/server';

import connectDB from '@/lib/mongodb';
import Reservation from '@/models/Reservation';
import Slot from '@/models/Slot';

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const { id } = await params;

    const reservation = await Reservation.findById(id);

    if (!reservation) {
      return NextResponse.json(
        { error: 'Reservation not found' },
        { status: 404 }
      );
    }

    if (reservation.status === 'cancelled') {
      return NextResponse.json(
        { error: 'Reservation is already cancelled' },
        { status: 400 }
      );
    }

    // Update only the reservation status.
    // This avoids re-validating older reservations
    // that may not have userName/phoneNumber.
    await Reservation.updateOne(
      { _id: id },
      { $set: { status: 'cancelled' } }
    );

    // Make the parking slot available again
    if (reservation.slotId) {
      await Slot.updateOne(
        { _id: reservation.slotId },
        { $set: { status: 'available' } }
      );
    }

    const updatedReservation = await Reservation.findById(id);

    return NextResponse.json({
      message: 'Reservation cancelled successfully',
      reservation: updatedReservation,
    });
  } catch (error) {
    console.error('Cancel reservation error:', error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Failed to cancel reservation',
      },
      { status: 500 }
    );
  }
}

