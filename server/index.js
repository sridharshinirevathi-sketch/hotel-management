import 'dotenv/config'
import express from 'express'
import multer from 'multer'
import { randomUUID } from 'node:crypto'
import { mkdir } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { countNights, BookingValidationError, validateBookingInput } from './bookings.js'
import { initializeDatabase, pool } from './db.js'

const app = express()
const port = Number(process.env.PORT || 3000)
const rootDir = path.dirname(fileURLToPath(import.meta.url))
const uploadsDir = path.join(rootDir, 'uploads')
const frontendDist = path.resolve(rootDir, '../dist')
const mimeExtensions = new Map([
  ['image/jpeg', '.jpg'],
  ['image/png', '.png'],
  ['image/webp', '.webp'],
])

await mkdir(uploadsDir, { recursive: true })
app.disable('x-powered-by')
app.use(express.json({ limit: '100kb' }))
app.use('/uploads', express.static(uploadsDir, { dotfiles: 'deny', index: false }))

const upload = multer({
  storage: multer.diskStorage({
    destination: uploadsDir,
    filename: (_request, file, callback) => callback(null, `${randomUUID()}${mimeExtensions.get(file.mimetype)}`),
  }),
  limits: { fileSize: 5 * 1024 * 1024, files: 1 },
  fileFilter: (_request, file, callback) => {
    if (!mimeExtensions.has(file.mimetype)) return callback(new Error('Upload a JPG, PNG, or WebP hotel photo.'))
    callback(null, true)
  },
})

const hotelColumns = `
  id, title, location, description, latitude, longitude, price::float8 AS price,
  image, image_is_verified AS "imageIsVerified"
`

class HotelValidationError extends Error {}

function validateHotel(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    throw new HotelValidationError('Provide hotel details as a JSON object.')
  }

  const title = typeof input.title === 'string' ? input.title.trim() : ''
  const location = typeof input.location === 'string' ? input.location.trim() : ''
  const description = typeof input.description === 'string' ? input.description.trim() : ''
  const image = typeof input.image === 'string' ? input.image.trim() : ''
  const latitude = Number(input.latitude)
  const longitude = Number(input.longitude)
  const price = Number(input.price)

  if (!title || title.length > 100) throw new HotelValidationError('Hotel name is required and must be 100 characters or fewer.')
  if (!location || location.length > 200) throw new HotelValidationError('Location is required and must be 200 characters or fewer.')
  if (!description || description.length > 800) throw new HotelValidationError('Description is required and must be 800 characters or fewer.')
  if (!Number.isFinite(latitude) || latitude < -90 || latitude > 90) throw new HotelValidationError('Enter a valid latitude between -90 and 90.')
  if (!Number.isFinite(longitude) || longitude < -180 || longitude > 180) throw new HotelValidationError('Enter a valid longitude between -180 and 180.')
  if (!Number.isFinite(price) || price <= 0 || price > 9999999999) throw new HotelValidationError('Price must be greater than zero.')
  if (!image || (!image.startsWith('/uploads/') && !/^https:\/\/\S+$/i.test(image))) {
    throw new HotelValidationError('Hotel photo must be an uploaded image or an HTTPS image URL.')
  }

  return { title, location, description, latitude, longitude, price, image, imageIsVerified: input.imageIsVerified === true }
}

app.get('/api/health', async (_request, response, next) => {
  try {
    await pool.query('SELECT 1')
    response.json({ status: 'ok', database: 'connected' })
  } catch (error) {
    next(error)
  }
})

app.get('/api/hotels', async (_request, response, next) => {
  try {
    const { rows } = await pool.query(`SELECT ${hotelColumns} FROM hotels ORDER BY created_at DESC, title ASC`)
    response.json(rows)
  } catch (error) {
    next(error)
  }
})

app.post('/api/bookings', async (request, response, next) => {
  try {
    const booking = validateBookingInput(request.body)
    const { rows: hotels } = await pool.query(
      'SELECT title, location, price::float8 AS price FROM hotels WHERE id = $1',
      [booking.hotelId],
    )
    if (hotels.length === 0) return response.status(404).json({ error: 'Hotel not found.' })

    const hotel = hotels[0]
    const id = randomUUID()
    const { rows } = await pool.query(
      `INSERT INTO booking_requests
        (id, hotel_id, hotel_title, hotel_location, guest_name, guest_email, check_in, check_out, guests, price_per_night)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING id, hotel_title AS "hotelTitle", check_in AS "checkIn", check_out AS "checkOut",
         guests, price_per_night::float8 AS "pricePerNight", status, created_at AS "createdAt"`,
      [
        id, booking.hotelId, hotel.title, hotel.location, booking.guestName,
        booking.guestEmail, booking.checkIn, booking.checkOut, booking.guests, hotel.price,
      ],
    )
    const nights = countNights(booking.checkIn, booking.checkOut)
    response.status(201).json({ ...rows[0], nights, estimatedTotal: rows[0].pricePerNight * nights })
  } catch (error) {
    if (error instanceof BookingValidationError) {
      return response.status(400).json({ error: error.message })
    }
    next(error)
  }
})

app.post('/api/hotels', async (request, response, next) => {
  try {
    const hotel = validateHotel(request.body)
    const id = randomUUID()
    const { rows } = await pool.query(
      `INSERT INTO hotels (id, title, location, description, latitude, longitude, price, image, image_is_verified)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING ${hotelColumns}`,
      [id, hotel.title, hotel.location, hotel.description, hotel.latitude, hotel.longitude, hotel.price, hotel.image, hotel.imageIsVerified],
    )
    response.status(201).json(rows[0])
  } catch (error) {
    if (error instanceof HotelValidationError) {
      return response.status(400).json({ error: error.message })
    }
    next(error)
  }
})

app.put('/api/hotels/:id', async (request, response, next) => {
  try {
    const hotel = validateHotel(request.body)
    const { rows } = await pool.query(
      `UPDATE hotels
       SET title = $2, location = $3, description = $4, latitude = $5, longitude = $6,
           price = $7, image = $8, image_is_verified = $9
       WHERE id = $1
       RETURNING ${hotelColumns}`,
      [request.params.id, hotel.title, hotel.location, hotel.description, hotel.latitude, hotel.longitude, hotel.price, hotel.image, hotel.imageIsVerified],
    )
    if (rows.length === 0) return response.status(404).json({ error: 'Hotel not found.' })
    response.json(rows[0])
  } catch (error) {
    if (error instanceof HotelValidationError) {
      return response.status(400).json({ error: error.message })
    }
    next(error)
  }
})

app.delete('/api/hotels/:id', async (request, response, next) => {
  try {
    const { rowCount } = await pool.query('DELETE FROM hotels WHERE id = $1', [request.params.id])
    if (rowCount === 0) return response.status(404).json({ error: 'Hotel not found.' })
    response.status(204).end()
  } catch (error) {
    next(error)
  }
})

app.post('/api/uploads', upload.single('image'), (request, response) => {
  if (!request.file) return response.status(400).json({ error: 'Select a hotel photo to upload.' })
  response.status(201).json({ url: `/uploads/${request.file.filename}` })
})

app.use('/api', (_request, response) => {
  response.status(404).json({ error: 'API route not found.' })
})

app.use(express.static(frontendDist))
app.get('/{*path}', (request, response, next) => {
  if (!request.accepts('html')) return next()
  response.sendFile(path.join(frontendDist, 'index.html'), error => {
    if (error) next(error)
  })
})

app.use((error, _request, response, _next) => {
  void _next
  if (error instanceof multer.MulterError) {
    const status = error.code === 'LIMIT_FILE_SIZE' ? 413 : 400
    return response.status(status).json({ error: error.code === 'LIMIT_FILE_SIZE' ? 'Hotel photo must be 5 MB or smaller.' : error.message })
  }
  if (error.message === 'Upload a JPG, PNG, or WebP hotel photo.') {
    return response.status(400).json({ error: error.message })
  }
  if (Number.isInteger(error.status) && error.status < 500) {
    return response.status(error.status).json({ error: error.message })
  }
  console.error('Request failed:', error)
  response.status(500).json({ error: 'An unexpected server error occurred.' })
})

try {
  await initializeDatabase()
  app.listen(port, () => console.log(`Hotel API ready at http://localhost:${port}`))
} catch (error) {
  console.error('Could not start the hotel API:', error)
  await pool.end()
  process.exitCode = 1
}
