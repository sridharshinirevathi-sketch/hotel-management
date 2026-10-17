const ROUTE_ENDPOINT = 'https://router.project-osrm.org/route/v1/driving'

export function calculateStraightLineDistanceKm(origin, destination) {
  const validCoordinates = point =>
    Number.isFinite(point?.latitude) &&
    Number.isFinite(point?.longitude) &&
    point.latitude >= -90 &&
    point.latitude <= 90 &&
    point.longitude >= -180 &&
    point.longitude <= 180

  if (!validCoordinates(origin) || !validCoordinates(destination)) return null

  const radians = degrees => degrees * Math.PI / 180
  const latitudeDifference = radians(destination.latitude - origin.latitude)
  const longitudeDifference = radians(destination.longitude - origin.longitude)
  const haversine = Math.sin(latitudeDifference / 2) ** 2 +
    Math.cos(radians(origin.latitude)) *
    Math.cos(radians(destination.latitude)) *
    Math.sin(longitudeDifference / 2) ** 2

  return 6371 * 2 * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine))
}

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
