# FoodEase
React + Vite frontend, Node.js + Express API, and MongoDB.

## Setup
1. Install Node.js 18+ and start MongoDB (local or Atlas).
2. Backend: `cd server`, copy `.env.example` to `.env`, run `npm install`, then `npm run dev`.
3. Frontend: open another terminal, `cd client`, run `npm install`, then `npm run dev`.
4. Open the Vite URL (normally http://localhost:5173). Admin credentials are configured in `server/.env`.

To load the starter menu into an empty database, run `npm run seed:menu` from the `server` folder. The seed command skips the operation if any food items already exist.

To enable Groq-powered Kain-Bot, set `GROQ_API_KEY` in the server environment. Keep the key on the backend only; never add it to the client or commit it. `GROQ_MODEL` optionally selects a Groq chat-completions model and defaults to `openai/gpt-oss-120b`. Without a configured key, Kain-Bot continues to use its built-in menu-based answers.

This is a learning starter. Configure secure secrets before use and do not expose `.env` files.

## Deploy to Vercel

Deploy the frontend and API as two separate Vercel projects from this repository:

1. Create a Vercel project with the project root set to `server`. Vercel detects the Express app exported from `app.js`. Add these Environment Variables in Vercel:
   - `MONGODB_URI`: your MongoDB Atlas connection URI, including the `foodease_ni_rene` database name.
   - `JWT_SECRET`: a long, randomly generated secret.
   - `ADMIN_USERNAME` and `ADMIN_PASSWORD`: your production admin credentials.
   - `CLIENT_ORIGIN`: the exact deployed frontend origin, such as `https://your-store.vercel.app`. Multiple comma-separated origins are supported.
   - `GROQ_API_KEY` (optional) and `GROQ_MODEL` (optional).
2. Deploy the API project. Its Vercel URL is the API host.
3. Create a second Vercel project with the project root set to `client`. Set `VITE_API_URL` to the deployed API URL plus `/api`, for example `https://your-api.vercel.app/api`, then deploy the frontend.
4. Add the Atlas database user and allow the deployed API to reach the cluster in Atlas Network Access. Use a strong, dedicated database password. If the Atlas network policy requires `0.0.0.0/0` for Vercel access, use a least-privilege database user and strong credentials.
5. If the Atlas database is empty, run `npm run seed:menu` from `server` with `MONGODB_URI` set to the Atlas URI. The seed command skips databases that already contain food items.

The frontend uses `http://localhost:5000/api` only during local development. A production deployment requires `VITE_API_URL`, and the serverless Express app connects using `MONGODB_URI` before handling API requests; it does not depend on a local MongoDB process. Redeploy the frontend whenever its `VITE_API_URL` changes.
