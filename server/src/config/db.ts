import mongoose from 'mongoose';

/**
 * Connects to MongoDB using `MONGODB_URI` from the environment.
 * Throws if the variable is missing — `index.ts` exits the process when this rejects.
 */
export async function connectDB(): Promise<void> {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('MONGODB_URI is not defined in environment variables');
  }

  await mongoose.connect(uri);
  console.log('MongoDB connected');
}
