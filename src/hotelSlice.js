import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'

const destinations = {
  Chennai: { latitude: 13.0827, longitude: 80.2707, price: 8500 },
  Tirunelveli: { latitude: 8.7139, longitude: 77.7567, price: 3500 },
  Tiruchirappalli: { latitude: 10.7905, longitude: 78.7047, price: 4500 },
  Kanadukathan: { latitude: 10.1724, longitude: 78.7782, price: 11000 },
  Pollachi: { latitude: 10.6583, longitude: 77.0085, price: 9000 },
  Madurai: { latitude: 9.9252, longitude: 78.1198, price: 5500 },
  Tiruppur: { latitude: 11.1085, longitude: 77.3411, price: 3500 },
  Thanjavur: { latitude: 10.787, longitude: 79.1378, price: 5000 },
  Coimbatore: { latitude: 11.0168, longitude: 76.9558, price: 5500 },
  Ooty: { latitude: 11.4102, longitude: 76.695, price: 7000 },
  Vellore: { latitude: 12.9165, longitude: 79.1325, price: 4000 },
  Avinashi: { latitude: 11.192, longitude: 77.268, price: 3500 },
  'Kolli Hills': { latitude: 11.248, longitude: 78.338, price: 6500 },
  Kodaikanal: { latitude: 10.2381, longitude: 77.4892, price: 7500 },
  Yercaud: { latitude: 11.7753, longitude: 78.209, price: 6500 },
  Krishnagiri: { latitude: 12.5186, longitude: 78.2137, price: 4000 },
  Nagercoil: { latitude: 8.1833, longitude: 77.4119, price: 4000 },
}

const listings = [
  ['5 Star Residency', 'Chennai'],
  ['A Radha Hotel (Feathers)', 'Chennai'],
  ['Accord Metropolitan', 'Chennai'],
  ['Hotel Applettree', 'Tirunelveli'],
  ['Breeze Residency', 'Tiruchirappalli'],
  ['Chidambara Vilas', 'Kanadukathan'],
  ['Coco Lagoon by Great Mount', 'Pollachi'],
  ['Fortune Pandiyan Hotel', 'Madurai'],
  ['Ginger Tiruppur', 'Tiruppur'],
  ['Grand Chennai by GRT Hotels', 'Chennai'],
  ['Great Trails River View Resort', 'Thanjavur'],
  ['Heritage Madurai', 'Madurai'],
  ['Hotel Parisutham', 'Thanjavur'],
  ['Hyatt Regency Chennai', 'Chennai'],
  ['ibis Coimbatore City Centre', 'Coimbatore'],
  ['Zone by The Park, Coimbatore (ICON by Annapoorna)', 'Coimbatore'],
  ['Indovacations Ooty', 'Ooty'],
  ['ITC Grand Chola', 'Chennai'],
  ['The Leela Palace Chennai', 'Chennai'],
  ['Make My Trip Tiruppur', 'Tiruppur'],
  ['Le Méridien Coimbatore', 'Coimbatore'],
  ['MGM Beach Resorts', 'Chennai'],
  ['Park Inn', 'Vellore'],
  ['Pioneer Grand Palace', 'Nagercoil'],
  ['Poppys Tower Kumaran', 'Tiruppur'],
  ['Radisson Blu Coimbatore', 'Coimbatore'],
  ['RK Residency', 'Avinashi'],
  ['RVR Rejoice Villa Resorts', 'Kolli Hills'],
  ['Sterling Holidays Resort', 'Kodaikanal'],
  ['Sterling Yercaud', 'Yercaud'],
  ['Svatma', 'Thanjavur'],
  ['Taj Club House', 'Chennai'],
  ['TGI Grand Fortuna', 'Krishnagiri'],
  ['The Tamara Kodai', 'Kodaikanal'],
  ['Welcomhotel by ITC Hotels, Cathedral Road', 'Chennai'],
  ['Vivanta Coimbatore', 'Coimbatore'],
]

const hotelImages = {
  'A Radha Hotel (Feathers)': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ3-K3WWlX8vZQYUW-lIXxpzNcSnjFu9Zib77-iWCm9uw&s=10',
  'Accord Metropolitan': 'https://assets.simplotel.com/simplotel/image/upload/w_1200,q_80,f_auto/accord-hotels-resorts/Shot%2035(exterior1)corrected_b6e7bcbc.jpg',
  'Hotel Applettree': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTMI10xp7YdPCfnp0X32qr0oXR5hBe4DaG1xRYbz6g2PA&s=10',
  'Breeze Residency': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQjz5_vG_M436u4pMiIyiVsLKKaOCLMYv1gL_JzlJ7zaA&s=10',
  'Chidambara Vilas': 'https://assets.simplotel.com/simplotel/image/upload/w_1200,q_80,f_auto/chidambara-vilas---a-luxury-heritage-resort/facade-aerial',
  'Coco Lagoon by Great Mount': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSgI1fI49RU8EDtUNiYFYAf907B3S2iJ1vSk_7HBXoA5Q&s=10',
  'Fortune Pandiyan Hotel': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ0A_15DMiMjIakB1Q6ruR7xjyi8WQSDdt9dFb60l1usMs3&s',
  'Ginger Tiruppur': 'https://media-cdn.tripadvisor.com/media/photo-s/2c/71/44/9f/facade.jpg',
  'Grand Chennai by GRT Hotels': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQaCETO7S-w_-PfA0lUSrTlfIn91z7N7AJVQi24dngncg&s=10',
  'Great Trails River View Resort': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQLx9VWWqflW4acY6yfirccMrBJJyJsktJ0oKRjXmRBCA&s=10',
  'Heritage Madurai': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRK30eVsdGKO1w8rxhKzaR5oO9KACkkyBr8BclO19mtFQ&s=10',
  'Hotel Parisutham': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQFUNLhASMJEWCTkfmN-fmmAf2ip5gyzAfPApb-Vz_BKg&s=10',
  'Hyatt Regency Chennai': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRBG2T9wEgtJUiTGTQl3Xv1vBx04KDun_VXRRqjMh2Rnw&s=10',
  'ibis Coimbatore City Centre': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTwtOxjB68o9OEQ7NmQUO4lLV-B4E-xpNBOjeetZHIJCA&s=10',
  'Zone by The Park, Coimbatore (ICON by Annapoorna)': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ3RemE3mKojmCyIIBzXFqjofUQHKK5XeiTCh5pTK3SsA&s=10',
  'ITC Grand Chola': 'https://www.itchotels.com/content/dam/itchotels/in/umbrella/itc/hotels/itcgrandchola-chennai/images/overview/headmast-desktop/pool-long-dusk.png',
  'The Leela Palace Chennai': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS2djp-6bvDGZk2_Dax4U9Yn1TeCblXaoNCL2IOdPbbMg&s=10',
  'Le Méridien Coimbatore': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTJJz5ioPaY0L4gACJmJieQ7x6YT-K36Q7KeUvvtmRUwQ&s=10',
  'MGM Beach Resorts': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR05BW5JRCeiLDIQ0EOf9FWE6VPrp5JX5k5gVBKG710MA&s=10',
  'Park Inn': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSxpYUxNqL73kkFIU4-r01k1dhU1WxDkFAVVc4c_wwHrQ&s',
  'Pioneer Grand Palace': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ3gUXuUf-tu9-5png6GPzNUI9rmCWe__PCyeH9Ejm0Gw&s=10',
  'Poppys Tower Kumaran': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ65xdP-A4ssAfU8tBxTCMftwq186VCGJm8sxQW3lO3Cg&s',
  'Radisson Blu Coimbatore': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQkru7qiOqdT4WlujzXHYC91Y14xE_DjWq88W_T9XG1Ow&s',
  'RVR Rejoice Villa Resorts': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQlPjvhWCA1K7AEbwYJisa_qwwBL4d14qMT0q934dvmiA&s=10',
  'Sterling Holidays Resort': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ08_s63UrY0HkTSCYEJFfx5vG9T8sEQkaB7gGiZzgHXg&s=10',
  'Sterling Yercaud': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT_Lp7wpva8qX3K2l8jTWhgfW6O63zPZXPROtZ5LkEU4Q&s=10',
  Svatma: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ4XXUpgMJk3DJ0v4tEfxKS2F1rJ3piOaLw21-Jto2W7g&s=10',
  'Taj Club House': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ6W-T3fySel6bJhjuBxISW4iqK6RvqcGKQbEhhVuag_A&s=10',
  'TGI Grand Fortuna': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR2x3p5hAQquh464RBaa15aML-Uly_WPd7P2li9XQcaYA&s=10',
  'The Tamara Kodai': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQyp1ZN1thHhTik6uh__EyxghLIz_SL1wlKEt3lFksN1A&s=10',
  'Welcomhotel by ITC Hotels, Cathedral Road': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRxdH9T7nxHUdglN90vyh9mIhFsl52mRLPLGAKkSTJFvw&s=10',
  'Vivanta Coimbatore': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQSCdvB75wi78QrRLevgXPMaiLJ-twPdBAddMhyVUCjOw&s=10',
}

const makeHotel = ([title, location], index) => {
  const destination = destinations[location]
  const image = hotelImages[title]
  return {
    id: String(index + 1),
    title,
    location: `${location}, Tamil Nadu`,
    description: `${title} is located in ${location}, Tamil Nadu. Explore the property's facilities, nearby attractions, and current availability before booking.`,
    latitude: destination.latitude,
    longitude: destination.longitude,
    price: destination.price + (index % 5) * 500,
    image: image || `https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1000&q=80&sig=${index}`,
    imageIsVerified: Boolean(image),
  }
}

export const initialHotels = listings.map(makeHotel)

export async function readApiResponse(response, action = 'The hotel service') {
  if (response.status === 204) return null
  const body = await response.text()
  let result = null
  if (body.trim()) {
    try {
      result = JSON.parse(body)
    } catch {
      if (response.ok) throw new Error(`${action} returned an invalid response (HTTP ${response.status}).`)
    }
  }
  if (!response.ok) {
    throw new Error(result?.error || `${action} failed (HTTP ${response.status}).`)
  }
  if (result === null) {
    const contentType = response.headers.get('content-type') || 'unknown content type'
    const responsePath = response.url ? new URL(response.url).pathname : 'unknown endpoint'
    throw new Error(`${action} returned an empty response (HTTP ${response.status}, ${contentType}) from ${responsePath}. Ensure the Express API is running and the frontend is using its API proxy.`)
  }
  return result
}

const apiRequest = async (path, options) => {
  const response = await fetch(path, options)
  return readApiResponse(response)
}

export const fetchHotels = createAsyncThunk(
  'hotels/fetchAll',
  () => apiRequest('/api/hotels'),
  { condition: (_, { getState }) => !['loading', 'succeeded'].includes(getState().hotels.status) },
)
export const addHotel = createAsyncThunk('hotels/create', (hotel) =>
  apiRequest('/api/hotels', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(hotel) }))
export const updateHotel = createAsyncThunk('hotels/update', ({ id, ...hotel }) =>
  apiRequest(`/api/hotels/${encodeURIComponent(id)}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(hotel) }))
export const deleteHotel = createAsyncThunk('hotels/delete', (id) =>
  apiRequest(`/api/hotels/${encodeURIComponent(id)}`, { method: 'DELETE' }).then(() => id))

const initialState = { items: [], status: 'idle', error: null }

const hotelSlice = createSlice({
  name: 'hotels',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(fetchHotels.pending, state => { state.status = 'loading'; state.error = null })
      .addCase(fetchHotels.fulfilled, (state, action) => { state.items = action.payload; state.status = 'succeeded' })
      .addCase(fetchHotels.rejected, (state, action) => {
        if (state.items.length === 0) state.items = initialHotels
        state.status = 'failed'
        state.error = action.error.message || 'Could not load hotels.'
      })
      .addCase(addHotel.fulfilled, (state, action) => { state.items.unshift(action.payload) })
      .addCase(updateHotel.fulfilled, (state, action) => {
        const index = state.items.findIndex(hotel => hotel.id === action.payload.id)
        if (index !== -1) state.items[index] = action.payload
      })
      .addCase(deleteHotel.fulfilled, (state, action) => { state.items = state.items.filter(hotel => hotel.id !== action.payload) })
  },
})

export default hotelSlice.reducer
