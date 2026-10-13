# Havenstay Hotel Management

Hotel listings frontend built with React, Redux Toolkit, and Vite, backed by a Node.js/Express API and PostgreSQL.

## Requirements

- Node.js 20.19+ or 22.12+
- PostgreSQL 14+

## Run locally

1. Create a PostgreSQL database:

   ```powershell
   psql -U postgres -c "CREATE DATABASE hotel_management;"
   ```

2. Copy `.env.example` to `.env` and set `DATABASE_URL` to match your PostgreSQL username, password, host, port, and database. Keep `.env` private; it is ignored by Git.

   ```text
   DATABASE_URL=postgresql://postgres:your_password@localhost:5432/hotel_management
   PORT=3000
   PGSSL=false
   ```

3. Install dependencies and start both the API and frontend:

   ```powershell
   npm install
   npm run dev
   ```

   Vite runs the frontend at `http://localhost:5173` and proxies `/api` and `/uploads` to Express at `http://localhost:3000`.

On first startup, Express creates the `hotels` table and inserts the built-in hotel collection only when the table is empty. Removing a seeded hotel will not cause it to be reinserted on later restarts.

## Production

Set `DATABASE_URL` (and `PGSSL=true` when required by the hosted PostgreSQL provider), build the frontend, then start Express:

```powershell
npm run build
npm start
```

Express serves the built frontend, API, and uploaded hotel photos from the same origin. For production deployments with multiple instances, store uploaded images in shared object storage rather than the local `server/uploads` directory.

## API routes

| Method | Route | Purpose |
| --- | --- | --- |
| `GET` | `/api/health` | Check API and PostgreSQL connectivity |
| `GET` | `/api/hotels` | List hotel records |
| `POST` | `/api/hotels` | Create a hotel |
| `PUT` | `/api/hotels/:id` | Update a hotel |
| `DELETE` | `/api/hotels/:id` | Delete a hotel |
| `POST` | `/api/uploads` | Upload a JPG, PNG, or WebP photo (up to 5 MB) |

The app displays illustrative nightly prices and town-level coordinates for the sample collection; confirm current prices and exact property addresses before using them for bookings.
