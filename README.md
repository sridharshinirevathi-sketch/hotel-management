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
   VITE_API_URL=
   FRONTEND_URL=http://localhost:5173
   ```

3. Install dependencies and start both the API and frontend:

   ```powershell
   npm install
   npm run dev
   ```

   Vite runs the frontend at `http://localhost:5173` and proxies `/api` and `/uploads` to Express at `http://localhost:3000`.

For separate Render frontend and backend services, set `VITE_API_URL` on the frontend service to the backend's public base URL (for example, `https://your-api.onrender.com`). Set `FRONTEND_URL` on the backend service to the frontend's public origin (for example, `https://your-site.onrender.com`, without a trailing slash). Multiple allowed frontend origins can be comma-separated. `VITE_API_URL` is used at build time, so redeploy the frontend after changing it; redeploy the backend after changing `FRONTEND_URL`.

On first startup, Express creates the `hotels` table and inserts the built-in hotel collection only when the table is empty. Removing a seeded hotel will not cause it to be reinserted on later restarts.

## Deploy to Render

The root `render.yaml` defines a Node web service and a free Render Postgres database. In Render, choose **New → Blueprint**, connect this repository, review the services and free plans, and apply the Blueprint. Render supplies the database connection string to the web service; the API initializes its tables on startup. The Express service serves the built React app and its client-side routes, so deploy it as a **Web Service**, not as a Static Site.

Render's free Postgres databases expire 30 days after creation and are deleted after the subsequent 14-day upgrade grace period. They have no backups and are for testing/hobby use, not production. Upgrade the database before expiry if its data needs to persist. Free web services may sleep when idle.

Render free web services use an ephemeral filesystem. Hotel photos uploaded to `server/uploads` can disappear on restart, sleep, or redeploy; use persistent object storage if uploaded photos must remain available.

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
| `POST` | `/api/bookings` | Save a pending booking request (no payment) |

Booking requests store guest contact details and stay dates in PostgreSQL. The app does not track room inventory, confirm availability, collect payment, or expose a public endpoint for reading requests. Requests remain pending until the property confirms them directly; without an admin login, operators must review them through a restricted database connection:

```sql
SELECT id, hotel_title, guest_name, guest_email, check_in, check_out, guests, status, created_at
FROM booking_requests
ORDER BY created_at DESC;

UPDATE booking_requests
SET status = 'confirmed'
WHERE id = 'request-uuid';
```

Use `declined` instead of `confirmed` when the property cannot accept a request. Keep database access restricted.

The sample collection's nightly prices are illustrative and its coordinates are town-level, not exact property addresses. Price searches match available room rates; the reference price is not used for price-range filtering. The hotel detail page can request your browser location to show the approximate direct distance and a driving route. Route calculation shares your coordinates with the public OSRM routing service; town-level hotel coordinates can place the route endpoint away from the actual property. Verify prices, availability, and street addresses with each hotel before making travel plans.
