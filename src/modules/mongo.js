/**
 * MongoDB Connection Module
 * 
 * Manages MongoDB client connections and database/collection access.
 * Implements singleton pattern to maintain a single connection instance.
 */

import { MongoClient } from 'mongodb';
import '@dotenvx/dotenvx/config';

const MONGO_HOST = process.env.MONGO_HOST || 'localhost';
const MONGO_PORT = process.env.MONGO_PORT || '27017';
const MONGO_DB = process.env.MONGO_DB || 'nytc';
const MONGO_COLLECTION_NAME = process.env.MONGO_COLLECTION_NAME || 'nytc';

if (!MONGO_HOST) throw new Error('MONGO_HOST is not defined');
if (!MONGO_PORT) throw new Error('MONGO_PORT is not defined');
if (!MONGO_DB) throw new Error('MONGO_DB is not defined');
if (!MONGO_COLLECTION_NAME) throw new Error('MONGO_COLLECTION_NAME is not defined');

const MONGO_URL = `mongodb://${MONGO_HOST}:${MONGO_PORT}`;

// Singleton instances for MongoDB client and database
let mongoCLientInstance = null;
let dbInstance = null;

/**
 * Get or create a MongoDB client instance
 * 
 * @returns {Promise<MongoClient>} Connected MongoDB client
 */
export async function getMongoClient() {
  if (mongoCLientInstance) return mongoCLientInstance;
  const client = new MongoClient(MONGO_URL);
  await client.connect();
  mongoCLientInstance = client;
  return mongoCLientInstance;
}

/**
 * Get or create a database instance
 * 
 * @returns {Promise<Database>} MongoDB database instance
 */
export async function getDB() {
  if (dbInstance) return dbInstance;
  const client = await getMongoClient();
  const db = client.db(MONGO_DB);
  dbInstance = db;
  return dbInstance;
}

/**
 * Get the target collection from the database
 * 
 * @returns {Promise<Collection>} MongoDB collection instance
 */
export async function getCollection() {
  const db = await getDB();
  return db.collection(MONGO_COLLECTION_NAME);
}

/**
 * Close the MongoDB client connection
 * Clears both client and database instances
 */
export async function closeMongoClient() {
  if (mongoCLientInstance) {
    await mongoCLientInstance.close();
    mongoCLientInstance = null;
    dbInstance = null;
  }
}