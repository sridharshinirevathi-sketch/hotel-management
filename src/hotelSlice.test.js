import test from 'node:test'
import assert from 'node:assert/strict'
import hotelReducer, { fetchHotels, initialHotels } from './hotelSlice.js'

test('shows the sample hotel collection when the hotel service is unavailable', () => {
  const state = hotelReducer(undefined, fetchHotels.rejected(new Error('Service unavailable'), 'request-id'))

  assert.equal(state.status, 'failed')
  assert.equal(state.error, 'Service unavailable')
  assert.equal(state.items.length, initialHotels.length)
  assert.ok(state.items.some(hotel => hotel.title === '5 Star Residency'))
})

test('keeps loaded hotels when a later refresh fails', () => {
  const loadedHotel = { id: 'saved-hotel', title: 'Saved hotel' }
  const state = hotelReducer(
    { items: [loadedHotel], status: 'loading', error: null },
    fetchHotels.rejected(new Error('Service unavailable'), 'request-id'),
  )

  assert.deepEqual(state.items, [loadedHotel])
})
