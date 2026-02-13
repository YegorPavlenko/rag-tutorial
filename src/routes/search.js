/**
 * Search Route Handler
 *
 * Defines HTTP endpoints for semantic similarity search operations.
 * Routes POST requests to the search service for finding similar content.
 */

import express from 'express';

/**
 * Create and return the search router
 *
 * @param {object} searchService - Service module with searchSimilarContent function
 * @returns {Router} Express router for search endpoints
 */
export function createSearchRouter(searchService) {
    const router = express.Router();

    // Handle POST requests at /search endpoint
    router.post('/', async (req, res) => {
        let { phrase, taskType, topK = 5 } = req.body;

        // Validate required parameters
        if (!phrase) return res.status(400).json({ error: 'Missing search phrase' });
        if (!taskType) return res.status(400).json({ error: 'Missing task type' });

        // Enforce a maximum of 20 results per request
        // Bad practice! For educational purposes only! Client should not be able to request an unbounded number of results! NEVER do this in production
        if (topK > 20) topK = 20;

        try {
            // Perform semantic similarity search
            const results = await searchService.searchSimilarContent(phrase, taskType, topK);
            res.json(results);
        } catch (error) {
            console.error('Search error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    });

    return router;
}
