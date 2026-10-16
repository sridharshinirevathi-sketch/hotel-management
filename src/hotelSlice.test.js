import test from 'node:test'
import assert from 'node:assert/strict'
import hotelReducer, { fetchHotels, initialHotels, readApiResponse } from './hotelSlice.js'

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

test('reports an empty successful API response without a JSON parsing error', async () => {
  await assert.rejects(
    readApiResponse(new Response('', { status: 200 }), 'Hotel photo upload'),
    /Hotel photo upload returned an empty response \(HTTP 200, text\/plain;charset=UTF-8\) from unknown endpoint\. Ensure the Express API is running and the frontend is using its API proxy\./,
  )
})

test('uses the server error when an API request fails', async () => {
  await assert.rejects(
    readApiResponse(new Response(JSON.stringify({ error: 'Database unavailable.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    }), 'Hotel photo upload'),
    /Database unavailable\./,
  )
})
