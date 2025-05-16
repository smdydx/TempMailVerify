
import { MongoClient } from 'mongodb';

const url = "mongodb+srv://samadalamofficialcampus40:root@cluster0.neoxtot.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const client = new MongoClient(url, {
  ssl: true,
  tlsAllowInvalidCertificates: false,
  minPoolSize: 1,
  maxPoolSize: 10,
  tls: true,
  tlsCAFile: undefined,
  serverApi: {
    version: '1',
    strict: true,
    deprecationErrors: true
  }
});

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
