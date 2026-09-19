import { useState, useEffect, useRef } from 'react'
import * as api from './api'
import carticon from '../assets/cart-shopping-svgrepo-com.svg'
import heroBanner from '../assets/menup.png'
import mainimg from '../assets/header.png'
import { Routes, Route, Navigate, Link, useLocation } from 'react-router-dom'
function Header() {
    const [food, setFood] = useState([])
  const [drinks, setDrinks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [count, setCount] = useState(0)
  const [totalprice, setTotalprice] = useState(0)
  const [cart, setCart] = useState([])
  const [selectedItem, setSelectedItem] = useState(null)
  const [qty, setQty] = useState(1)
  const [foodCategories, setFoodCategories] = useState([])
  const [drinkCategories, setDrinkCategories] = useState([])
  const [activeTab, setActiveTab] = useState('food')
  const [activeCategory, setActiveCategory] = useState(null)

  // navigation pages: 'mainpage' | 'menu' | 'offers' | 'contact'
  const [activePageView, setActivePageView] = useState('menu')
  const [offers, setOffers] = useState([])
  const [addresses, setAddresses] = useState([])
  const [cartSheetOpen, setCartSheetOpen] = useState(false)
  const [formData, setFormData] = useState({ note: '', address: '', home: '', street: '' })
  const [pendingScrollKey, setPendingScrollKey] = useState(null)
  const categoryRefs = useRef({})
  const pillRefs = useRef({})
  const pillBarRef = useRef(null)

  function SkeletonItem() {
    return (
      <div className="menu-item skeleton-item" aria-hidden="true">
        <div className="skeleton skeleton-img" />
        <div className="menu-info">
          <div className="skeleton skeleton-line" style={{ width: '60%' }} />
          <div className="skeleton skeleton-line" style={{ width: '35%', marginTop: 8 }} />
        </div>
        <div className="skeleton skeleton-btn" />
      </div>
    )
  }

  function SkeletonSection() {
    return (
      <div className="menu-category-group">
        <div className="skeleton skeleton-title" />
        {[1, 2, 3].map((k) => <SkeletonItem key={k} />)}
      </div>
    )
  }


  /* ── fetch ── */
  useEffect(() => {
    async function fetchMenu() {
      try {
        const [foodData, drinkData, foodCats, drinkCats] = await Promise.all([
          api.getFood(),
          api.getDrinks(),
          api.getCategoryByType('food'),
          api.getCategoryByType('drink'),
        ])
        setFood(foodData)
        setDrinks(drinkData)
        setFoodCategories(Array.isArray(foodCats) ? foodCats : [])
        setDrinkCategories(Array.isArray(drinkCats) ? drinkCats : [])
      } catch (err) {
        console.error(err)
        setError('Could not load menu. Please try again later.')
      } finally {
        setLoading(false)
      }
    }

    async function fetchOffersAndAddresses() {
      try {
        const [offersData, addressesData] = await Promise.all([
          api.getOrderdates().catch(() => []),
          api.getaddress().catch(() => [])
        ])
        setOffers(Array.isArray(offersData) ? offersData : [])
        setAddresses(Array.isArray(addressesData) ? addressesData : [])
      } catch (err) {
        console.error('Failed to load offers or addresses:', err)
      }
    }

    fetchMenu()
    fetchOffersAndAddresses()
  }, [])

  /* ── IntersectionObserver: highlight active pill as user scrolls ── */
  useEffect(() => {
    const refs = categoryRefs.current
    if (!Object.keys(refs).length) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const key = entry.target.dataset.refkey
            setActiveCategory(key)
            const pill = pillRefs.current[key]
            const bar = pillBarRef.current
            if (pill && bar) {
              const pillLeft = pill.offsetLeft
              const pillWidth = pill.offsetWidth
              const barWidth = bar.offsetWidth
              bar.scrollTo({ left: pillLeft - barWidth / 2 + pillWidth / 2, behavior: 'smooth' })
            }
          }
        })
      },
      { rootMargin: '-30% 0px -60% 0px', threshold: 0 }
    )

    Object.values(refs).forEach((el) => { if (el) observer.observe(el) })
    return () => observer.disconnect()
  }, [food, drinks, foodCategories, drinkCategories, activeTab])

  const handlesum = (item, quantity = 1) => {
    setCount((prev) => prev + quantity)
    setTotalprice((prev) => prev + Number(item.price) * quantity)

    setCart((prev) => {
      const existing = prev.find((c) => c.id === item.id)
      if (existing) {
        return prev.map((c) =>
          c.id === item.id ? { ...c, qty: c.qty + quantity } : c
        )
      }
      return [...prev, { id: item.id, name: item.item_name, price: item.price, qty: quantity }]
    })
  }

  const openItem = (item) => { setSelectedItem(item); setQty(1) }
  const closeItem = () => setSelectedItem(null)

  const addSelectedToCart = () => {
    handlesum(selectedItem, qty)
    closeItem()
  }

  const scrollToCategory = (key) => {
    const el = categoryRefs.current[key]
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmitAddress = () => {
    const orderLines = cart
      .map((c) => `${c.qty} x ${c.name} — ${(c.price * c.qty).toFixed(2)} $`)
      .join('\n')

    const message =
      `New Order:\n\n` +
      `${orderLines}\n\n` +
      `Total: ${totalprice.toFixed(2)} $\n\n` +
      `Address: ${formData.address}\n` +
      `Home: ${formData.home}\n` +
      `Street: ${formData.street}\n` +
      `Note: ${formData.note}`

    const url = `https://wa.me/96181814215?text=${encodeURIComponent(message)}`
    window.open(url, '_blank', 'noopener,noreferrer')

    setCart([])
    setCount(0)
    setTotalprice(0)
    setCartSheetOpen(false)
  }

  const currentCategories = activeTab === 'food' ? foodCategories : drinkCategories
  const currentItems = activeTab === 'food' ? food : drinks
  const currentallcategories = [...foodCategories, ...drinkCategories]
  const allitems = [...food, ...drinks]
  const renderItem = (item) => (
    <div key={item.id} className="menu-item" onClick={() => openItem(item)}>
      <img className="menu-img" src={item.image} alt={item.item_name} loading="lazy" />
      <div className="menu-info">
        <h3 className="menu-item-name">{item.item_name}</h3>
        {item.description && (
          <p className="menu-item-desc">{item.description}</p>
        )}
        <span className="menu-price">{Number(item.price).toFixed(2)} $</span>
      </div>
      <button
        className="menu-add-btn"
        aria-label={`Add ${item.item_name} to cart`}
        onClick={(e) => { e.stopPropagation(); handlesum(item, 1) }}
      >
        +
      </button>
    </div>
  )

  const renderGrouped = () => (
    <>
      {currentCategories.map((c) => {
        const itemsInCat = currentItems.filter((item) => item.category_id === c.id)
        if (itemsInCat.length === 0) return null
        const refKey = `${activeTab}-${c.id}`
        return (
          <div
            key={c.id}
            ref={(el) => { categoryRefs.current[refKey] = el }}
            data-refkey={refKey}
            className="menu-category-group"
          >
            <h2 className="menu-category-title">{c.category}</h2>
            <div className="menu-grid">
              {itemsInCat.map(renderItem)}
            </div>
          </div>
        )
      })}
    </>
  )

 
  return (
    <>
      <div className="main-nav-bar">
        <img src="./src/assets/manulogo.png" alt="Logo" className="app-nav-logo" />
      
    
        <button
          className={`main-nav-btn ${activePageView === 'mainpage' ? 'main-nav-btn--active' : ''}`}
          onClick={() => setActivePageView('menu')}
        >
         🍽️ القائمة | Menu
        </button>
        <button
          className={`main-nav-btn ${activePageView === 'offers' ? 'main-nav-btn--active' : ''}`}
          onClick={() => setActivePageView('offers')}
        >
          🏷️ العروض | Offers
        </button>
        <button
          className={`main-nav-btn ${activePageView === 'contact' ? 'main-nav-btn--active' : ''}`}
          onClick={() => setActivePageView('contact')}
        >
          📞 اتصل بنا | Contact
        </button>

      </div>
      <hr style={{ width: '100%', color: 'black', height: '1px' }} />
  
      {activePageView === 'menu' && (
        <div className="menu-view-enter">
          <div className="menu-container">
            <img src="./src/assets/manulogo.png" alt="Menu banner" className="app-nav-logo" />
            <h1 className="menu-hero-title">مطعم ابن البلد</h1>
            <p className="menu-hero-sub">Fresh · Delicious · Made with love</p>

            {/* ── Tab switcher: Food | Drinks ── */}
            <div className="tab-bar" role="tablist">
              <button
                role="tab"
                id="tab-food"
                aria-selected={activeTab === 'food'}
                className={`tab-btn ${activeTab === 'food' ? 'tab-btn--active' : ''}`}
                onClick={() => setActiveTab('food')}
              >
                🍔 طعام
              </button>
              <button
                role="tab"
                id="tab-drink"
                aria-selected={activeTab === 'drink'}
                className={`tab-btn ${activeTab === 'drink' ? 'tab-btn--active' : ''}`}
                onClick={() => setActiveTab('drink')}
              >
                🥤 مشروبات
              </button>
            </div>

            {/* ── Sticky category pill nav ── */}
            <div className="category-pill-bar-wrapper">
              <div className="category-pill-bar" ref={pillBarRef} role="navigation" aria-label="Menu categories">
                {currentCategories.map((c) => {
                  const key = `${activeTab}-${c.id}`
                  return (
                    <button
                      key={key}
                      ref={(el) => { pillRefs.current[key] = el }}
                      className={`category-pill ${activeCategory === key ? 'category-pill--active' : ''}`}
                      onClick={() => scrollToCategory(key)}
                    >
                      {c.category}
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="menu-body">
              {renderGrouped()}
            </div>
          </div>

          <div
            className={`cart-bar ${count > 0 ? 'cart-bar--visible' : count === 0 ? 'empty-cart' : ''}`}
            role="button"
            tabIndex={0}
            aria-label={`View cart — ${count} item${count !== 1 ? 's' : ''}, total ${totalprice.toFixed(2)} $`}
            onClick={() => count > 0 && setCartSheetOpen(true)}
            onKeyDown={(e) => e.key === 'Enter' && count > 0 && setCartSheetOpen(true)}
          >
            <div className="cart-bar-left">
              <img src={carticon} alt="" className="cart-bar-icon" />
              {count > 0 && <span className="cart-badge">{count}</span>}
            </div>
            <span className="cart-bar-label">
              {count === 0 ? 'Your cart is empty' : 'View Order'}
            </span>
            <span className="cart-bar-total">
              {totalprice > 0 ? `${totalprice.toFixed(2)} $` : ''}
            </span>
          </div>

          {/* ── Item detail bottom-sheet ── */}
          {selectedItem && (
            <div className="sheet-overlay" onClick={closeItem} aria-modal="true" role="dialog">
              <div className="bottom-sheet item-sheet" onClick={(e) => e.stopPropagation()}>
                <div className="sheet-handle" />
                <button className="sheet-close-btn" onClick={closeItem} aria-label="Close">✕</button>

                <img
                  className="item-sheet-img"
                  src={selectedItem.image}
                  alt={selectedItem.item_name}
                />

                <div className="item-sheet-body">
                  <h2 className="item-sheet-title">{selectedItem.item_name}</h2>
                  {selectedItem.description && (
                    <p className="item-sheet-desc">{selectedItem.description}</p>
                  )}

                  <div className="item-sheet-footer">
                    <div className="item-modal-qty">
                      <button
                        onClick={() => setQty((q) => Math.max(1, q - 1))}
                        disabled={qty <= 1}
                        aria-label="Decrease quantity"
                      >−</button>
                      <span className="qty-value">{qty}</span>
                      <button onClick={() => setQty((q) => q + 1)} aria-label="Increase quantity">+</button>
                    </div>

                    <button className="add-to-cart-btn" onClick={addSelectedToCart}>
                      Add to cart · {(selectedItem.price * qty).toFixed(2)} $
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── Address / order bottom-sheet ── */}
          {cartSheetOpen && (
            <div className="sheet-overlay" onClick={() => setCartSheetOpen(false)} aria-modal="true" role="dialog">
              <div className="bottom-sheet address-sheet" onClick={(e) => e.stopPropagation()}>
                <div className="sheet-handle" />
                <button className="sheet-close-btn" onClick={() => setCartSheetOpen(false)} aria-label="Close">✕</button>

                <div className="address-sheet-body">
                  <h2 className="address-sheet-title">Complete Your Order</h2>
                  <div className="address-sheet-subtitle">
                    <ul className="order-summary-list">
                      {cart.map((c) => (
                        <li key={c.id} className="order-summary-item">
                          <span className="order-summary-name">
                            {c.name} <span className="order-summary-qty">× {c.qty}</span>
                          </span>
                          <span className="order-summary-price">
                            {(c.price * c.qty).toFixed(2)} $
                          </span>
                        </li>
                      ))}
                    </ul>
                    <div className="order-summary-total">
                      <span>Total=</span>
                      <strong>{totalprice.toFixed(2)} $</strong>
                    </div>
                  </div>

                  <form onSubmit={(e) => e.preventDefault()} className="address-form" noValidate>
                    <label className="form-label" htmlFor="address">Delivery Address</label>
                    <input
                      id="address"
                      name="address"
                      type="text"
                      inputMode="text"
                      autoComplete="street-address"
                      placeholder="e.g. Downtown, Beirut"
                      value={formData.address}
                      onChange={handleChange}
                      className="form-input"
                    />

                    <label className="form-label" htmlFor="home">Building / Apartment</label>
                    <input
                      id="home"
                      name="home"
                      type="text"
                      inputMode="text"
                      placeholder="e.g. Building 5, Apt 3"
                      value={formData.home}
                      onChange={handleChange}
                      className="form-input"
                    />

                    <label className="form-label" htmlFor="street">Street</label>
                    <input
                      id="street"
                      name="street"
                      type="text"
                      inputMode="text"
                      placeholder="e.g. Main Street"
                      value={formData.street}
                      onChange={handleChange}
                      className="form-input"
                    />

                    <label className="form-label" htmlFor="note">Note to kitchen (optional)</label>
                    <input
                      id="note"
                      name="note"
                      type="text"
                      inputMode="text"
                      placeholder="e.g. No onions please"
                      value={formData.note}
                      onChange={handleChange}
                      className="form-input"
                    />

                    <button
                      type="button"
                      className="whatsapp-btn"
                      onClick={handleSubmitAddress}
                    >
                      <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20" aria-hidden="true">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347" />
                      </svg>
                      Order on WhatsApp
                    </button>
                  </form>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {activePageView === 'offers' && (
        <div className="offers-view animate-fade-in">
          <h2 className="section-title">🏷️ Special Offers | العروض المميزة</h2>
          {offers.length === 0 ? (
            <div className="empty-offers-state">
              <span className="empty-offers-icon">🎁</span>
              <p>No active offers at the moment. Check back soon!</p>
              <p className="ar-text">لا توجد عروض نشطة حالياً. تفقدنا لاحقاً!</p>
            </div>
          ) : (
            <div className="offers-grid">
              {offers.map((offer) => (
                <div key={offer.id} className="offer-card">
                  <div className="offer-img-wrapper">
                    {offer.img ? (
                      <img src={offer.img} alt={offer.name} className="offer-img" />
                    ) : (
                      <div className="offer-img-placeholder">🍽️</div>
                    )}
                    <span className="offer-badge">Special Offer</span>
                  </div>
                  <div className="offer-info">
                    <h3 className="offer-name">{offer.name}</h3>
                    <div className="offer-price-row">
                      <span className="offer-price">{Number(offer.price).toFixed(2)} $</span>
                      <button
                        className="offer-add-btn"
                        onClick={() => handlesum({ id: `offer-${offer.id}`, item_name: offer.name, price: offer.price }, 1)}
                      >
                        + Add to Order
                      </button>
                    </div>
                    <div className="offer-dates">
                      <span>📅 {new Date(offer.date_start).toLocaleDateString()} - {new Date(offer.date_end).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
        </div> 
      )}

      {activePageView === 'contact' && (
        <div className="contact-view animate-fade-in">
          <h2 className="section-title">📞 Contact Us | اتصل بنا</h2>

          <div className="contact-grid">
            <div className="contact-card">
              <div className="contact-card-icon">🕒</div>
              <h3 className="contact-card-title">Opening Hours | ساعات العمل</h3>
              <p className="contact-card-detail">Everyday | يومياً</p>
              <p className="contact-card-highlight">12:00 PM - 12:00 AM</p>
            </div>

            <div className="contact-card">
              <div className="contact-card-icon">💬</div>
              <h3 className="contact-card-title">Quick Connect | اتصال سريع</h3>
              <p className="contact-card-detail">Order or inquire directly via WhatsApp or Phone</p>
              <div className="contact-actions">
                <a href="https://wa.me/96181814215" target="_blank" rel="noopener noreferrer" className="contact-action-btn whatsapp-action">
                  💬 Chat on WhatsApp
                </a>
                <a href="tel:+96181814215" className="contact-action-btn call-action">
                  📞 Call Us
                </a>
              </div>
            </div>

            <div className="contact-card">
              <div className="contact-card-icon">📍</div>
              <h3 className="contact-card-title">Our Locations | فروعنا</h3>
              {addresses.length === 0 ? (
                <div className="contact-default-address">
                  <p className="contact-card-detail">Main Branch:</p>
                  <p className="contact-card-highlight">Downtown, Beirut, Lebanon</p>
                </div>
              ) : (
                <div className="contact-address-list">
                  {addresses.map((addr) => (
                    <div key={addr.id} className="contact-address-item">
                      <p className="addr-main">📍 {addr.address}</p>
                      <p className="addr-sub">{addr.street}, {addr.home}</p>
                      {addr.note && <p className="addr-note">📝 Note: {addr.note}</p>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
export default Header