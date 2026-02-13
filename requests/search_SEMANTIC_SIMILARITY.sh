curl "http://localhost:3000/search/" \
-H 'Content-Type: application/json' \
-d '{"phrase": "what rumors about?", "taskType": "SEMANTIC_SIMILARITY"}' >> ./outputs/result.json
