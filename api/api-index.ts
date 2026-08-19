import dotenv from 'dotenv';
dotenv.config();

import app from '../src/app';
import { connectDB } from '../src/config/database';

// Connect to DB once (cached across serverless invocations)
let isConnected = false;
const ensureDB = async () => {
  if (!isConnected) {
    await connectDB();
    isConnected = true;
  }
};

export default async function handler(req: any, res: any) {
  await ensureDB();
  return app(req, res);
}