/**
 * RAG Route Handler
 * 
 * Defines the HTTP endpoint for RAG (Retrieval-Augmented Generation) searches.
 * Routes POST requests to the RAG service for processing searches with context.
 */

import express from 'express';

/**
 * Create and return the RAG router
 * 
 * @param {object} ragService - Service module with search function
 * @returns {Router} Express router for RAG endpoints
 */
export function createRAGRouter(ragService) {
    const router = express.Router();

    // Handle POST requests at /rag endpoint
    router.post('/', async (req, res) => {
        let { phrase } = req.body;

        // Validate required search phrase parameter
        if (!phrase) return res.status(400).json({ error: 'Missing search phrase' });

        try {
            // Perform RAG search with the provided phrase
            const results = await ragService.search(phrase);
            res.json(results);
        } catch (error) {
            console.error('Search error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    });

    return router;
}
