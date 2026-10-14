import test from 'node:test'
import assert from 'node:assert/strict'
import { BookingValidationError, countNights, validateBookingInput } from './bookings.js'

const validRequest = {
  hotelId: 'hotel-1',
  guestName: 'A Guest',
  guestEmail: 'guest@example.com',
  checkIn: '2027-01-10',
  checkOut: '2027-01-13',
  guests: 2,
}

test('validates and normalizes booking requests', () => {
  assert.deepEqual(validateBookingInput({ ...validRequest, guestName: '  A Guest  ' }, '2027-01-01'), {
    ...validRequest,
    guestName: 'A Guest',
  })
})

test('counts full nights between valid dates', () => {
  assert.equal(countNights('2027-01-10', '2027-01-13'), 3)
})

test('rejects invalid, past, or reversed stay dates', () => {
  for (const dates of [
    { checkIn: '2027-02-30', checkOut: '2027-03-02' },
    { checkIn: '2026-12-31', checkOut: '2027-01-02' },
    { checkIn: '2027-01-10', checkOut: '2027-01-10' },
  ]) {
    assert.throws(
      () => validateBookingInput({ ...validRequest, ...dates }, '2027-01-01'),
      BookingValidationError,
    )
  }
})

test('rejects invalid guest counts and email addresses', () => {
  assert.throws(
    () => validateBookingInput({ ...validRequest, guests: 0 }, '2027-01-01'),
    BookingValidationError,
  )
  assert.throws(
    () => validateBookingInput({ ...validRequest, guestEmail: 'not-an-email' }, '2027-01-01'),
    BookingValidationError,
  )
})
