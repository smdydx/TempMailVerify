
import { MongoClient } from 'mongodb';

const url = "mongodb+srv://samadalamofficialcampus40:root@cluster0.rbabfhi.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0&ssl=true&tls=true";
const client = new MongoClient(url);

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
