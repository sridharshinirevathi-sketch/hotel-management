export class HotelRoomsValidationError extends Error {}

export function validateRooms(input) {
  if (input === undefined) return []
  if (!Array.isArray(input) || input.length > 20) {
    throw new HotelRoomsValidationError('Provide no more than 20 room types.')
  }

  return input.map((room, index) => {
    const roomType = typeof room?.roomType === 'string' ? room.roomType.trim() : ''
    const price = Number(room?.price)
    const availableCount = Number(room?.availableCount)

    if (!roomType || roomType.length > 80) {
      throw new HotelRoomsValidationError(`Room type ${index + 1} needs a name of 80 characters or fewer.`)
    }
    if (!Number.isFinite(price) || price <= 0 || price > 9999999999) {
      throw new HotelRoomsValidationError(`Enter a valid nightly rate for room type ${index + 1}.`)
    }
    if (!Number.isInteger(availableCount) || availableCount < 0 || availableCount > 32767) {
      throw new HotelRoomsValidationError(`Enter a valid available room count for room type ${index + 1}.`)
    }

    return { roomType, price, availableCount }
  })
}
