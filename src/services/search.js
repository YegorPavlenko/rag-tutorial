/**
 * Semantic Search Service
 * 
 * Provides semantic similarity search functionality.
 * Finds documents in the vector database that are semantically similar to a query.
 */

import * as gemini from '../modules/gemini.js';
import { getSimilarItems } from '../modules/vector.js';

/**
 * Search for semantically similar content
 * 
 * Embeds the query phrase and retrieves the most similar documents from
 * the vector database based on embedding similarity.
 * 
 * @param {string} phrase - The search query
 * @param {string} taskType - The embedding task type (e.g., 'SEMANTIC_SIMILARITY')
 * @param {number} topK - Number of results to return (default: 5, max: 20)
 * @returns {Promise<object>} Similar items with documents, metadatas, and distances
 * @throws {Error} If phrase or topK are invalid or search fails
 */
export async function searchSimilarContent(phrase, taskType, topK = 5) {
  if (!phrase || typeof phrase !== "string" || phrase.trim() === "") {
    throw new Error("Invalid phrase provided for search.");
  }
  if (typeof topK !== "number" || topK <= 0) {
    throw new Error("topK must be a positive integer.");
  }

  try {
    // Convert the query phrase into an embedding vector
    const queryEmbedding = await gemini.getQueryEmbedding(phrase, taskType);

    // Retrieve the top-K most similar documents from the vector database
    const results = await getSimilarItems(queryEmbedding, topK);

    return results;
  } catch (error) {
    console.error("Error during search:", error);
    throw error;
  }
}