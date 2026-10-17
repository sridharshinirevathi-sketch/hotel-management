export function filterHotelsByRoomRate(hotels, { query = '', min = '', max = '' } = {}) {
  const search = query.trim().toLowerCase()
  const minimum = min === '' ? null : Number(min)
  const maximum = max === '' ? null : Number(max)
  const priceFilterActive = minimum !== null || maximum !== null

  return hotels.map(hotel => ({
    ...hotel,
    priceFilterActive,
    availableRooms: (hotel.rooms || []).filter(room =>
      room.availableCount > 0 &&
      (minimum === null || room.price >= minimum) &&
      (maximum === null || room.price <= maximum)),
  })).filter(hotel =>
    (hotel.title.toLowerCase().includes(search) || hotel.location.toLowerCase().includes(search)) &&
    (!priceFilterActive || hotel.availableRooms.length > 0))
}
