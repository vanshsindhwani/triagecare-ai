import mongoose, { Schema, Document } from "mongoose";

export interface IDepartment extends Document {
  name: string;
  doctor: string;
  words: string[];
}

export const DepartmentSchema = new Schema<IDepartment>({
  name: { type: String, required: true, unique: true },
  doctor: { type: String, required: true },
  words: { type: [String], default: [] },
});

export const Department = mongoose.models.Department || mongoose.model<IDepartment>("Department", DepartmentSchema);
