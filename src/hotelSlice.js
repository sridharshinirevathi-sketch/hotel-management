import { createSlice } from '@reduxjs/toolkit'

// Demo catalogue. Names are sample listings; prices and coordinates are illustrative.
const pondicherryNames = [
  'Palais de Mahe', 'Le Dupleix', 'The Promenade', 'Accord Puducherry', 'Le Pondy',
  'Maison Perumal', 'Villa Shanti', 'La Villa', 'Anandha Inn', 'Hotel Annamalai International',
  'Hotel Atithi', 'Shenbaga Hotel & Convention Centre', 'The Sunway Manor', 'Ocean Spray',
  'Dune Eco Village and Spa', 'Mango Hill Hotel', 'The Ashok Beach Resort', 'Club Mahindra Puducherry',
  'Ginger Pondicherry', 'Hotel Surguru', 'Hotel Bonsejour', 'Hotel De Petit',
  'Villa Krish', 'The Richmond', 'Hotel Corbelli', 'De Fleur Hotel',
]

const chennaiNames = [
  'ITC Grand Chola', 'Taj Coromandel', 'Taj Connemara', 'The Leela Palace Chennai',
  'Park Hyatt Chennai', 'Hyatt Regency Chennai', 'The Raintree, Anna Salai', 'The Raintree, St. Mary’s Road',
  'Hilton Chennai', 'The Westin Chennai Velachery', 'Radisson Blu Hotel Chennai City Centre',
  'Radisson Blu Hotel GRT Chennai', 'Courtyard by Marriott Chennai', 'The Residency Towers',
  'Grand Chennai by GRT Hotels', 'Trident Chennai', 'Welcomhotel by ITC Hotels, Cathedral Road',
  'Taj Club House', 'The Park Chennai', 'Ramada Plaza by Wyndham Chennai', 'Feathers - A Radha Hotel',
  'Novotel Chennai Chamiers Road', 'Novotel Chennai Sipcot', 'Four Points by Sheraton Chennai OMR',
  'Holiday Inn Chennai OMR IT Expressway', 'Kaldan Samudhra Palace',
]

const stayDetails = [
  ['Start the morning with a slow breakfast before heading out to explore.', 'The rooms pair calming colors with comfortable spaces to unwind after a busy day.'],
  ['A welcoming base for discovering neighborhood cafés, markets, and local landmarks.', 'Guests can settle in with thoughtful comforts and an easygoing atmosphere.'],
  ['Designed for unhurried stays, with inviting interiors and space to recharge.', 'The location makes it simple to plan a day around the city and return to a quieter retreat.'],
  ['Enjoy a restful night and a relaxed start before setting out to see the sights.', 'Friendly service and practical comforts make this a convenient choice for a city break.'],
  ['A comfortable place to return to after exploring the area’s food and culture.', 'Bright rooms and welcoming shared spaces set the tone for an easy visit.'],
  ['Make this your home base for local discoveries, from early walks to late dinners.', 'The stay blends a peaceful atmosphere with convenient access around town.'],
  ['Settle into a slower rhythm with comfortable rooms and a warm welcome.', 'A considered city hideaway for travelers who want both comfort and convenience.'],
  ['Plan a full day out, then come back to a calm space made for resting.', 'Simple, thoughtful details help make a short trip feel effortless.'],
  ['A handy location for sightseeing, dining, and getting to know the city.', 'Relax in inviting surroundings with the essentials for a pleasant stay.'],
  ['Ease into the day with a comfortable room and the city close at hand.', 'A relaxed atmosphere makes it easy to recharge between outings.'],
  ['An inviting retreat for a weekend away or a longer visit.', 'Comfortable spaces and attentive hospitality help you feel at home in the city.'],
  ['Spend the day exploring nearby highlights and the evening unwinding in comfort.', 'Thoughtful touches and a convenient setting make this a memorable city base.'],
  ['A calm place to pause between local adventures and memorable meals.', 'Settle in and enjoy a comfortable stay with the city within easy reach.'],
]

const makeHotels = (names, city, baseLat, baseLng, priceBase, startId) => names.map((title, index) => ({
  id: String(startId + index),
  title,
  location: city,
  description: `${title} offers a welcoming stay in ${city}. ${stayDetails[index % stayDetails.length][index % 2]} ${index % 2 === 0 ? 'Ideal for a relaxed getaway or a convenient city visit.' : 'A comfortable choice for discovering the character of the destination.'}`,
  // Small offsets keep demo map pins near the named city; replace with verified property coordinates for production.
  latitude: Number((baseLat + ((index % 7) - 3) * 0.008).toFixed(6)),
  longitude: Number((baseLng + ((index % 9) - 4) * 0.009).toFixed(6)),
  price: priceBase + (index % 8) * 1250,
  // Picsum's stable per-seed URLs prevent the previous keyword endpoint from
  // serving the same cached hotel photo for multiple cards.
  image: `https://picsum.photos/seed/havenstay-${startId + index}/1000/700`,
}))

const initialState = {
  items: [
    ...makeHotels(pondicherryNames, 'Puducherry', 11.934, 79.830, 2500, 1),
    ...makeHotels(chennaiNames, 'Chennai', 13.083, 80.270, 3200, 27),
  ],
}

const hotelSlice = createSlice({
  name: 'hotels',
  initialState,
  reducers: {
    addHotel: (state, action) => { state.items.unshift(action.payload) },
    updateHotel: (state, action) => { const index = state.items.findIndex(hotel => hotel.id === action.payload.id); if (index !== -1) state.items[index] = action.payload },
    deleteHotel: (state, action) => { state.items = state.items.filter(hotel => hotel.id !== action.payload) },
  },
})

export const { addHotel, updateHotel, deleteHotel } = hotelSlice.actions
export default hotelSlice.reducer
