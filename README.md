# Retrieval-Augmented Generation (RAG) Tutorial Project

This is a simple RAG and SEMANTIC SEARCH web application.

## Project Structure

```
rag-demo
├── src
│   ├── server.js            # Entry point of the application
│   ├── modules
│   │   └── gemini.js     # Contains the code to work with Google Gemini API
│   │   └── mongo.js      # Contains the code to work with MongoDB
│   │   └── vector.js     # Contains the code to work with Vector DB
│   ├── routes
│   │   └── rag.js        # Sets up the application route to perform RAG
│   │   └── search.js     # Sets up the application route to perform SEMANTIC SEARCH
├── .env                  # Project environment variables file
└── .env.example          # Project environment variables example file
└── .gitignore            # Git repository ingore file
├── package-lock.json     # npm configuration lock file
├── package.json          # npm configuration file
└── README.md             # Project documentation
```

## Installation

To get started with this project, clone the repository and install the dependencies:

```bash
git clone <repository-url>
cd rag-tutorial
npm install
```

## Usage

To run the application, use the following command:

```bash
npm start
```

The application will be available at `http://localhost:3000`.

RAG tutorial playlist:
https://www.youtube.com/playlist?list=PLAV8ojuG0Tjh2mdLZ3Q4bWqrmrAMrT-pR
