import mongoose, { Schema, Document } from "mongoose";

export interface IAppointment extends Document {
  id: string;
  patient: string;
  phone?: string;
  problem: string;
  department: string;
  doctor: string;
  priority: "High" | "Medium" | "Low";
  slot: string;
  fee: number;
  paid: boolean;
  status: "Booked" | "In Progress" | "Completed";
  bookedAt: string;
}

export const AppointmentSchema = new Schema<IAppointment>({
  id: { type: String, required: true, unique: true },
  patient: { type: String, required: true },
  phone: { type: String, default: "" },
  problem: { type: String, required: true },
  department: { type: String, required: true },
  doctor: { type: String, required: true },
  priority: { type: String, enum: ["High", "Medium", "Low"], default: "Low" },
  slot: { type: String, required: true },
  fee: { type: Number, default: 300 },
  paid: { type: Boolean, default: true },
  status: { type: String, enum: ["Booked", "In Progress", "Completed"], default: "Booked" },
  bookedAt: { type: String, required: true },
});

export const Appointment = mongoose.models.Appointment || mongoose.model<IAppointment>("Appointment", AppointmentSchema);
