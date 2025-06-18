import { MongoClient } from 'mongodb';
import { readFileSync } from 'fs';
import dotenv from "dotenv";


export async function run() {
  dotenv.config();
  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri) {
    throw new Error("MONGODB_URI is not defined in .env file");
  }

  const client = new MongoClient(mongoUri);
  try {
    await client.connect();
    const db = client.db("raumTest");
    const collection = db.collection("raum");

    // Find the first document in the collection
    const first = await collection.findOne();
    return first;
  } finally {
    // Close the database connection when finished or an error occurs
    await client.close();
  }
}

export async function getUser(email: string, password: string) {
  dotenv.config();
  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri) {
    throw new Error("MONGODB_URI is not defined in .env file");
  }

  const client = new MongoClient(mongoUri);
  try {
    await client.connect();
    const db = client.db("raumTest");
    const collection = db.collection("users");

    // Find the user with the given email and password
    const user = await collection.findOne({ email, password });
    return user;
  } finally {
    // Close the database connection when finished or an error occurs
    await client.close();
  }
}