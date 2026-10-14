export class BookingValidationError extends Error {}

function isCalendarDate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const date = new Date(`${value}T00:00:00.000Z`)
  return !Number.isNaN(date.valueOf()) && date.toISOString().slice(0, 10) === value
}

export function countNights(checkIn, checkOut) {
  return (Date.parse(`${checkOut}T00:00:00.000Z`) - Date.parse(`${checkIn}T00:00:00.000Z`)) / 86_400_000
}

export function validateBookingInput(input, today = new Date().toISOString().slice(0, 10)) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    throw new BookingValidationError('Provide booking details as a JSON object.')
  }

  const guestName = typeof input.guestName === 'string' ? input.guestName.trim() : ''
  const guestEmail = typeof input.guestEmail === 'string' ? input.guestEmail.trim() : ''
  const checkIn = input.checkIn
  const checkOut = input.checkOut
  const guests = input.guests
  const hotelId = typeof input.hotelId === 'string' ? input.hotelId.trim() : ''

  if (!guestName || guestName.length > 100) {
    throw new BookingValidationError('Guest name is required and must be 100 characters or fewer.')
  }
  if (!guestEmail || guestEmail.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(guestEmail)) {
    throw new BookingValidationError('Enter a valid email address.')
  }
  if (!isCalendarDate(checkIn) || checkIn < today) {
    throw new BookingValidationError('Check-in must be today or a valid future date.')
  }
  if (!isCalendarDate(checkOut) || checkOut <= checkIn) {
    throw new BookingValidationError('Check-out must be after check-in.')
  }
  if (!Number.isInteger(guests) || guests < 1 || guests > 20) {
    throw new BookingValidationError('Guest count must be between 1 and 20.')
  }
  if (!hotelId || hotelId.length > 100) {
    throw new BookingValidationError('Select a valid hotel.')
  }

  return { guestName, guestEmail, checkIn, checkOut, guests, hotelId }
}
