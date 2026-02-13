/**
 * Main Express Server
 *
 * This is the entry point for the RAG (Retrieval-Augmented Generation) tutorial application.
 * Sets up Express middleware and routes for RAG and semantic search functionality.
 */

import express from 'express';
import { createRAGRouter } from './routes/rag.js';
import { createSearchRouter } from './routes/search.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Parse incoming JSON and URL-encoded request bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Mount RAG service router at /rag endpoint
app.use('/rag', createRAGRouter(await import('./services/rag.js')));

// Mount search service router at /search endpoint
app.use('/search', createSearchRouter(await import('./services/search.js')));

// Start the Express server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});