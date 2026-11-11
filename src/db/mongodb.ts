import mongoose from "mongoose";

let isConnected = false;

export async function connectToDatabase(): Promise<boolean> {
  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri) {
    console.log("[Database] MONGODB_URI not configured. Operating in local persistent storage adapter mode.");
    isConnected = false;
    return false;
  }

  try {
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 2000,
    });
    isConnected = true;
    console.log("[Database] Successfully connected to MongoDB cluster.");
    return true;
  } catch (err) {
    console.warn("[Database] MongoDB connection failed. Falling back to persistent storage engine.", err instanceof Error ? err.message : err);
    isConnected = false;
    return false;
  }
}

export function isMongoConnected(): boolean {
  return isConnected && mongoose.connection.readyState === 1;
}
