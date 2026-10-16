import test from 'node:test'
import assert from 'node:assert/strict'
import { HotelRoomsValidationError, validateRooms } from './hotel-rooms.js'

test('validates and normalizes hotel room rates and availability', () => {
  assert.deepEqual(validateRooms([{
    roomType: '  Deluxe double ',
    price: '4500',
    availableCount: '3',
  }]), [{
    roomType: 'Deluxe double',
    price: 4500,
    availableCount: 3,
  }])
})

test('allows no inventory and zero available rooms', () => {
  assert.deepEqual(validateRooms(undefined), [])
  assert.deepEqual(validateRooms([{ roomType: 'Standard', price: 2000, availableCount: 0 }]), [
    { roomType: 'Standard', price: 2000, availableCount: 0 },
  ])
})

test('rejects invalid room names, rates, and availability counts', () => {
  for (const rooms of [
    [{ roomType: '', price: 2000, availableCount: 1 }],
    [{ roomType: 'Standard', price: 0, availableCount: 1 }],
    [{ roomType: 'Standard', price: 2000, availableCount: -1 }],
    [{ roomType: 'Standard', price: 2000, availableCount: 1.5 }],
    Array.from({ length: 21 }, () => ({ roomType: 'Standard', price: 2000, availableCount: 1 })),
  ]) {
    assert.throws(() => validateRooms(rooms), HotelRoomsValidationError)
  }
})
