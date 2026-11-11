import mongoose, { Schema, Document } from "mongoose";

export interface IVital extends Document {
  id: number;
  owner: string;
  type: string;
  value: string;
  date: string;
}

export const VitalSchema = new Schema<IVital>({
  id: { type: Number, required: true },
  owner: { type: String, required: true },
  type: { type: String, required: true },
  value: { type: String, required: true },
  date: { type: String, required: true },
});

export const Vital = mongoose.models.Vital || mongoose.model<IVital>("Vital", VitalSchema);
