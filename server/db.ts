
import { MongoClient } from 'mongodb';

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set. Did you forget to provision a database?");
}

const client = new MongoClient(process.env.DATABASE_URL);

export async function connectDB() {
  try {
    await client.connect();
    console.log("Connected to MongoDB");
    return client.db("tempmail");
  } catch (error) {
    console.error("Could not connect to MongoDB:", error);
    throw error;
  }
}
