import mongoose, { Schema, Document } from "mongoose";

interface ILocation extends Document {
  name: string;
  address: string;
  totalSlots: number;
  latitude: number;
  longitude: number;
}

const LocationSchema: Schema = new Schema({
  name: {
    type: String,
    required: true,
  },

  address: {
    type: String,
    required: true,
  },

  totalSlots: {
    type: Number,
    required: true,
  },

  latitude: {
    type: Number,
    required: true,
  },

  longitude: {
    type: Number,
    required: true,
  },
});

export default mongoose.models.Location ||
  mongoose.model<ILocation>("Location", LocationSchema);