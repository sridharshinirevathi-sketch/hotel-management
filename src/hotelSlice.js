import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  items: [
    { id: '1', title: 'The Shoreline House', location: 'Uluwatu, Bali', description: 'Wake up to the rhythm of the Indian Ocean in this light-filled coastal hideaway. Thoughtful details, warm timber, and a private plunge pool make every slow morning feel like a little luxury.', latitude: -8.829, longitude: 115.084, price: 285, image: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1000&q=85' },
    { id: '2', title: 'Casa de la Luz', location: 'Oaxaca, Mexico', description: 'A restored colonial home tucked into the heart of Oaxaca. Spend afternoons in the courtyard garden, then wander out for mezcal, market finds, and the city’s colorful evening light.', latitude: 17.073, longitude: -96.726, price: 195, image: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1000&q=85' },
    { id: '3', title: 'The Fern & Fable', location: 'Ubud, Bali', description: 'Set among emerald rice terraces, this intimate retreat brings the outdoors in. Open-air living, handcrafted touches, and a private infinity pool create space to truly switch off.', latitude: -8.506, longitude: 115.262, price: 320, image: 'https://images.unsplash.com/photo-1533104816931-20fa691ff6ca?auto=format&fit=crop&w=1000&q=85' },
    { id: '4', title: 'Villa Serein', location: 'Provence, France', description: 'A sun-washed stone farmhouse surrounded by olive trees and lavender fields. Long lunches beneath the pergola and quiet evenings by the pool are part of the everyday here.', latitude: 43.949, longitude: 4.805, price: 410, image: 'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=1000&q=85' },
    { id: '5', title: 'Stillwater Cabin', location: 'Catskills, New York', description: 'A cedar-clad cabin made for weekends without a schedule. Follow the trail to the river, curl up by the wood stove, and let the forest set the pace.', latitude: 42.214, longitude: -74.218, price: 225, image: 'https://images.unsplash.com/photo-1449158743715-0a90ebb6d2d8?auto=format&fit=crop&w=1000&q=85' },
    { id: '6', title: 'Aegean Blue House', location: 'Paros, Greece', description: 'A quiet Cycladic home just steps from the water. Whitewashed walls, blue shutters, and a breezy terrace make this an easy base for island days and golden-hour swims.', latitude: 37.085, longitude: 25.148, price: 265, image: 'https://images.unsplash.com/photo-1602343168117-bb8ffe3e2e9f?auto=format&fit=crop&w=1000&q=85' },
    { id: '7', title: 'Casa Nopal', location: 'Tulum, Mexico', description: 'A design-led jungle home with natural textures, a shaded outdoor lounge, and a sunlit pool. Close enough for a beach day, secluded enough to hear the birds at breakfast.', latitude: 20.211, longitude: -87.465, price: 350, image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1000&q=85' },
    { id: '8', title: 'Northlight Lodge', location: 'Lofoten, Norway', description: 'A modern cabin with a front-row seat to the fjord. Watch the sky change from the picture window, then step outside for mountain air and a shoreline walk.', latitude: 68.209, longitude: 13.611, price: 290, image: 'https://images.unsplash.com/photo-1510798831971-661eb04b3739?auto=format&fit=crop&w=1000&q=85' },
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
