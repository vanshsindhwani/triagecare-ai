import mongoose, { Schema, Document } from "mongoose";

export interface IReminder extends Document {
  id: number;
  owner: string;
  text: string;
  time: string;
  done: boolean;
}

export const ReminderSchema = new Schema<IReminder>({
  id: { type: Number, required: true },
  owner: { type: String, required: true },
  text: { type: String, required: true },
  time: { type: String, required: true },
  done: { type: Boolean, default: false },
});

export const Reminder = mongoose.models.Reminder || mongoose.model<IReminder>("Reminder", ReminderSchema);
