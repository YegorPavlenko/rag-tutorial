/**
 * ChromaDB Collection Inspection Script
 * 
 * Simple utility script to retrieve and display the first 3 items
 * from the ChromaDB collection for debugging and verification purposes.
 */

import { getFirst3Items } from "../modules/vector.js";

// Fetch and log the first 3 items in the collection
getFirst3Items().then(items => {
    console.log("First 3 items in the collection:", items);
  })
  .catch(error => {
    console.error("Error fetching items from ChromaDB:", error);
  });