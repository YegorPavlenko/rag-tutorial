/**
 * Gemini API Integration Module
 *
 * Provides functions to interact with Google's Gemini API for:
 * - Creating embeddings for documents and queries
 * - Batch embedding operations
 * - Generating text responses using RAG (Retrieval-Augmented Generation)
 */

import '@dotenvx/dotenvx/config';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL = process.env.GEMINI_API_URL || 'https://api.gemini.com/v1';

const EMBEDDING_METHOD = process.env.EMBEDDING_METHOD || 'embedContent';
const EMBEDDING_BATCH_METHOD = process.env.EMBEDDING_BATCH_METHOD || 'batchEmbedContents';
const EMBEDDING_MODEL = process.env.EMBEDDING_MODEL || 'text-embedding-004';

const GENERATING_MODEL = process.env.GENERATING_MODEL || 'gemini-2.5-flash';
const GENERATING_METHOD = process.env.GENERATING_METHOD || 'generateContent';

const TASK_TYPE_DOCUMENT = process.env.TASK_TYPE_DOCUMENT || 'SEMANTIC_SIMILARITY';
const TASK_TYPE_QUERY = process.env.TASK_TYPE_QUERY || 'SEMANTIC_SIMILARITY';

if (!GEMINI_API_KEY) throw new Error('GEMINI_API_KEY is not defined');
if (!GEMINI_API_URL) throw new Error('GEMINI_API_URL is not defined');
if (!EMBEDDING_MODEL) throw new Error('EMBEDDING_MODEL is not defined');
if (!EMBEDDING_METHOD) throw new Error('EMBEDDING_METHOD is not defined');
if (!EMBEDDING_BATCH_METHOD) throw new Error('EMBEDDING_BATCH_METHOD is not defined');
if (!TASK_TYPE_DOCUMENT) throw new Error('TASK_TYPE_DOCUMENT is not defined');
if (!TASK_TYPE_QUERY) throw new Error('TASK_TYPE_QUERY is not defined');

if (!GENERATING_MODEL) throw new Error('GENERATING_MODEL is not defined');
if (!GENERATING_METHOD) throw new Error('GENERATING_METHOD is not defined');

const API_PATH = `https://${GEMINI_API_URL}${EMBEDDING_MODEL}:${EMBEDDING_METHOD}?key=${GEMINI_API_KEY}`;

const BATCH_API_PATH = `https://${GEMINI_API_URL}${EMBEDDING_MODEL}:${EMBEDDING_BATCH_METHOD}?key=${GEMINI_API_KEY}`;

const GENERATING_API_PATH = `https://${GEMINI_API_URL}${GENERATING_MODEL}:${GENERATING_METHOD}?key=${GEMINI_API_KEY}`;

/**
 * Generate an embedding for a single query phrase
 *
 * @param {string} phrase - The text to embed
 * @param {string} taskType - The task type for embedding (default: SEMANTIC_SIMILARITY)
 * @returns {Promise<number[]>} Array of embedding values
 * @throws {Error} If phrase or taskType is invalid or API request fails
 */
export async function getQueryEmbedding(phrase, taskType = TASK_TYPE_QUERY) {
  if (!phrase || typeof phrase !== "string" || phrase.trim() === "") {
    throw new Error("Invalid phrase provided for embedding.");
  }
  if (!taskType || typeof taskType !== "string" || taskType.trim() === "") {
    throw new Error("Invalid task type provided for embedding.");
  }

  const headers = {
    'Content-Type': 'application/json',
  };

  const payload = {
    model: `models/${EMBEDDING_MODEL}`,
    taskType,
    content: { parts: [{ text: phrase }] },
  };

  try {
    const response = await fetch(API_PATH, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Gemini embedding API error: ${response.status} - ${errorText}`
      );
    }
    const responseData = await response.json();
    const embeddings = responseData.embedding.values;

    if (!embeddings || embeddings.length === 0) {
      throw new Error("No embedding returned from Gemini API.");
    }

    return embeddings;

  } catch (error) {
    console.error("Error fetching Gemini embedding:", error.message);
    throw error;
  }
}

/**
 * Generate embeddings for multiple documents in a batch
 *
 * @param {string[]} textArray - Array of texts to embed
 * @param {string} taskType - The task type for embedding (default: SEMANTIC_SIMILARITY)
 * @returns {Promise<number[][]>} Array of embedding arrays
 * @throws {Error} If API request fails
 */
export async function getBatchEmbedding(textArray, taskType = TASK_TYPE_DOCUMENT) {
  const headers = {
    'Content-Type': 'application/json',
  };

  const payload = {
    requests: textArray.map(text => ({
      model: `models/${EMBEDDING_MODEL}`,
      taskType,
      content: { parts: [{ text }] },
    })),
  };

  try {
    const response = await fetch(BATCH_API_PATH, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Gemini batch embedding API error: ${response.status} - ${errorText}`
      );
    }
    const responseData = await response.json();
    const embeddings = responseData.embeddings.map(item => item.values);

    if (!embeddings || embeddings.length === 0) {
      throw new Error("No embedding returned from Gemini API.");
    }

    return embeddings;

  } catch (error) {
    console.error("Error fetching batch Gemini embedding:", error.message);
    throw error;
  }
}

/**
 * Generate a RAG response using a query and similar documents
 *
 * Combines the user's query with relevant similar documents to generate
 * an informed response using the Gemini text generation model.
 *
 * @param {string} query - The user's search query
 * @param {string[]} similarities - Array of similar documents to use as context
 * @returns {Promise<object>} Response from the Gemini API
 * @throws {Error} If query or similarities are invalid or API request fails
 */
export async function rag(query, similarities) {
  if (!query || typeof query !== "string" || query.trim() === "") {
    throw new Error("Invalid query provided for RAG.");
  }
  if (!similarities || !Array.isArray(similarities) || similarities.length === 0) {
    throw new Error("Invalid similarities provided for RAG.");
  }

  console.log("With similarities:", similarities);
  console.log("RAG query:", query);

  const prompt = `Given the query: "${query}", and the following similar documents: ${JSON.stringify(similarities)}, generate a response that incorporates the relevant information from the similar documents.`;

  const headers = {
    'Content-Type': 'application/json',
    'x-goog-api-key': GEMINI_API_KEY,
  };

  const payload = {
    contents: [
      {
        parts: [
          { text: prompt }
        ],
      },
    ],
  };

  try {
    const response = await fetch(GENERATING_API_PATH, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Gemini Generating API error: ${response.status} - ${errorText}`
      );
    }
    const responseData = await response.json();
/*     const embeddings = responseData.embedding.values;

    if (!embeddings || embeddings.length === 0) {
      throw new Error("No embedding returned from Gemini API.");
    }
 */
    return responseData;

  } catch (error) {
    console.error("Error fetching Gemini generation:", error.message);
    throw error;
  }
}
