import test from 'node:test'
import assert from 'node:assert/strict'
import { fetchDrivingRoute } from './directions.js'

const origin = { latitude: 13.08, longitude: 80.27 }
const destination = { latitude: 13.09, longitude: 80.28 }

test('requests a road route and converts its geometry for the map', async () => {
  let requestedUrl
  const route = await fetchDrivingRoute(origin, destination, undefined, async url => {
    requestedUrl = new URL(url)
    return new Response(JSON.stringify({
      code: 'Ok',
      routes: [{
        distance: 2500,
        duration: 420,
        geometry: { coordinates: [[80.27, 13.08], [80.28, 13.09]] },
      }],
    }), { status: 200 })
  })

  assert.equal(requestedUrl.hostname, 'router.project-osrm.org')
  assert.equal(requestedUrl.pathname, '/route/v1/driving/80.27,13.08;80.28,13.09')
  assert.equal(requestedUrl.searchParams.get('geometries'), 'geojson')
  assert.deepEqual(route, {
    coordinates: [[13.08, 80.27], [13.09, 80.28]],
    distanceMeters: 2500,
    durationSeconds: 420,
  })
})

test('reports routing service HTTP failures', async () => {
  await assert.rejects(
    fetchDrivingRoute(origin, destination, undefined, async () => new Response('', { status: 503 })),
    /Road directions service returned HTTP 503\./,
  )
})

test('reports when the routing service cannot find a route', async () => {
  await assert.rejects(
    fetchDrivingRoute(origin, destination, undefined, async () => new Response(JSON.stringify({
      code: 'NoRoute',
      message: 'No route found.',
      routes: [],
    }), { status: 200 })),
    /No route found\./,
  )
})
