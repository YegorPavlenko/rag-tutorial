/**
 * ChromaDB Vector Database Module
 * 
 * Manages interactions with ChromaDB for storing and querying vector embeddings.
 * Provides functions for upserting embeddings and performing similarity searches.
 */

import { ChromaClient } from "chromadb";
import '@dotenvx/dotenvx/config';

const VECTOR_COLLECTION_NAME = process.env.VECTOR_COLLECTION_NAME || 'nytc';

// Initialize ChromaDB client and get or create the collection
const client = new ChromaClient();
const collection = client.getOrCreateCollection({name: VECTOR_COLLECTION_NAME, embeddingFunction: null});

/**
 * Upsert (update or insert) embeddings into the vector database
 * 
 * @param {string[]} ids - Unique identifiers for the documents
 * @param {number[][]} embeddings - Vector embeddings for each document
 * @param {object[]} metadatas - Metadata objects associated with documents
 * @param {string[]} documents - Original document texts
 */
export async function upsertEmbeddings(ids, embeddings, metadatas, documents) {
  try {
    await (await collection).upsert({
      ids,
      embeddings,
      metadatas,
      documents,
    });
    console.log(`Upserted ${documents.length} embeddings to ChromaDB.`);
  } catch (error) {
    console.error("Error upserting embeddings to ChromaDB:", error);
  }
}

/**
 * Retrieve the first 3 items from the collection
 * Useful for testing and verification
 * 
 * @returns {Promise<object>} Items with documents, metadatas, and embeddings
 */
export async function getFirst3Items() {
  return (await collection).get({ limit: 3, include: ["documents", "metadatas", "embeddings"], });
}

/**
 * Search for items similar to a query embedding
 * 
 * @param {number[]} queryEmbedding - The query vector embedding
 * @param {number} nResults - Number of results to return (default: 5, max: 20)
 * @returns {Promise<object>} Similar items with documents, metadatas, and distances
 * @throws {Error} If query embedding or nResults are invalid
 */
export async function getSimilarItems(queryEmbedding, nResults = 5) {
  if (!Array.isArray(queryEmbedding) || queryEmbedding.length === 0) {
    throw new Error("Invalid query embedding provided.");
  }
  if (typeof nResults !== "number" || nResults <= 0) {
    throw new Error("nResults must be a positive integer.");
  }

  try {
    const result = await (await collection).query({
      queryEmbeddings: [queryEmbedding],
      nResults,
      include: ["metadatas", "documents", "distances"],
    });

    if (!result) {
      throw new Error("No results returned from ChromaDB.");
    }

    return result;
  } catch (error) {
    console.error("Error querying ChromaDB:", error);
    throw error;
  }
}