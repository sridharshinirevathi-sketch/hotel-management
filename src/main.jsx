import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { configureStore } from '@reduxjs/toolkit'
import { Provider } from 'react-redux'
import { BrowserRouter } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import hotelReducer from './hotelSlice'
import './index.css'
import App from './App.jsx'

const store = configureStore({ reducer: { hotels: hotelReducer } })

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <HelmetProvider>
        <BrowserRouter><App /></BrowserRouter>
      </HelmetProvider>
    </Provider>
  </StrictMode>,
)
