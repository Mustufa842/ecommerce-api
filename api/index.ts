import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import app from '../src/app';

let isConnected = false;

async function connectDB() {
  if (isConnected) return;
  await mongoose.connect(process.env.MONGO_URI as string, {
    serverSelectionTimeoutMS: 5000,
    connectTimeoutMS: 5000,
    socketTimeoutMS: 30000,
    bufferCommands: false,
  });
  isConnected = true;
}

export default async function handler(req: any, res: any) {
  try {
    await connectDB();
  } catch (err) {
    console.error('DB connection failed:', err);
    return (res as any).status(500).json({ status: 'error', message: 'Database connection failed' });
  }
  return (app as any)(req, res);
}