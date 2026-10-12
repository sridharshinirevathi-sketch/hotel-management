import { createSlice } from '@reduxjs/toolkit'

// Demo catalogue. Names are sample listings; prices and coordinates are illustrative.
const photoSet = [
  'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1000&q=85',
  'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1000&q=85',
  'https://images.unsplash.com/photo-1533104816931-20fa691ff6ca?auto=format&fit=crop&w=1000&q=85',
  'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=1000&q=85',
  'https://images.unsplash.com/photo-1449158743715-0a90ebb6d2d8?auto=format&fit=crop&w=1000&q=85',
  'https://images.unsplash.com/photo-1602343168117-bb8ffe3e2e9f?auto=format&fit=crop&w=1000&q=85',
]

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

const descriptions = [
  'A comfortable city stay with welcoming hospitality, thoughtfully designed rooms, and an easy base for exploring nearby sights.',
  'Settle into a calm, well-connected retreat with warm service, relaxed spaces, and the essentials for a pleasant visit.',
  'Enjoy a convenient stay with inviting interiors, attentive service, and a location close to the city’s dining and attractions.',
  'A relaxed place to recharge after a day out, with comfortable rooms and friendly service for both short and longer visits.',
]

const makeHotels = (names, city, baseLat, baseLng, priceBase, startId) => names.map((title, index) => ({
  id: String(startId + index),
  title,
  location: city,
  description: descriptions[index % descriptions.length],
  // Small offsets keep demo map pins near the named city; replace with verified property coordinates for production.
  latitude: Number((baseLat + ((index % 7) - 3) * 0.008).toFixed(6)),
  longitude: Number((baseLng + ((index % 9) - 4) * 0.009).toFixed(6)),
  price: priceBase + (index % 8) * 1250,
  image: photoSet[index % photoSet.length],
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
