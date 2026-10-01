# NEXUS Productivity Dashboard + AI

## Run locally

1. Install Node.js (LTS).
2. Open this folder in VS Code terminal.
3. Run:
   npm install
4. Create a file named `.env`.
5. Copy `.env.example` into `.env`.
6. Put your OpenAI API key in `.env`:
   OPENAI_API_KEY=your_key_here
7. Start:
   npm start
8. Open:
   http://127.0.0.1:3000

The API key stays on the server and is not placed in browser JavaScript.

## Important

Do not commit `.env` to GitHub. `.gitignore` already excludes it.

GitHub Pages can host the frontend, but it cannot run this Node/Express backend. For a public AI version, deploy the backend to a server platform and point the frontend API URL to that backend.
