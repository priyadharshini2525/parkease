import mongoose, { Schema, Document } from 'mongoose';

interface IReservation extends Document {
  slotId: mongoose.Types.ObjectId;
  userId: string;
  reservedAt: Date;
  status: 'active' | 'cancelled';
}

const ReservationSchema: Schema = new Schema({
  slotId: { type: Schema.Types.ObjectId, ref: 'Slot', required: true },
  userId: { type: String, required: true },
  reservedAt: { type: Date, default: Date.now },
  status: { type: String, enum: ['active', 'cancelled'], default: 'active' },
});

export default mongoose.models.Reservation || mongoose.model<IReservation>('Reservation', ReservationSchema);