
import { MongoClient } from 'mongodb';

const url = "mongodb+srv://samadalamofficialcampus40:root@cluster0.rbabfhi.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const client = new MongoClient(url);

export async function connectDB() {
  try {
    await client.connect();
    console.log("Connected to MongoDB");
    return client.db("tempmail"); // Using 'tempmail' as database name
  } catch (error) {
    console.error("MongoDB connection error:", error);
    throw error;
  }
}

export const db = client;
