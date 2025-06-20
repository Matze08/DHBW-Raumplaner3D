import { MongoClient, Db, Collection, Document, Filter } from "mongodb";
import { readFileSync } from "fs";
import dotenv from "dotenv";

// Initialize dotenv at the module level so it's only done once
dotenv.config();

/**
 * Connect to MongoDB and execute an operation with the provided callback
 * @param collectionName Name der Collection, auf die zugegriffen werden soll
 * @param operation A callback function that performs database operations
 * @returns The result of the operation
 */
async function withDatabase<T>(
  collectionName: string,
  operation: (collection: Collection) => Promise<T>
): Promise<T> {
  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri) {
    throw new Error("MONGODB_URI is not defined in .env file");
  }

  const client = new MongoClient(mongoUri);

  try {
    await client.connect();
    const db = client.db("raumplaner");
    const collection = db.collection(collectionName);
    return await operation(collection);
  } finally {
    await client.close();
  }
}

/**
 * Findet ein einzelnes Dokument in einer Collection
 * @param collectionName Name der Collection
 * @param filter Filter für die Suche
 * @returns Das gefundene Dokument oder null
 */
export async function findOne(
  collectionName: string,
  filter: Filter<Document> = {}
) {
  return withDatabase(collectionName, async (collection) => {
    const result = await collection.findOne(filter);
    console.log(`DEBUG | findOne in "${collectionName}" with filter:`, filter);
    console.log(`DEBUG | Result:`, result);
    return result;
  });
}

/**
 * Findet mehrere Dokumente in einer Collection
 * @param collectionName Name der Collection
 * @param filter Filter für die Suche
 * @returns Array der gefundenen Dokumente
 */
export async function find(
  collectionName: string,
  filter: Filter<Document> = {}
) {
  return withDatabase(collectionName, async (collection) => {
    const results = await collection.find(filter).toArray();
    console.log(`DEBUG | find in "${collectionName}" with filter:`, filter);
    console.log(`DEBUG | Found ${results.length} documents`);
    return results;
  });
}

/**
 * Fügt ein Dokument in eine Collection ein
 * @param collectionName Name der Collection
 * @param document Einzufügendes Dokument
 * @returns Ergebnis der Einfügeoperation
 */
export async function insertOne(collectionName: string, document: Document) {
  return withDatabase(collectionName, async (collection) => {
    const result = await collection.insertOne(document);
    console.log(`DEBUG | insertOne in "${collectionName}":`, document);
    return result;
  });
}

/**
 * Aktualisiert ein Dokument in einer Collection
 * @param collectionName Name der Collection
 * @param filter Filter zum Finden des zu aktualisierenden Dokuments
 * @param update Update-Operation
 * @returns Ergebnis der Update-Operation
 */
export async function updateOne(
  collectionName: string,
  filter: Filter<Document>,
  update: Document
) {
  return withDatabase(collectionName, async (collection) => {
    const result = await collection.updateOne(filter, { $set: update });
    console.log(
      `DEBUG | updateOne in "${collectionName}" with filter:`,
      filter
    );
    return result;
  });
}

/**
 * Löscht ein Dokument aus einer Collection
 * @param collectionName Name der Collection
 * @param filter Filter zum Finden des zu löschenden Dokuments
 * @returns Ergebnis der Delete-Operation
 */
export async function deleteOne(
  collectionName: string,
  filter: Filter<Document>
) {
  return withDatabase(collectionName, async (collection) => {
    const result = await collection.deleteOne(filter);
    console.log(
      `DEBUG | deleteOne in "${collectionName}" with filter:`,
      filter
    );
    return result;
  });
}

// Die ursprünglichen Funktionen bleiben für Abwärtskompatibilität erhalten
export async function run() {
  return findOne("raum");
}

export async function getUser(email: string, password: string) {
  return findOne("admin", {
    email: email,
    passwordHash: password,
  });
}

export async function insertUser(
  email: string,
  password: string,
  registeredBy?: string
) {
  return insertOne("admin", {
    email: email,
    passwordHash: password,
    registeredBy: registeredBy || "system",
  });
}
