import pg from 'pg'
import { initialHotels } from '../src/hotelSlice.js'

const { Pool } = pg

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is required. Copy .env.example to .env and set your PostgreSQL connection string.')
}

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.PGSSL === 'true'
    ? { rejectUnauthorized: process.env.PGSSL_REJECT_UNAUTHORIZED !== 'false' }
    : undefined,
})

pool.on('error', error => {
  console.error('Unexpected PostgreSQL pool error:', error)
})

export async function initializeDatabase() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS hotels (
      id TEXT PRIMARY KEY,
      title VARCHAR(100) NOT NULL,
      location VARCHAR(200) NOT NULL,
      description VARCHAR(800) NOT NULL,
      latitude DOUBLE PRECISION NOT NULL CHECK (latitude BETWEEN -90 AND 90),
      longitude DOUBLE PRECISION NOT NULL CHECK (longitude BETWEEN -180 AND 180),
      price NUMERIC(12, 2) NOT NULL CHECK (price > 0),
      image TEXT NOT NULL,
      image_is_verified BOOLEAN NOT NULL DEFAULT FALSE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `)

  await pool.query(`
    CREATE TABLE IF NOT EXISTS booking_requests (
      id UUID PRIMARY KEY,
      hotel_id TEXT NOT NULL,
      hotel_title VARCHAR(100) NOT NULL,
      hotel_location VARCHAR(200) NOT NULL,
      guest_name VARCHAR(100) NOT NULL,
      guest_email VARCHAR(254) NOT NULL,
      check_in DATE NOT NULL,
      check_out DATE NOT NULL,
      guests SMALLINT NOT NULL CHECK (guests BETWEEN 1 AND 20),
      price_per_night NUMERIC(12, 2) NOT NULL CHECK (price_per_night > 0),
      status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'declined')),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      CHECK (check_out > check_in)
    )
  `)
  await pool.query('CREATE INDEX IF NOT EXISTS booking_requests_created_at_idx ON booking_requests (created_at DESC)')

  const { rows } = await pool.query('SELECT COUNT(*)::int AS count FROM hotels')
  if (rows[0].count !== 0) return

  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    for (const hotel of initialHotels) {
      await client.query(
        `INSERT INTO hotels
          (id, title, location, description, latitude, longitude, price, image, image_is_verified)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [
          `seed-${hotel.id}`, hotel.title, hotel.location, hotel.description,
          hotel.latitude, hotel.longitude, hotel.price, hotel.image, hotel.imageIsVerified,
        ],
      )
    }
    await client.query('COMMIT')
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}
