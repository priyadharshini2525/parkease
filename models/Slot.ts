import mongoose, { Schema, Document } from 'mongoose';

interface ISlot extends Document {
  locationId: mongoose.Types.ObjectId;
  slotNumber: number;
  status: 'available' | 'reserved';
}

const SlotSchema: Schema = new Schema({
  locationId: { type: Schema.Types.ObjectId, ref: 'Location', required: true },
  slotNumber: { type: Number, required: true },
  status: { type: String, enum: ['available', 'reserved'], default: 'available' },
});

export default mongoose.models.Slot || mongoose.model<ISlot>('Slot', SlotSchema);