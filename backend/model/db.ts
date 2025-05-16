import { MongoClient } from 'mongodb';
import { readFileSync } from 'fs';

export default async function run() {
    const connStr: string = readFileSync('mongo.txt', 'utf8');
    const client = new MongoClient(connStr);
  try {
    await client.connect();
    const db = client.db('raumTest');
    const collection = db.collection('raum');

    // Find the first document in the collection
    const first = await collection.findOne();
    return first;
  } finally {
    // Close the database connection when finished or an error occurs
    await client.close();
  }
}