import { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, Route, Routes, useNavigate, useParams } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { addHotel, deleteHotel, fetchHotels, updateHotel } from './hotelSlice'
import './App.css'

const money = (value) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value)
const emptyHotelForm = { title: '', description: '', latitude: '', longitude: '', price: '', image: '', location: '' }

function Header() {
  return <header className="topbar"><Link className="brand" to="/"><span className="brand-mark">H</span><span>haven<span className="brand-light">stay</span></span></Link><nav><Link to="/">Explore stays</Link><a href="#about">About</a></nav><Link to="/new" className="host-link">＋ <span>Add a hotel</span></Link></header>
}

function HotelCard({ hotel, onDelete }) {
  return <article className="hotel-card">
    <Link to={`/hotel/${hotel.id}`} className="card-photo"><img src={hotel.image} alt={`${hotel.title} in ${hotel.location}`} /><span className="photo-tag">{hotel.imageIsVerified ? 'HOTEL PHOTO' : 'REPRESENTATIVE PHOTO'}</span></Link>
    <div className="card-content"><div className="card-title-line"><Link to={`/hotel/${hotel.id}`}><h3>{hotel.title}</h3></Link></div><p className="location-label">{hotel.location}</p><p className="description-snippet">{hotel.description}</p><div className="card-footer"><span><strong>{money(hotel.price)}</strong> <span className="night">approx. / night</span></span><div className="card-actions"><Link to={`/edit/${hotel.id}`} aria-label={`Edit ${hotel.title}`}>Edit</Link><button onClick={() => onDelete(hotel.id)} aria-label={`Delete ${hotel.title}`}>Delete</button></div></div></div>
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
  const filtered = useMemo(() => hotels.filter(h =>
    (h.title.toLowerCase().includes(query.toLowerCase()) || h.location.toLowerCase().includes(query.toLowerCase())) &&
    (min === '' || h.price >= Number(min)) &&
    (max === '' || h.price <= Number(max))), [hotels, query, min, max])
  const remove = async (id) => {
    try {
      await dispatch(deleteHotel(id)).unwrap()
      setNotice('Hotel removed successfully')
      window.setTimeout(() => setNotice(''), 2800)
    } catch (error) {
      setNotice(error || 'Could not delete this hotel.')
    }
  }
  const updateFilter = (setter) => (event) => setter(event.target.value)
  return <><Helmet><title>Find your next stay | Havenstay</title><meta name="description" content="Browse boutique hotels and find your next memorable stay." /></Helmet><main>
    <section className="hero"><div className="hero-copy"><span className="eyebrow">YOUR NEXT GETAWAY STARTS HERE</span><h1>Find a place<br />to <em>belong.</em></h1><p>Thoughtful stays for the curious traveler.<br />Find your corner of the world.</p><a href="#stays" className="hero-button">Explore stays <span>↘</span></a></div><div className="hero-image"><img alt="A peaceful modern hotel retreat beside the sea" src="https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1400&q=85"/><span className="image-note">Somewhere worth slowing down <span>↗</span></span></div><div className="hero-index">01 <span>—</span> 04</div></section>
    <section className="listing" id="stays"><div className="section-head"><div><span className="eyebrow">TAMIL NADU HOTEL COLLECTION</span><h2>Places to stay</h2></div><p>Approximate nightly prices in INR.<br />Confirm current rates with the hotel.</p></div>
      <div className="filters"><label className="search-box"><span>⌕</span><input value={query} onChange={updateFilter(setQuery)} placeholder="Search destinations or stays" aria-label="Search hotels by name or location" /></label><div className="price-filter"><span>Price per night</span><label><span className="sr-only">Minimum price</span><input type="number" min="0" value={min} onChange={updateFilter(setMin)} placeholder="Min ₹" /></label><span className="price-dash">—</span><label><span className="sr-only">Maximum price</span><input type="number" min="0" value={max} onChange={updateFilter(setMax)} placeholder="Max ₹" /></label></div><button className="filter-reset" onClick={() => { setQuery(''); setMin(''); setMax('') }}>Reset</button></div>
      <div className="results-line"><span>{filtered.length} stays to inspire your next trip</span><span>Sort by <strong>Recommended⌄</strong></span></div>
      {status === 'loading' && hotels.length === 0 ? <div className="empty-state"><h3>Loading hotels…</h3></div>
        : status === 'failed' && hotels.length === 0 ? <div className="empty-state" role="alert"><h3>Could not load hotels</h3><p>{loadError}</p><button className="submit-button" onClick={() => dispatch(fetchHotels())}>Try again</button></div>
          : filtered.length ? <div className="hotel-grid">{filtered.map(hotel => <HotelCard key={hotel.id} hotel={hotel} onDelete={remove} />)}</div> : <div className="empty-state"><span>⌕</span><h3>No stays found</h3><p>Try a different title or price range.</p></div>}
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
  const change = (event) => setForm(current => ({ ...(current || hotel || emptyHotelForm), [event.target.name]: event.target.value }))
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
    setSaving(true)
    setError('')
    try {
      let image = currentForm.image
      if (pendingImage) {
        const body = new FormData()
        body.append('image', pendingImage)
        const response = await fetch('/api/uploads', { method: 'POST', body })
        const result = await response.json()
        if (!response.ok) throw new Error(result.error || 'Could not upload hotel photo.')
        image = result.url
      }
      const record = {
        ...currentForm,
        image,
        imageIsVerified: pendingImage ? true : currentForm.imageIsVerified,
        price: Number(currentForm.price),
        latitude: Number(currentForm.latitude),
        longitude: Number(currentForm.longitude),
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
    <label>Location<input name="location" value={currentForm.location} onChange={change} required maxLength="200" placeholder="e.g. Coimbatore, Tamil Nadu" /></label>
    <label>Description<textarea name="description" value={currentForm.description} onChange={change} required rows="4" maxLength="800" placeholder="What makes this stay special?" /></label>
    <div className="form-row"><label>Latitude<input type="number" name="latitude" value={currentForm.latitude} onChange={change} required step="any" min="-90" max="90" placeholder="−90 to 90" /></label><label>Longitude<input type="number" name="longitude" value={currentForm.longitude} onChange={change} required step="any" min="-180" max="180" placeholder="−180 to 180" /></label></div>
    <label>Approx. price per night (INR)<input type="number" name="price" value={currentForm.price} onChange={change} required min="1" step="1" placeholder="e.g. 6500" /></label>
    {error && <p className="form-error" role="alert">{error}</p>}<div className="form-actions"><Link to="/" className="cancel-button">Cancel</Link><button type="submit" className="submit-button" disabled={saving}>{saving ? 'Saving…' : id ? 'Save changes' : 'Add hotel'} <span>→</span></button></div>
  </form></main></>
}

function Detail() {
  const { id } = useParams()
  const hotel = useSelector(state => state.hotels.items.find(item => item.id === id))
  const hotelsStatus = useSelector(state => state.hotels.status)
  const hotelsError = useSelector(state => state.hotels.error)
  if (!hotel && ['idle', 'loading'].includes(hotelsStatus)) return <main className="form-wrap"><div className="empty-state"><h2>Loading hotel…</h2></div></main>
  if (!hotel && hotelsStatus === 'failed') return <main className="form-wrap"><div className="empty-state" role="alert"><h2>Could not load hotel</h2><p>{hotelsError}</p><Link to="/">Return to stays</Link></div></main>
  if (!hotel) return <main className="form-wrap"><div className="empty-state"><h2>Hotel not found</h2><Link to="/">Return to stays</Link></div></main>
  return <><Helmet><title>{hotel.title} | Havenstay</title><meta name="description" content={hotel.description.slice(0, 155)} /></Helmet><main className="detail-wrap"><Link to="/" className="back-link">← All stays</Link><div className="detail-title"><div><span className="eyebrow">TAMIL NADU HOTEL COLLECTION</span><h1>{hotel.title}</h1><p>{hotel.location}</p></div><Link to={`/edit/${hotel.id}`} className="edit-detail">Edit listing</Link></div><img className="detail-image" src={hotel.image} alt={`${hotel.title}, ${hotel.location}`} /><div className="detail-columns"><article><h2>Hotel details</h2><p>{hotel.description}</p><p className="coordinates">⌖ &nbsp;Approximate town coordinates: {hotel.latitude}, {hotel.longitude}</p></article><aside><span>APPROX. FROM</span><strong>{money(hotel.price)}</strong><span>per night · confirm with hotel</span><Link to="/" className="submit-button">Explore more stays →</Link></aside></div><h2 className="map-title">Explore {hotel.location}</h2><div className="map-frame"><iframe title={`Map showing ${hotel.location}`} loading="lazy" src={`https://www.openstreetmap.org/export/embed.html?bbox=${hotel.longitude - 0.04}%2C${hotel.latitude - 0.025}%2C${hotel.longitude + 0.04}%2C${hotel.latitude + 0.025}&layer=mapnik&marker=${hotel.latitude}%2C${hotel.longitude}`} /><a href={`https://www.openstreetmap.org/?mlat=${hotel.latitude}&mlon=${hotel.longitude}#map=13/${hotel.latitude}/${hotel.longitude}`} target="_blank" rel="noreferrer">View larger map ↗</a></div></main><footer><span>© 2025 Havenstay</span><span>Stay a little closer to somewhere new.</span><Link to="/">Back to stays</Link></footer></>
}

function App() {
  const dispatch = useDispatch()
  const hotelsStatus = useSelector(state => state.hotels.status)
  useEffect(() => {
    if (hotelsStatus === 'idle') dispatch(fetchHotels())
  }, [dispatch, hotelsStatus])

  return <div className="app-shell"><Header /><Routes><Route path="/" element={<Home />} /><Route path="/new" element={<HotelForm />} /><Route path="/edit/:id" element={<HotelForm />} /><Route path="/hotel/:id" element={<Detail />} /></Routes></div>
}

export default App
