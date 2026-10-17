import test from 'node:test'
import assert from 'node:assert/strict'
import { filterHotelsByRoomRate } from './hotelFilters.js'

const hotels = [
  {
    id: 'matching',
    title: 'Matching Hotel',
    location: 'Chennai',
    rooms: [
      { roomType: 'Standard', price: 3000, availableCount: 2 },
      { roomType: 'Deluxe', price: 5000, availableCount: 1 },
      { roomType: 'Sold out', price: 4000, availableCount: 0 },
    ],
  },
  {
    id: 'outside-range',
    title: 'Outside Hotel',
    location: 'Madurai',
    rooms: [{ roomType: 'Suite', price: 8000, availableCount: 1 }],
  },
  {
    id: 'no-rooms',
    title: 'No Rooms Hotel',
    location: 'Chennai',
    rooms: [],
  },
]

test('returns only hotels with available room rates inside the selected range', () => {
  const result = filterHotelsByRoomRate(hotels, { min: '3000', max: '5000' })

  assert.deepEqual(result.map(hotel => hotel.id), ['matching'])
  assert.deepEqual(result[0].availableRooms.map(room => room.price), [3000, 5000])
  assert.equal(result[0].priceFilterActive, true)
})

test('supports a single-sided price range and destination search', () => {
  const result = filterHotelsByRoomRate(hotels, { query: 'CHENNAI', min: '4000' })

  assert.deepEqual(result.map(hotel => hotel.id), ['matching'])
  assert.deepEqual(result[0].availableRooms.map(room => room.price), [5000])
})

test('keeps all hotels and available rooms when no price is specified', () => {
  const result = filterHotelsByRoomRate(hotels)

  assert.deepEqual(result.map(hotel => hotel.id), ['matching', 'outside-range', 'no-rooms'])
  assert.equal(result[0].availableRooms.length, 2)
  assert.equal(result[0].priceFilterActive, false)
})
