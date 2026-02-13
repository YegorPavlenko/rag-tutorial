/**
 * Embedding Creation Script
 * 
 * Processes documents from MongoDB, generates embeddings using the Gemini API,
 * and stores them in ChromaDB. Handles batch processing with configurable batch size.
 */

import assert from 'node:assert';

import { getCollection } from "../modules/mongo.js";
import { getBatchEmbedding } from "../modules/gemini.js";
import { upsertEmbeddings } from "../modules/vector.js";

import '@dotenvx/dotenvx/config';

/**
 * Main function to create embeddings from MongoDB documents
 * 
 * Retrieves documents from MongoDB in batches, generates their embeddings
 * via the Gemini API, and upserts them into ChromaDB along with metadata.
 */
async function createEmbeddings() {
  try {
    const collection = await getCollection();

    // Configuration parameters from environment
    const batchSize = parseInt(process.env.BATCH_SIZE, 10) || 100;
    const GET_EMBEDDINGS_TIMEOUT = parseInt(process.env.GET_EMBEDDINGS_TIMEOUT, 10) || 2_000;

    let comments = [];
    let counter = 0;

    // Define which MongoDB fields to retrieve
    const projection = {
      articleID: 1,
      commentBody: 1,
      commentID: 1,
      newDesk: 1,
      sectionName: 1,
      userDisplayName: 1,
      userID: 1,
      userLocation: 1,
      typeOfMaterial: 1,
      _id: 0, // exclude MongoDB _id unless you want it
    };

    // Retrieve documents from MongoDB with specified projection and batch size
    const cursor = collection.find({}).project(projection).batchSize(batchSize);

    // Process documents from cursor
    while (await cursor.hasNext()) {
      const batch = await cursor.next();
      comments.push(batch);

      // Process batch when size threshold is reached
      if (comments.length >= batchSize) {
        counter++;
        console.log(`Processing batch #${counter} of ${comments.length} documents`);
        await processBatch(comments);
        comments = [];
        // Add delay between batches to avoid API rate limiting
        await new Promise(resolve => setTimeout(resolve, GET_EMBEDDINGS_TIMEOUT));
      }
    }

    // Process any remaining documents that didn't fill a complete batch
    if (comments.length > 0) {
      counter++;
      console.log(`Processing final batch #${counter} of ${comments.length} documents`);
      await processBatch(comments);
    }
  } catch (error) {
    console.error("Error during embedding creation:", error);
  }
}

/**
 * Process a batch of documents and store their embeddings
 * 
 * Creates embeddings for a batch of comment texts using the Gemini API,
 * then upserts them into ChromaDB with associated metadata.
 * 
 * @param {object[]} comments - Array of comment documents from MongoDB
 */
async function processBatch(comments) {
  console.log(`Creating embeddings for ${comments.length} comments...`);

  // Generate embeddings for all comment texts in the batch
  const embeddings = await getBatchEmbedding(comments.map(c => c.commentBody));

  console.log(`Created ${embeddings.length} embeddings.`);
  console.log(`Difference: `, comments.length - embeddings.length);

  // Verify that embeddings were created for all comments
  assert.equal(embeddings.length, comments.length, "Mismatch between comments and embeddings count");

  // Store embeddings and metadata in ChromaDB
  await upsertEmbeddings(
    comments.map(c => c.commentID),
    embeddings,
    comments.map(c => ({
      articleID: c.articleID,
      newDesk: c.newDesk,
      sectionName: c.sectionName,
      userDisplayName: c.userDisplayName,
      userID: c.userID,
      userLocation: c.userLocation,
      typeOfMaterial: c.typeOfMaterial,
    })),
    comments.map(c => c.commentBody),
  );
}

// Execute the embedding creation process
creatEmbeddings()
  .then(() => {
    console.log("Embedding creation process completed.");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Error in embedding creation process:", error);
    process.exit(1);
  });
