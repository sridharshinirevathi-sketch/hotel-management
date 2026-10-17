const ROUTE_ENDPOINT = 'https://router.project-osrm.org/route/v1/driving'

export async function fetchDrivingRoute(origin, destination, signal, request = fetch) {
  const routeUrl = new URL(`${ROUTE_ENDPOINT}/${origin.longitude},${origin.latitude};${destination.longitude},${destination.latitude}`)
  routeUrl.searchParams.set('overview', 'full')
  routeUrl.searchParams.set('geometries', 'geojson')
  routeUrl.searchParams.set('steps', 'false')

  const response = await request(routeUrl, { signal })
  if (!response.ok) {
    throw new Error(`Road directions service returned HTTP ${response.status}.`)
  }

  const result = await response.json()
  const route = result.routes?.[0]
  if (result.code !== 'Ok' || !route?.geometry?.coordinates?.length) {
    throw new Error(result.message || 'No driving route could be found between these locations.')
  }

  return {
    coordinates: route.geometry.coordinates.map(([longitude, latitude]) => [latitude, longitude]),
    distanceMeters: route.distance,
    durationSeconds: route.duration,
  }
}
