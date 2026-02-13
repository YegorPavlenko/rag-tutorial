curl "http://localhost:3000/rag/" \
-H 'Content-Type: application/json' \
-d '{"phrase": "What commented people about rumors?"}' >> ./outputs/rag_result.json
