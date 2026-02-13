/**
 * RAG (Retrieval-Augmented Generation) Service
 *
 * Implements RAG search functionality by:
 * 1. Embedding the user's query
 * 2. Finding semantically similar documents from the vector database
 * 3. Using those documents as context to generate a response
 */

import * as gemini from '../modules/gemini.js';
import { getSimilarItems } from '../modules/vector.js';

/**
 * Perform a RAG search
 *
 * Retrieves similar documents based on the query embedding and generates
 * a contextual response using the Gemini API.
 *
 * @param {string} phrase - The user's search query
 * @returns {Promise<object>} Object containing similarities array and RAG response
 * @throws {Error} If phrase is invalid or search fails
 */
export async function search(phrase) {
  if (!phrase || typeof phrase !== "string" || phrase.trim() === "") {
    throw new Error("Invalid phrase provided for search.");
  }

  const taskType = "SEMANTIC_SIMILARITY";

  try {
    // Convert the query phrase into an embedding vector
    const queryEmbedding = await gemini.getQueryEmbedding(phrase, taskType);

    // Find semantically similar documents in vector database
    const results = await getSimilarItems(queryEmbedding);

    // Extract the similar documents to use as context
    const similarities = results.documents[0];

    // Generate a RAG response incorporating the similar documents
    const ragResponse = await gemini.rag(phrase, similarities);

    return { similarities, ragResponse };

  } catch (error) {
    console.error("Error during search:", error);
    throw error;
  }
}