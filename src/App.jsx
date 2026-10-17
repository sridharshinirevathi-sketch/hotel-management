import { useEffect, useMemo, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, Route, Routes, useNavigate, useParams } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import L from 'leaflet'
import { addHotel, deleteHotel, fetchHotels, readApiResponse, updateHotel } from './hotelSlice'
import { apiUrl } from './api.js'
import { fetchDrivingRoute } from './directions.js'
import './App.css'
import './booking.css'
import 'leaflet/dist/leaflet.css'

const money = (value) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value)
const emptyHotelForm = { title: '', description: '', latitude: '', longitude: '', coordinatesAreExact: false, rooms: [], price: '', image: '', location: '' }
const HOTELS_PER_PAGE = 12

function Header() {
  return <header className="topbar"><Link className="brand" to="/"><span className="brand-mark">H</span><span>haven<span className="brand-light">stay</span></span></Link><nav><Link to="/">Explore stays</Link><a href="#about">About</a></nav><Link to="/new" className="host-link">＋ <span>Add a hotel</span></Link></header>
}

function HotelCard({ hotel, onDelete }) {
  const destination = hotel.coordinatesAreExact
    ? `${hotel.latitude},${hotel.longitude}`
    : `${hotel.title}, ${hotel.location}`
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent('My Location')}&destination=${encodeURIComponent(destination)}&travelmode=driving`
  return <article className="hotel-card">
    <Link to={`/hotel/${hotel.id}`} className="card-photo"><img src={hotel.image} alt={`${hotel.title} in ${hotel.location}`} /><span className="photo-tag">{hotel.imageIsVerified ? 'HOTEL PHOTO' : 'REPRESENTATIVE PHOTO'}</span></Link>
    <div className="card-content"><div className="card-title-line"><Link to={`/hotel/${hotel.id}`}><h3>{hotel.title}</h3></Link></div><div className="card-location-row"><a href={directionsUrl} target="_blank" rel="noreferrer" className="location-label" aria-label={`Open directions to ${hotel.title}`}>{hotel.location}</a><a className="directions-link" href={directionsUrl} target="_blank" rel="noreferrer" aria-label={`Get live directions to ${hotel.title}`}>Directions ↗</a></div><p className="description-snippet">{hotel.description}</p>{hotel.availableRooms.length ? <div className="room-offers"><strong>Rooms reported available</strong>{hotel.availableRooms.map(room => <div className="room-offer" key={room.id || `${room.roomType}-${room.price}`}><span>{room.roomType} · {room.availableCount} left</span><strong>{money(room.price)}<small> / night</small></strong></div>)}</div> : <p className="room-availability-note">{hotel.rooms?.length ? 'No rooms currently reported as available.' : 'Room availability has not been added yet.'}</p>}<div className="card-footer"><span><strong>{money(hotel.price)}</strong> <span className="night">reference / night</span></span><div className="card-actions"><Link to={`/edit/${hotel.id}`} aria-label={`Edit ${hotel.title}`}>Edit</Link><button onClick={() => onDelete(hotel.id)} aria-label={`Delete ${hotel.title}`}>Delete</button></div></div></div>
  </article>
}

function Home() {
  const hotels = useSelector(state => state.hotels.items)
  const status = useSelector(state => state.hotels.status)
  const loadError = useSelector(state => state.hotels.error)
  const dispatch = useDispatch()
  const [query, setQuery] = useState('')
  const [min, setMin] = useState('')
  const [max, setMax] = useState('')
  const [notice, setNotice] = useState('')
  const [page, setPage] = useState(1)
  const priceFilterActive = min !== '' || max !== ''
  const filtered = useMemo(() => hotels.map(hotel => ({
    ...hotel,
    availableRooms: (hotel.rooms || []).filter(room =>
      room.availableCount > 0 &&
      (min === '' || room.price >= Number(min)) &&
      (max === '' || room.price <= Number(max))),
  })).filter(hotel =>
    (hotel.title.toLowerCase().includes(query.toLowerCase()) || hotel.location.toLowerCase().includes(query.toLowerCase())) &&
    (!priceFilterActive || hotel.availableRooms.length > 0)), [hotels, query, min, max, priceFilterActive])
  const pageCount = Math.ceil(filtered.length / HOTELS_PER_PAGE)
  const currentPage = Math.min(page, Math.max(pageCount, 1))
  const pageHotels = filtered.slice((currentPage - 1) * HOTELS_PER_PAGE, currentPage * HOTELS_PER_PAGE)
  const remove = async (id) => {
    try {
      await dispatch(deleteHotel(id)).unwrap()
      setNotice('Hotel removed successfully')
      window.setTimeout(() => setNotice(''), 2800)
    } catch (error) {
      setNotice(error || 'Could not delete this hotel.')
    }
  }
  const updateFilter = (setter) => (event) => {
    setter(event.target.value)
    setPage(1)
  }
  return <><Helmet><title>Tamilnadu Hotel Collections | Havenstay</title><meta name="description" content="Browse hotel collections and find memorable stays across Tamil Nadu." /></Helmet><main>
    <section className="hero"><div className="hero-copy"><span className="eyebrow">WELCOME TO</span><h1>Tamilnadu Hotel <em>Collections</em></h1><p>Discover memorable stays across Tamil Nadu.<br />Find your perfect place to stay.</p><a href="#stays" className="hero-button">Explore stays <span>↘</span></a></div></section>
    <section className="listing" id="stays"><div className="section-head"><div><h2>Places to stay</h2></div><p>Search nightly room rates in INR.<br />Availability is reported by each listing.</p></div>
      <div className="filters"><label className="search-box"><span>⌕</span><input value={query} onChange={updateFilter(setQuery)} placeholder="Search destinations or stays" aria-label="Search hotels by name or location" /></label><div className="price-filter"><span>Available room rate</span><label><span className="sr-only">Minimum room rate</span><input type="number" min="0" value={min} onChange={updateFilter(setMin)} placeholder="Min ₹" /></label><span className="price-dash">—</span><label><span className="sr-only">Maximum room rate</span><input type="number" min="0" value={max} onChange={updateFilter(setMax)} placeholder="Max ₹" /></label></div><button className="filter-reset" onClick={() => { setQuery(''); setMin(''); setMax(''); setPage(1) }}>Reset</button></div>
      {status === 'failed' && hotels.length > 0 && <div className="service-notice" role="alert"><span>Showing sample listings because the hotel service is unavailable. Changes and booking requests need a working backend and database.</span><button onClick={() => dispatch(fetchHotels())}>Retry connection</button></div>}
      <div className="results-line"><span>{filtered.length} stays to inspire your next trip</span><span>Sort by <strong>Recommended⌄</strong></span></div>
      {status === 'loading' && hotels.length === 0 ? <div className="empty-state"><h3>Loading hotels…</h3></div>
        : status === 'failed' && hotels.length === 0 ? <div className="empty-state" role="alert"><h3>Could not load hotels</h3><p>{loadError}</p><button className="submit-button" onClick={() => dispatch(fetchHotels())}>Try again</button></div>
          : filtered.length ? <><div className="hotel-grid">{pageHotels.map(hotel => <HotelCard key={hotel.id} hotel={hotel} onDelete={remove} />)}</div>{pageCount > 1 && <nav className="pagination" aria-label="Hotel listing pages"><button aria-label="Previous page" onClick={() => setPage(currentPage - 1)} disabled={currentPage === 1}>←</button>{Array.from({ length: pageCount }, (_, index) => index + 1).map(pageNumber => <button key={pageNumber} className={currentPage === pageNumber ? 'active' : ''} aria-label={`Page ${pageNumber}`} aria-current={currentPage === pageNumber ? 'page' : undefined} onClick={() => setPage(pageNumber)}>{pageNumber}</button>)}<button aria-label="Next page" onClick={() => setPage(currentPage + 1)} disabled={currentPage === pageCount}>→</button></nav>}</> : <div className="empty-state"><span>⌕</span><h3>No stays found</h3><p>Try a different title or price range.</p></div>}
    </section>
  </main><footer id="about"><span>© 2025 Havenstay</span><span>Stay a little closer to somewhere new.</span><a href="#stays">Back to top ↑</a></footer>{notice && <div className="toast" role="status"><span>✓</span>{notice}</div>}</>
}

function HotelForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const hotel = useSelector(state => state.hotels.items.find(item => item.id === id))
  const hotelsStatus = useSelector(state => state.hotels.status)
  const hotelsError = useSelector(state => state.hotels.error)
  const [form, setForm] = useState(null)
  const [pendingImage, setPendingImage] = useState(null)
  const [imagePreview, setImagePreview] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const currentForm = form || hotel || emptyHotelForm
  useEffect(() => () => {
    if (imagePreview) URL.revokeObjectURL(imagePreview)
  }, [imagePreview])
  const change = (event) => setForm(current => ({ ...(current || hotel || emptyHotelForm), [event.target.name]: event.target.type === 'checkbox' ? event.target.checked : event.target.value }))
  const changeRoom = (index, name, value) => setForm(current => {
    const next = current || hotel || emptyHotelForm
    const rooms = [...(next.rooms || [])]
    rooms[index] = { ...rooms[index], [name]: value }
    return { ...next, rooms }
  })
  const addRoom = () => setForm(current => {
    const next = current || hotel || emptyHotelForm
    return { ...next, rooms: [...(next.rooms || []), { roomType: '', price: '', availableCount: '1' }] }
  })
  const removeRoom = (index) => setForm(current => {
    const next = current || hotel || emptyHotelForm
    return { ...next, rooms: (next.rooms || []).filter((_, roomIndex) => roomIndex !== index) }
  })
  const imageChange = (event) => {
    const file = event.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      setError('Hotel photo must be 5 MB or smaller.')
      event.target.value = ''
      return
    }
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setError('Upload a JPG, PNG, or WebP hotel photo.')
      event.target.value = ''
      return
    }
    setError('')
    setPendingImage(file)
    setImagePreview(URL.createObjectURL(file))
  }
  const submit = async (event) => {
    event.preventDefault()
    if (!currentForm.title.trim() || !currentForm.description.trim() || (!currentForm.image && !pendingImage)) return setError('Add a title, description, and hotel photo.')
    if (currentForm.latitude === '' || Number(currentForm.latitude) < -90 || Number(currentForm.latitude) > 90 || currentForm.longitude === '' || Number(currentForm.longitude) < -180 || Number(currentForm.longitude) > 180) return setError('Enter valid latitude (−90 to 90) and longitude (−180 to 180).')
    if (!currentForm.price || Number(currentForm.price) <= 0) return setError('Price must be greater than zero.')
    if (!currentForm.location.trim()) return setError('Enter the hotel location.')
    if ((currentForm.rooms || []).length > 20) return setError('You can add up to 20 room types.')
    for (const [index, room] of (currentForm.rooms || []).entries()) {
      if (!room.roomType.trim()) return setError(`Enter a name for room type ${index + 1}.`)
      if (!room.price || Number(room.price) <= 0) return setError(`Enter a valid nightly rate for room type ${index + 1}.`)
      if (room.availableCount === '' || !Number.isInteger(Number(room.availableCount)) || Number(room.availableCount) < 0) return setError(`Enter a valid available room count for room type ${index + 1}.`)
    }
    setSaving(true)
    setError('')
    try {
      let image = currentForm.image
      if (pendingImage) {
        const body = new FormData()
        body.append('image', pendingImage)
        const response = await fetch(apiUrl('/api/uploads'), { method: 'POST', body })
        const result = await readApiResponse(response, 'Hotel photo upload')
        image = apiUrl(result.url)
      }
      const record = {
        ...currentForm,
        image,
        imageIsVerified: pendingImage ? true : currentForm.imageIsVerified,
        price: Number(currentForm.price),
        latitude: Number(currentForm.latitude),
        longitude: Number(currentForm.longitude),
        coordinatesAreExact: Boolean(currentForm.coordinatesAreExact),
        rooms: (currentForm.rooms || []).map(room => ({ ...room, roomType: room.roomType.trim(), price: Number(room.price), availableCount: Number(room.availableCount) })),
      }
      await dispatch(id ? updateHotel({ ...record, id }) : addHotel(record)).unwrap()
      navigate('/')
    } catch (saveError) {
      setError(saveError.message || 'Could not save hotel details.')
    } finally {
      setSaving(false)
    }
  }
  if (id && !hotel && ['idle', 'loading'].includes(hotelsStatus)) return <main className="form-wrap"><div className="empty-state"><h2>Loading hotel…</h2></div></main>
  if (id && !hotel && hotelsStatus === 'failed') return <main className="form-wrap"><div className="empty-state" role="alert"><h2>Could not load hotel</h2><p>{hotelsError}</p><Link to="/">Return to stays</Link></div></main>
  if (id && !hotel) return <main className="form-wrap"><div className="empty-state"><h2>Hotel not found</h2><Link to="/">Return to stays</Link></div></main>
  return <><Helmet><title>{id ? 'Edit stay' : 'Add a stay'} | Havenstay</title><meta name="description" content="Manage hotel stay details on Havenstay." /></Helmet><main className="form-wrap"><Link to="/" className="back-link">← Back to stays</Link><div className="form-heading"><span className="eyebrow">{id ? 'UPDATE YOUR LISTING' : 'GROW THE COLLECTION'}</span><h1>{id ? 'Edit your stay' : 'Add a new stay'}</h1><p>Share the details that help travelers find their perfect place.</p></div><form className="hotel-form" onSubmit={submit}>
    <label className="upload-box">{imagePreview || currentForm.image ? <img className="preview" src={imagePreview || currentForm.image} alt="Hotel upload preview" /> : <span className="upload-icon">↑</span>}<strong>{imagePreview || currentForm.image ? 'Change photo' : 'Upload a hotel photo'}</strong><small>JPG, PNG, or WebP · Up to 5 MB</small><input type="file" accept="image/jpeg,image/png,image/webp" onChange={imageChange} /></label>
    <label>Hotel name<input name="title" value={currentForm.title} onChange={change} required maxLength="100" placeholder="e.g. The Shoreline House" /></label>
    <label>Hotel address or location<input name="location" value={currentForm.location} onChange={change} required maxLength="200" placeholder="Hotel address, area, city" /></label>
    <label>Description<textarea name="description" value={currentForm.description} onChange={change} required rows="4" maxLength="800" placeholder="What makes this stay special?" /></label>
    <div className="form-row"><label>Latitude<input type="number" name="latitude" value={currentForm.latitude} onChange={change} required step="any" min="-90" max="90" placeholder="−90 to 90" /></label><label>Longitude<input type="number" name="longitude" value={currentForm.longitude} onChange={change} required step="any" min="-180" max="180" placeholder="−180 to 180" /></label></div>
    <label className="exact-location-check"><input type="checkbox" name="coordinatesAreExact" checked={Boolean(currentForm.coordinatesAreExact)} onChange={change} /> These coordinates are the exact hotel pin</label>
    <section className="room-editor"><div className="room-editor-heading"><div><strong>Room rates and availability</strong><small>Only rooms with a reported count above zero appear in price search.</small></div><button type="button" onClick={addRoom} disabled={(currentForm.rooms || []).length >= 20}>＋ Add room type</button></div>{(currentForm.rooms || []).map((room, index) => <div className="room-editor-row" key={room.id || index}><label>Room type<input value={room.roomType} onChange={event => changeRoom(index, 'roomType', event.target.value)} maxLength="80" placeholder="e.g. Deluxe double" /></label><label>Rate / night (₹)<input type="number" value={room.price} onChange={event => changeRoom(index, 'price', event.target.value)} min="1" step="1" /></label><label>Available rooms<input type="number" value={room.availableCount} onChange={event => changeRoom(index, 'availableCount', event.target.value)} min="0" step="1" /></label><button type="button" className="remove-room" onClick={() => removeRoom(index)} aria-label={`Remove room type ${index + 1}`}>Remove</button></div>)}{!(currentForm.rooms || []).length && <p className="no-rooms-note">No room rates added. Add room types to make this hotel searchable by available room price.</p>}</section>
    <label>Reference price per night (INR)<input type="number" name="price" value={currentForm.price} onChange={change} required min="1" step="1" placeholder="e.g. 6500" /></label>
    {error && <p className="form-error" role="alert">{error}</p>}<div className="form-actions"><Link to="/" className="cancel-button">Cancel</Link><button type="submit" className="submit-button" disabled={saving}>{saving ? 'Saving…' : id ? 'Save changes' : 'Add hotel'} <span>→</span></button></div>
  </form></main></>
}

function BookingRequest() {
  const { id } = useParams()
  const hotel = useSelector(state => state.hotels.items.find(item => item.id === id))
  const hotelsStatus = useSelector(state => state.hotels.status)
  const hotelsError = useSelector(state => state.hotels.error)
  const [form, setForm] = useState({ guestName: '', guestEmail: '', checkIn: '', checkOut: '', guests: '1' })
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [confirmation, setConfirmation] = useState(null)
  const today = new Date()
  const minimumDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
  const nights = form.checkIn && form.checkOut
    ? (Date.parse(`${form.checkOut}T00:00:00Z`) - Date.parse(`${form.checkIn}T00:00:00Z`)) / 86400000
    : 0

  const change = (event) => setForm(current => ({ ...current, [event.target.name]: event.target.value }))
  const submit = async (event) => {
    event.preventDefault()
    setSaving(true)
    setError('')
    try {
      const response = await fetch(apiUrl('/api/bookings'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, hotelId: id, guests: Number(form.guests) }),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Could not send your booking request.')
      setConfirmation(result)
    } catch (bookingError) {
      setError(bookingError.message || 'Could not send your booking request.')
    } finally {
      setSaving(false)
    }
  }

  if (!hotel && ['idle', 'loading'].includes(hotelsStatus)) {
    return <main className="form-wrap"><div className="empty-state"><h2>Loading hotel…</h2></div></main>
  }
  if (!hotel && hotelsStatus === 'failed') {
    return <main className="form-wrap"><div className="empty-state" role="alert"><h2>Could not load hotel</h2><p>{hotelsError}</p><Link to="/">Return to stays</Link></div></main>
  }
  if (!hotel) {
    return <main className="form-wrap"><div className="empty-state"><h2>Hotel not found</h2><Link to="/">Return to stays</Link></div></main>
  }

  if (confirmation) {
    return <><Helmet><title>Request received | Havenstay</title></Helmet><main className="form-wrap">
      <section className="booking-confirmation" role="status">
        <span className="eyebrow">REQUEST RECEIVED</span>
        <h1>Thanks, {form.guestName}.</h1>
        <p>Your request for <strong>{hotel.title}</strong> is pending confirmation by the property. This is not a confirmed reservation.</p>
        <dl>
          <div><dt>Request reference</dt><dd>{confirmation.id}</dd></div>
          <div><dt>Stay dates</dt><dd>{confirmation.checkIn} – {confirmation.checkOut} · {confirmation.nights} nights</dd></div>
          <div><dt>Guests</dt><dd>{confirmation.guests}</dd></div>
          <div><dt>Indicative stay estimate</dt><dd>{money(confirmation.estimatedTotal)}</dd></div>
        </dl>
        <p className="booking-disclaimer">No payment was collected. The nightly price is an unverified estimate; contact the hotel to confirm availability, exact rates, and booking details.</p>
        <Link to="/" className="submit-button">Back to stays →</Link>
      </section>
    </main><footer><span>© 2025 Havenstay</span><span>Stay a little closer to somewhere new.</span><Link to="/">Back to stays</Link></footer></>
  }

  return <><Helmet><title>Request a stay at {hotel.title} | Havenstay</title><meta name="description" content={`Send a booking request to ${hotel.title}.`} /></Helmet>
    <main className="form-wrap">
      <Link to={`/hotel/${hotel.id}`} className="back-link">← Back to {hotel.title}</Link>
      <div className="form-heading"><span className="eyebrow">NO PAYMENT REQUIRED</span><h1>Request a stay</h1><p>{hotel.title} · {hotel.location}</p></div>
      <form className="hotel-form booking-form" onSubmit={submit}>
        <div className="form-row">
          <label>Check-in<input type="date" name="checkIn" value={form.checkIn} onChange={change} min={minimumDate} required /></label>
          <label>Check-out<input type="date" name="checkOut" value={form.checkOut} onChange={change} min={form.checkIn || minimumDate} required /></label>
        </div>
        <label>Number of guests<input type="number" name="guests" value={form.guests} onChange={change} min="1" max="20" step="1" required /></label>
        {nights > 0 && <p className="booking-estimate">{nights} {nights === 1 ? 'night' : 'nights'} · indicative estimate: <strong>{money(hotel.price * nights)}</strong></p>}
        <label>Your name<input name="guestName" value={form.guestName} onChange={change} maxLength="100" autoComplete="name" required /></label>
        <label>Email address<input type="email" name="guestEmail" value={form.guestEmail} onChange={change} maxLength="254" autoComplete="email" required /></label>
        <p className="booking-disclaimer">This sends a booking request only. Room inventory is not tracked, availability is not guaranteed, and the property must confirm the reservation and current price. No payment is collected.</p>
        {error && <p className="form-error" role="alert">{error}</p>}
        <div className="form-actions"><Link to={`/hotel/${hotel.id}`} className="cancel-button">Cancel</Link><button type="submit" className="submit-button" disabled={saving}>{saving ? 'Sending…' : 'Send request'} <span>→</span></button></div>
      </form>
    </main><footer><span>© 2025 Havenstay</span><span>Stay a little closer to somewhere new.</span><Link to="/">Back to stays</Link></footer></>
}

function HotelDirections({ hotel }) {
  const mapElement = useRef(null)
  const map = useRef(null)
  const routeLayer = useRef(null)
  const [locationAttempt, setLocationAttempt] = useState(0)
  const [routeAttempt, setRouteAttempt] = useState(0)
  const hasGeolocation = typeof navigator !== 'undefined' && Boolean(navigator.geolocation)
  const [location, setLocation] = useState(() => ({
    status: hasGeolocation ? 'loading' : 'unsupported',
    position: null,
  }))
  const [route, setRoute] = useState({ status: 'idle', data: null, error: '' })
  const latitude = Number(hotel.latitude)
  const longitude = Number(hotel.longitude)

  useEffect(() => {
    let active = true
    if (!hasGeolocation) return () => { active = false }

    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        if (active) {
          setLocation({
            status: 'available',
            position: { latitude: coords.latitude, longitude: coords.longitude },
          })
          setRoute({ status: 'loading', data: null, error: '' })
        }
      },
      error => {
        if (active) {
          setLocation({ status: error.code === 1 ? 'denied' : 'unavailable', position: null })
          setRoute({ status: 'idle', data: null, error: '' })
        }
      },
      { enableHighAccuracy: true, maximumAge: 300000, timeout: 15000 },
    )

    return () => { active = false }
  }, [hasGeolocation, locationAttempt])

  useEffect(() => {
    if (!location.position) return undefined
    const controller = new AbortController()
    fetchDrivingRoute(location.position, { latitude, longitude }, controller.signal)
      .then(data => setRoute({ status: 'ready', data, error: '' }))
      .catch(error => {
        if (!controller.signal.aborted) {
          setRoute({ status: 'failed', data: null, error: error.message || 'Could not load road directions.' })
        }
      })
    return () => controller.abort()
  }, [location.position, latitude, longitude, routeAttempt])

  useEffect(() => {
    if (!mapElement.current) return undefined
    const instance = L.map(mapElement.current, { scrollWheelZoom: false })
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(instance)
    instance.setView([latitude, longitude], 12)
    map.current = instance
    routeLayer.current = L.featureGroup().addTo(instance)

    return () => {
      instance.remove()
      map.current = null
      routeLayer.current = null
    }
  }, [latitude, longitude])

  useEffect(() => {
    if (!map.current || !routeLayer.current) return
    const layer = routeLayer.current
    layer.clearLayers()

    const hotelMarker = L.circleMarker([latitude, longitude], {
      radius: 8,
      color: '#ffffff',
      weight: 2,
      fillColor: '#dc5c51',
      fillOpacity: 1,
    }).bindTooltip(hotel.title)
    layer.addLayer(hotelMarker)

    if (location.position) {
      const originMarker = L.circleMarker([location.position.latitude, location.position.longitude], {
        radius: 7,
        color: '#ffffff',
        weight: 2,
        fillColor: '#3388ff',
        fillOpacity: 1,
      }).bindTooltip('Your current location')
      layer.addLayer(originMarker)
    }

    if (route.status === 'ready') {
      layer.addLayer(L.polyline(route.data.coordinates, {
        color: '#3388ff',
        weight: 6,
        opacity: 0.9,
      }))
      map.current.fitBounds(layer.getBounds(), { padding: [28, 28] })
    } else {
      map.current.setView([latitude, longitude], 12)
    }
  }, [hotel.title, latitude, longitude, location.position, route])

  const mapsUrl = new URL('https://www.google.com/maps/dir/')
  mapsUrl.searchParams.set('api', '1')
  mapsUrl.searchParams.set(
    'destination',
    hotel.coordinatesAreExact ? `${latitude},${longitude}` : `${hotel.title}, ${hotel.location}`,
  )
  mapsUrl.searchParams.set('travelmode', 'driving')
  if (location.position) {
    mapsUrl.searchParams.set('origin', `${location.position.latitude},${location.position.longitude}`)
  }

  const routeDistance = route.status === 'ready'
    ? `${(route.data.distanceMeters / 1000).toFixed(1)} km`
    : ''
  const routeDuration = route.status === 'ready'
    ? `${Math.round(route.data.durationSeconds / 60)} min`
    : ''

  return <section className="directions-section" aria-labelledby="directions-title">
    <div className="directions-heading">
      <div><span className="eyebrow">ROAD DIRECTIONS</span><h2 id="directions-title">Route to {hotel.title}</h2></div>
      <a className="submit-button" href={mapsUrl.toString()} target="_blank" rel="noreferrer">Open in Google Maps ↗</a>
    </div>
    <p className="directions-privacy">Your location is shared with the public OSRM routing service to calculate this route. {hotel.coordinatesAreExact ? 'The route ends at the saved hotel pin.' : 'The route ends at approximate town coordinates, not the exact hotel entrance.'}</p>
    <div className="route-map" ref={mapElement} role="img" aria-label={`Road route map to ${hotel.title}`} />
    {location.status === 'loading' && <p className="route-status" role="status">Requesting your location to calculate the road route…</p>}
    {location.status === 'denied' && <p className="route-status" role="status">Location permission was denied. Allow location access to display the route line.</p>}
    {location.status === 'unsupported' && <p className="route-status" role="status">This browser does not support location access, so an in-page route cannot be displayed.</p>}
    {location.status === 'unavailable' && <p className="route-status" role="status">Your location is unavailable. Check your device settings and try again.</p>}
    {route.status === 'loading' && location.status === 'available' && <p className="route-status" role="status">Finding the driving route…</p>}
    {route.status === 'failed' && <p className="route-status" role="alert">Could not load the road route: {route.error}</p>}
    {route.status === 'ready' && <p className="route-status route-summary"><strong>{routeDistance}</strong> · about <strong>{routeDuration}</strong> by road</p>}
    <div className="route-actions">
      {['denied', 'unavailable'].includes(location.status) && <button type="button" onClick={() => { setLocation({ status: 'loading', position: null }); setRoute({ status: 'idle', data: null, error: '' }); setLocationAttempt(attempt => attempt + 1) }}>Try location again</button>}
      {location.status === 'available' && route.status === 'failed' && <button type="button" onClick={() => setRouteAttempt(attempt => attempt + 1)}>Try route again</button>}
    </div>
  </section>
}

function Detail() {
  const { id } = useParams()
  const hotel = useSelector(state => state.hotels.items.find(item => item.id === id))
  const hotelsStatus = useSelector(state => state.hotels.status)
  const hotelsError = useSelector(state => state.hotels.error)
  if (!hotel && ['idle', 'loading'].includes(hotelsStatus)) return <main className="form-wrap"><div className="empty-state"><h2>Loading hotel…</h2></div></main>
  if (!hotel && hotelsStatus === 'failed') return <main className="form-wrap"><div className="empty-state" role="alert"><h2>Could not load hotel</h2><p>{hotelsError}</p><Link to="/">Return to stays</Link></div></main>
  if (!hotel) return <main className="form-wrap"><div className="empty-state"><h2>Hotel not found</h2><Link to="/">Return to stays</Link></div></main>
  return <><Helmet><title>{hotel.title} | Havenstay</title><meta name="description" content={hotel.description.slice(0, 155)} /></Helmet><main className="detail-wrap"><Link to="/" className="back-link">← All stays</Link><div className="detail-title"><div><span className="eyebrow">TAMIL NADU HOTEL COLLECTION</span><h1>{hotel.title}</h1><p>{hotel.location}</p></div><div className="detail-actions"><Link to={`/edit/${hotel.id}`} className="edit-detail">Edit listing</Link><Link to={`/book/${hotel.id}`} className="submit-button">Request a stay →</Link></div></div><img className="detail-image" src={hotel.image} alt={`${hotel.title}, ${hotel.location}`} /><div className="detail-columns"><article><h2>Hotel details</h2><p>{hotel.description}</p><p className="coordinates">⌖ &nbsp;Approximate town coordinates only; this is not the property's street address: {hotel.latitude}, {hotel.longitude}</p></article><aside><span>INDICATIVE PRICE</span><strong>{money(hotel.price)}</strong><span>approx. / night · confirm with hotel</span><Link to={`/book/${hotel.id}`} className="submit-button">Request a stay →</Link></aside></div><HotelDirections hotel={hotel} /><p className="booking-disclaimer">Prices and property details have not been independently verified. Contact the hotel directly to confirm exact address, availability, and current rates.</p></main><footer><span>© 2025 Havenstay</span><span>Stay a little closer to somewhere new.</span><Link to="/">Back to stays</Link></footer></>
}

function App() {
  const dispatch = useDispatch()
  const hotelsStatus = useSelector(state => state.hotels.status)
  useEffect(() => {
    if (hotelsStatus === 'idle') dispatch(fetchHotels())
  }, [dispatch, hotelsStatus])

  return <div className="app-shell"><Header /><Routes><Route path="/" element={<Home />} /><Route path="/new" element={<HotelForm />} /><Route path="/edit/:id" element={<HotelForm />} /><Route path="/hotel/:id" element={<Detail />} /><Route path="/book/:id" element={<BookingRequest />} /></Routes></div>
}

export default App
