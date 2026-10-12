import { useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, Route, Routes, useNavigate, useParams } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { addHotel, deleteHotel, updateHotel } from './hotelSlice'
import './App.css'

const money = (value) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value)

function Header() {
  return <header className="topbar"><Link className="brand" to="/"><span className="brand-mark">H</span><span>haven<span className="brand-light">stay</span></span></Link><nav><Link to="/">Explore stays</Link><a href="#about">About</a></nav><Link to="/new" className="host-link">＋ <span>Add a hotel</span></Link></header>
}

function HotelCard({ hotel, onDelete }) {
  return <article className="hotel-card">
    <Link to={`/hotel/${hotel.id}`} className="card-photo"><img src={hotel.image} alt={`${hotel.title} hotel`} /><span className="photo-tag">GUEST FAVORITE</span><span className="favorite" aria-label="Favorite">♡</span></Link>
    <div className="card-content"><div className="card-title-line"><Link to={`/hotel/${hotel.id}`}><h3>{hotel.title}</h3></Link><span className="rating">★ 4.9</span></div><p className="location-label">{hotel.location}</p><p className="description-snippet">{hotel.description}</p><div className="card-footer"><span><strong>{money(hotel.price)}</strong> <span className="night">/ night</span></span><div className="card-actions"><Link to={`/edit/${hotel.id}`} aria-label={`Edit ${hotel.title}`}>Edit</Link><button onClick={() => onDelete(hotel.id)} aria-label={`Delete ${hotel.title}`}>Delete</button></div></div></div>
  </article>
}

function Pagination({ page, pageCount, onChange }) {
  if (pageCount <= 1) return null
  return <div className="pagination"><button disabled={page === 1} onClick={() => onChange(page - 1)}>←</button>{Array.from({ length: pageCount }, (_, i) => i + 1).map(number => <button key={number} className={number === page ? 'active' : ''} onClick={() => onChange(number)}>{number}</button>)}<button disabled={page === pageCount} onClick={() => onChange(page + 1)}>→</button></div>
}

function Home() {
  const hotels = useSelector(state => state.hotels.items)
  const dispatch = useDispatch()
  const [query, setQuery] = useState('')
  const [min, setMin] = useState('')
  const [max, setMax] = useState('')
  const [page, setPage] = useState(1)
  const [notice, setNotice] = useState('')
  const perPage = 6
  const filtered = useMemo(() => hotels.filter(h => h.title.toLowerCase().includes(query.toLowerCase()) && (min === '' || h.price >= Number(min)) && (max === '' || h.price <= Number(max))), [hotels, query, min, max])
  const pageCount = Math.ceil(filtered.length / perPage)
  const visible = filtered.slice((page - 1) * perPage, page * perPage)
  const remove = (id) => { dispatch(deleteHotel(id)); setNotice('Hotel removed successfully'); window.setTimeout(() => setNotice(''), 2800) }
  const updateFilter = (setter) => (event) => { setter(event.target.value); setPage(1) }
  return <><Helmet><title>Find your next stay | Havenstay</title><meta name="description" content="Browse boutique hotels and find your next memorable stay." /></Helmet><main>
    <section className="hero"><div className="hero-copy"><span className="eyebrow">YOUR NEXT GETAWAY STARTS HERE</span><h1>Find a place<br />to <em>belong.</em></h1><p>Thoughtful stays for the curious traveler.<br />Find your corner of the world.</p><a href="#stays" className="hero-button">Explore stays <span>↘</span></a></div><div className="hero-image"><img alt="A peaceful modern hotel retreat beside the sea" src="https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1400&q=85"/><span className="image-note">Somewhere worth slowing down <span>↗</span></span></div><div className="hero-index">01 <span>—</span> 04</div></section>
    <section className="listing" id="stays"><div className="section-head"><div><span className="eyebrow">CURATED FOR YOU</span><h2>Places to stay</h2></div><p>Find the stay that makes<br />the whole trip.</p></div>
      <div className="filters"><label className="search-box"><span>⌕</span><input value={query} onChange={updateFilter(setQuery)} placeholder="Search destinations or stays" aria-label="Search hotels by title" /></label><div className="price-filter"><span>Price per night</span><label><span className="sr-only">Minimum price</span><input type="number" min="0" value={min} onChange={updateFilter(setMin)} placeholder="Min $" /></label><span className="price-dash">—</span><label><span className="sr-only">Maximum price</span><input type="number" min="0" value={max} onChange={updateFilter(setMax)} placeholder="Max $" /></label></div><button className="filter-reset" onClick={() => { setQuery(''); setMin(''); setMax(''); setPage(1) }}>Reset</button></div>
      <div className="results-line"><span>{filtered.length} stays to inspire your next trip</span><span>Sort by <strong>Recommended⌄</strong></span></div>
      {visible.length ? <div className="hotel-grid">{visible.map(hotel => <HotelCard key={hotel.id} hotel={hotel} onDelete={remove} />)}</div> : <div className="empty-state"><span>⌕</span><h3>No stays found</h3><p>Try a different title or price range.</p></div>}
      <Pagination page={page} pageCount={pageCount} onChange={setPage} />
    </section>
  </main><footer id="about"><span>© 2025 Havenstay</span><span>Stay a little closer to somewhere new.</span><a href="#stays">Back to top ↑</a></footer>{notice && <div className="toast" role="status"><span>✓</span>{notice}</div>}</>
}

function HotelForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const hotel = useSelector(state => state.hotels.items.find(item => item.id === id))
  const [form, setForm] = useState(() => hotel ? { ...hotel } : { title: '', description: '', latitude: '', longitude: '', price: '', image: '', location: '' })
  const [error, setError] = useState('')
  const change = (event) => setForm(current => ({ ...current, [event.target.name]: event.target.value }))
  const imageChange = (event) => { const file = event.target.files?.[0]; if (file) setForm(current => ({ ...current, image: URL.createObjectURL(file) })) }
  const submit = (event) => {
    event.preventDefault()
    if (!form.title.trim() || !form.description.trim() || !form.image) return setError('Add a title, description, and hotel photo.')
    if (form.latitude === '' || Number(form.latitude) < -90 || Number(form.latitude) > 90 || form.longitude === '' || Number(form.longitude) < -180 || Number(form.longitude) > 180) return setError('Enter valid latitude (−90 to 90) and longitude (−180 to 180).')
    if (!form.price || Number(form.price) <= 0) return setError('Price must be greater than zero.')
    const record = { ...form, id: id || crypto.randomUUID(), price: Number(form.price), latitude: Number(form.latitude), longitude: Number(form.longitude), location: form.location || `${Number(form.latitude).toFixed(2)}, ${Number(form.longitude).toFixed(2)}` }
    dispatch(id ? updateHotel(record) : addHotel(record)); navigate('/')
  }
  if (id && !hotel) return <main className="form-wrap"><div className="empty-state"><h2>Hotel not found</h2><Link to="/">Return to stays</Link></div></main>
  return <><Helmet><title>{id ? 'Edit stay' : 'Add a stay'} | Havenstay</title><meta name="description" content="Manage hotel stay details on Havenstay." /></Helmet><main className="form-wrap"><Link to="/" className="back-link">← Back to stays</Link><div className="form-heading"><span className="eyebrow">{id ? 'UPDATE YOUR LISTING' : 'GROW THE COLLECTION'}</span><h1>{id ? 'Edit your stay' : 'Add a new stay'}</h1><p>Share the details that help travelers find their perfect place.</p></div><form className="hotel-form" onSubmit={submit}>
    <label className="upload-box">{form.image ? <img className="preview" src={form.image} alt="Hotel upload preview" /> : <span className="upload-icon">↑</span>}<strong>{form.image ? 'Change photo' : 'Upload a hotel photo'}</strong><small>JPG or PNG · A beautiful wide shot works best</small><input type="file" accept="image/*" onChange={imageChange} /></label>
    <label>Hotel name<input name="title" value={form.title} onChange={change} required maxLength="100" placeholder="e.g. The Shoreline House" /></label>
    <label>Location<input name="location" value={form.location} onChange={change} placeholder="e.g. Ubud, Bali" /></label>
    <label>Description<textarea name="description" value={form.description} onChange={change} required rows="4" maxLength="800" placeholder="What makes this stay special?" /></label>
    <div className="form-row"><label>Latitude<input type="number" name="latitude" value={form.latitude} onChange={change} required step="any" min="-90" max="90" placeholder="−90 to 90" /></label><label>Longitude<input type="number" name="longitude" value={form.longitude} onChange={change} required step="any" min="-180" max="180" placeholder="−180 to 180" /></label></div>
    <label>Price per night (USD)<input type="number" name="price" value={form.price} onChange={change} required min="1" step="1" placeholder="e.g. 240" /></label>
    {error && <p className="form-error" role="alert">{error}</p>}<div className="form-actions"><Link to="/" className="cancel-button">Cancel</Link><button type="submit" className="submit-button">{id ? 'Save changes' : 'Add hotel'} <span>→</span></button></div>
  </form></main></>
}

function Detail() {
  const { id } = useParams()
  const hotel = useSelector(state => state.hotels.items.find(item => item.id === id))
  if (!hotel) return <main className="form-wrap"><div className="empty-state"><h2>Hotel not found</h2><Link to="/">Return to stays</Link></div></main>
  return <><Helmet><title>{hotel.title} | Havenstay</title><meta name="description" content={hotel.description.slice(0, 155)} /></Helmet><main className="detail-wrap"><Link to="/" className="back-link">← All stays</Link><div className="detail-title"><div><span className="eyebrow">A HAVENSTAY COLLECTION</span><h1>{hotel.title}</h1><p>{hotel.location} <span>·</span> ★ 4.9 (128 reviews)</p></div><Link to={`/edit/${hotel.id}`} className="edit-detail">Edit listing</Link></div><img className="detail-image" src={hotel.image} alt={`${hotel.title}, ${hotel.location}`} /><div className="detail-columns"><article><h2>A stay to remember</h2><p>{hotel.description}</p><p className="coordinates">⌖ &nbsp;{hotel.latitude}, {hotel.longitude}</p></article><aside><span>FROM</span><strong>{money(hotel.price)}</strong><span>per night</span><Link to="/" className="submit-button">Explore more stays →</Link></aside></div><h2 className="map-title">Find your way here</h2><div className="map-frame"><iframe title={`Map showing ${hotel.title} location`} loading="lazy" src={`https://www.openstreetmap.org/export/embed.html?bbox=${hotel.longitude - 0.04}%2C${hotel.latitude - 0.025}%2C${hotel.longitude + 0.04}%2C${hotel.latitude + 0.025}&layer=mapnik&marker=${hotel.latitude}%2C${hotel.longitude}`} /><a href={`https://www.openstreetmap.org/?mlat=${hotel.latitude}&mlon=${hotel.longitude}#map=13/${hotel.latitude}/${hotel.longitude}`} target="_blank" rel="noreferrer">View larger map ↗</a></div></main><footer><span>© 2025 Havenstay</span><span>Stay a little closer to somewhere new.</span><Link to="/">Back to stays</Link></footer></>
}

function App() {
  return <div className="app-shell"><Header /><Routes><Route path="/" element={<Home />} /><Route path="/new" element={<HotelForm />} /><Route path="/edit/:id" element={<HotelForm />} /><Route path="/hotel/:id" element={<Detail />} /></Routes></div>
}

export default App
