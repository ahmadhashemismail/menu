import { useState, useEffect } from 'react'
import {
  getFood,
  getDrinks,
  addFood,
  addDrink,
  updateFood,
  updateDrink,
  deleteFood,
  deleteDrink,
  addCategory,
  getCategoryByType,
  deleteCategory,
  getOrderdates,
  createOrderdate,
  updateOrderdate,
  deleteOrderdate,
} from './api'

/* ── tiny confirm dialog replacement ── */
const confirmAction = (msg) => window.confirm(msg)

const emptyOfferForm = {
  id: '',
  name: '',
  price: '',
  img: '',
  date_start: '',
  date_end: '',
}

function Admin() {
  const [food, setFood] = useState([])
  const [drinks, setDrinks] = useState([])
  const [category, setCategory] = useState('food') // 'food' | 'drink'
  const [category2, setCategory2] = useState('')
  const [form, setForm] = useState({ item_name: '', price: '', image: '' })
  const [editingId, setEditingId] = useState(null)
  const [categories, setCategories] = useState([])
  const [newCategoryName, setNewCategoryName] = useState('')
  const [foodCategories, setFoodCategories] = useState([])
  const [drinkCategories, setDrinkCategories] = useState([])

  // which tab is shown in the items list below: 'food' | 'drink'
  const [viewTab, setViewTab] = useState('food')

  // form bottom sheet open/closed
  const [formOpen, setFormOpen] = useState(false)

  // saving / deleting state
  const [saving, setSaving] = useState(false)

  /* ── offer / orderdate state ── */
  const [rows, setRows] = useState([])
  const [offerForm, setOfferForm] = useState(emptyOfferForm)
  const [loading, setLoading] = useState(false)
  const [isofferopen, setIsOfferOpen] = useState(false)

  function handleopenoffer() {
    setIsOfferOpen(true)
  }

  /* ── login state ──
     NOTE: this checks a hardcoded username/password sitting in the
     frontend JS. Anyone can read this in devtools or the built bundle.
     This is fine for a quick local prototype, but it is NOT real auth —
     move this check to your backend before this goes anywhere public. */
  const [LOGIN, SETLOGIN] = useState(false)
  const [adminForm, setAdminForm] = useState({ username: '', email: '', password: '' })
  const [loginError, setLoginError] = useState('')

  function handlelogin(e) {
    e.preventDefault()
    const validEmail = adminForm.email === 'admin@a.com' && adminForm.password === 'menu123'
    const validUsername = adminForm.username === 'admin' && adminForm.password === 'menu123'
    if (validEmail || validUsername) {
      setLoginError('')
      SETLOGIN(true)
    } else {
      setLoginError('Invalid username/email or password')
    }
  }

  function handleLogout() {
    SETLOGIN(false)
    setAdminForm({ username: '', email: '', password: '' })
  }

  /* ── data fetching ── */
  const fetchAll = async () => {
    try {
      const [foodData, drinkData] = await Promise.all([getFood(), getDrinks()])
      setFood(foodData)
      setDrinks(drinkData)
    } catch (err) {
      console.error(err)
    }
  }

  const fetchCategories = async () => {
    try {
      const data = await getCategoryByType(category)
      setCategories(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error(err)
    }
  }

  const fetchDisplayCategories = async () => {
    try {
      const [foodCats, drinkCats] = await Promise.all([
        getCategoryByType('food'),
        getCategoryByType('drink'),
      ])
      setFoodCategories(Array.isArray(foodCats) ? foodCats : [])
      setDrinkCategories(Array.isArray(drinkCats) ? drinkCats : [])
    } catch (err) {
      console.error(err)
    }
  }

  /* ── offer / orderdate fetching ── */
  async function loadRows() {
    setLoading(true)
    try {
      const data = await getOrderdates()
      setRows(data)
    } catch (err) {
      console.error(err)
      alert('Failed to load orderdate list')
    } finally {
      setLoading(false)
    }
  }

  // Only fetch admin data once actually logged in.
  useEffect(() => {
    if (LOGIN) {
      fetchAll()
      fetchDisplayCategories()
      loadRows()
    }
  }, [LOGIN])

  useEffect(() => {
    if (LOGIN) {
      fetchCategories()
      setCategory2('')
    }
  }, [category, LOGIN])

  /* ── handlers (food / drink items) ── */
  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleCreateCategory = async (e) => {
    e.preventDefault()
    const name = newCategoryName.trim()
    if (!name) return
    try {
      const created = await addCategory(name, category)
      setNewCategoryName('')
      await fetchCategories()
      await fetchDisplayCategories()
      setCategory2(created.id ?? created.category)
    } catch (err) {
      console.error(err)
      alert(err.message || 'Could not add category')
    }
  }

  const handleDeleteCategory = async () => {
    if (!category2) { alert('Select a category first'); return }
    if (!confirmAction('Delete this category? Items using it will need reassigning.')) return
    try {
      await deleteCategory(category2)
      setCategory2('')
      await fetchCategories()
      await fetchDisplayCategories()
    } catch (err) {
      alert(err.message || 'Could not delete category')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!category2) { alert('Please select a category'); return }
    const payload = { ...form, category_id: category2 }
    setSaving(true)
    try {
      if (category === 'food') {
        editingId ? await updateFood(editingId, payload) : await addFood(payload)
      } else {
        editingId ? await updateDrink(editingId, payload) : await addDrink(payload)
      }
      resetForm()
      setFormOpen(false)
      fetchAll()
    } catch (err) {
      alert(err.message || 'Could not save item')
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (item, cat) => {
    setCategory(cat)
    setForm({ item_name: item.item_name, price: item.price, image: item.image })
    setCategory2(item.category_id ?? '')
    setEditingId(item.id)
    setFormOpen(true)
  }

  const handleDelete = async (id, cat) => {
    if (!confirmAction('Delete this item?')) return
    try {
      cat === 'food' ? await deleteFood(id) : await deleteDrink(id)
      fetchAll()
    } catch (err) {
      alert(err.message || 'Could not delete item')
    }
  }

  const resetForm = () => {
    setForm({ item_name: '', price: '', image: '' })
    setCategory2('')
    setEditingId(null)
  }

  /* ── handlers (offer / orderdate items) ── */
  function handleOfferChange(e) {
    const { id, value } = e.target
    setOfferForm((prev) => ({ ...prev, [id]: value }))
  }

  function handleOfferEdit(row) {
    setOfferForm({
      id: row.id,
      name: row.name,
      price: row.price,
      img: row.img || '',
      date_start: row.date_start,
      date_end: row.date_end,
    })
  }

  function resetOfferForm() {
    setOfferForm(emptyOfferForm)
  }

  async function handleOfferSubmit(e) {
    e.preventDefault()
    setSaving(true)
    const payload = {
      name: offerForm.name,
      price: Number(offerForm.price),
      img: offerForm.img,
      date_start: offerForm.date_start,
      date_end: offerForm.date_end,
    }

    try {
      if (offerForm.id) {
        await updateOrderdate(offerForm.id, payload)
      } else {
        await createOrderdate(payload)
      }
      resetOfferForm()
      await loadRows()
    } catch (err) {
      console.error(err)
      alert('Failed to save record')
    } finally {
      setSaving(false)
    }
  }

  async function handleOfferDelete(id) {
    if (!confirm('Delete this record?')) return
    try {
      await deleteOrderdate(id)
      await loadRows()
    } catch (err) {
      console.error(err)
      alert('Failed to delete record')
    }
  }

  /* ── render helpers ── */
  const renderAdminCard = (item, cat) => (
    <div key={item.id} className="admin-card">
      <img className="admin-card-img" src={item.image} alt={item.item_name} loading="lazy" />
      <div className="admin-card-body">
        <p className="admin-card-name">{item.item_name}</p>
        <span className="admin-card-price">{Number(item.price).toFixed(2)} $</span>
      </div>
      <div className="admin-card-actions">
        <button
          className="admin-btn-edit"
          onClick={() => handleEdit(item, cat)}
          aria-label={`Edit ${item.item_name}`}
        >
          ✏️ Edit
        </button>
        <button
          className="admin-btn-delete"
          onClick={() => handleDelete(item.id, cat)}
          aria-label={`Delete ${item.item_name}`}
        >
          🗑️
        </button>
      </div>
    </div>
  )

  const renderOfferCard = (offer) => (
    <div key={offer.id} className="admin-card">
      {offer.img ? (
        <img className="admin-card-img" src={offer.img} alt={offer.name} loading="lazy" />
      ) : (
        <div className="admin-card-img" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '48px', background: 'var(--bg-elev-2)' }}>🏷️</div>
      )}
      <div className="admin-card-body">
        <p className="admin-card-name">{offer.name}</p>
        <span className="admin-card-price">{Number(offer.price).toFixed(2)} $</span>
        <p style={{ margin: '4px 0 0', fontSize: '11px', color: 'var(--text-dim)' }}>⌛ {timeleft(offer.date_end)} days left</p>
      </div>
      <div className="admin-card-actions">
        <button
          className="admin-btn-edit"
          onClick={() => {
            handleOfferEdit(offer)
            setFormOpen(true)
          }}
          aria-label={`Edit ${offer.name}`}
        >
          ✏️ Edit
        </button>
        <button
          className="admin-btn-delete"
          onClick={() => handleOfferDelete(offer.id)}
          aria-label={`Delete ${offer.name}`}
        >
          🗑️
        </button>
      </div>
    </div>
  )

  const renderGrouped = (items, cat, catList) => {
    const uncategorized = items.filter(
      (item) => !catList.some((c) => c.id === item.category_id)
    )
    const hasItems = catList.some(
      (c) => items.some((i) => i.category_id === c.id)
    ) || uncategorized.length > 0

    if (!hasItems) {
      return (
        <div className="admin-empty">
          <span>No {cat} items yet</span>
          <button className="admin-fab-inline" onClick={() => { setCategory(cat); setFormOpen(true) }}>
            + Add first item
          </button>
        </div>
      )
    }

    return (
      <>
        {catList.map((c) => {
          const itemsInCat = items.filter((item) => item.category_id === c.id)
          if (itemsInCat.length === 0) return null
          return (
            <div key={c.id} className="admin-category-group">
              <h3 className="admin-category-title">{c.category}</h3>
              <div className="admin-grid">
                {itemsInCat.map((item) => renderAdminCard(item, cat))}
              </div>
            </div>
          )
        })}
        {uncategorized.length > 0 && (
          <div className="admin-category-group">
            <h3 className="admin-category-title">Uncategorized</h3>
            <div className="admin-grid">
              {uncategorized.map((item) => renderAdminCard(item, cat))}
            </div>
          </div>
        )}
      </>
    )
  }

  const currentItems = viewTab === 'food' ? food : drinks
  const currentCatList = viewTab === 'food' ? foodCategories : drinkCategories
  function timeleft(date_end) {
    const end = new Date(date_end)
    const now = new Date()
    const diff = end.getTime() - now.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    return days
  }

  /* ── not logged in: show the login form only ── */
  if (!LOGIN) {
    return (
      <div className="admin-login-page">
        <form className="admin-login-card" onSubmit={handlelogin} noValidate>
          <h1 className="admin-title">Admin Login</h1>
          <p className="admin-subtitle">Sign in to manage your menu</p>

          <div className="admin-form-row">
            <label className="form-label" htmlFor="admin-identifier">Username or email</label>
            <input
              id="admin-identifier"
              className="form-input"
              type="text"
              value={adminForm.username || adminForm.email}
              onChange={(e) => {
                const val = e.target.value
                const isEmail = val.includes('@')
                setAdminForm({ ...adminForm, email: isEmail ? val : '', username: isEmail ? '' : val })
              }}
            />
          </div>

          <div className="admin-form-row">
            <label className="form-label" htmlFor="admin-password">Password</label>
            <input
              id="admin-password"
              className="form-input"
              type="password"
              value={adminForm.password}
              onChange={(e) => setAdminForm({ ...adminForm, password: e.target.value })}
            />
          </div>

          {loginError && <p className="admin-login-error">{loginError}</p>}

          <button type="submit" className="admin-btn-save">Login</button>
        </form>
      </div>
    )
  }

  /* ── logged in: full admin panel ── */
  return (
    <div className="admin-page">

      {/* ── Header ── */}
      <div className="admin-header">
        <div>
          <h1 className="admin-title">Admin Panel</h1>
          <p className="admin-subtitle">Manage your menu items &amp; categories</p>
        </div>
        <div className="admin-header-actions">
          <button
            className="admin-fab"
            onClick={() => { resetForm(); resetOfferForm(); setFormOpen(true) }}
            aria-label="Add new item"
          >
            + Add Item
          </button>
          <button className="admin-btn-cancel" onClick={handleLogout}>
            Log out
          </button>
        </div>
      </div>

      {/* ── View tab: Food | Drinks | Offers ── */}
      <div className="tab-bar" role="tablist">
        <button
          role="tab"
          aria-selected={viewTab === 'food'}
          className={`tab-btn ${viewTab === 'food' ? 'tab-btn--active' : ''}`}
          onClick={() => setViewTab('food')}
        >
          🍔 Food ({food.length})
        </button>
        <button
          role="tab"
          aria-selected={viewTab === 'drink'}
          className={`tab-btn ${viewTab === 'drink' ? 'tab-btn--active' : ''}`}
          onClick={() => setViewTab('drink')}
        >
          🥤 Drinks ({drinks.length})
        </button>
        <button
          role="tab"
          aria-selected={viewTab === 'offers'}
          className={`tab-btn ${viewTab === 'offers' ? 'tab-btn--active' : ''}`}
          onClick={() => setViewTab('offers')}
        >
          🏷️ Offers ({rows.length})
        </button>
      </div>

      {/* ── Items list ── */}
      <div className="admin-body">
        {viewTab === 'offers' ? (
          rows.length === 0 ? (
            <div className="admin-empty">
              <span>No offers yet</span>
              <button className="admin-fab-inline" onClick={() => { resetOfferForm(); setFormOpen(true) }}>
                + Add first offer
              </button>
            </div>
          ) : (
            <div className="admin-category-group">
              <h3 className="admin-category-title">🏷️ Special Offers</h3>
              <div className="admin-grid">
                {rows.map(renderOfferCard)}
              </div>
            </div>
          )
        ) : (
          renderGrouped(currentItems, viewTab, currentCatList)
        )}
      </div>

      {/* ── FAB (mobile) ── */}
      <button
        className="admin-fab-mobile"
        onClick={() => { resetForm(); resetOfferForm(); setFormOpen(true) }}
        aria-label="Add new item"
      >
        +
      </button>

      {/* ── Add / Edit bottom sheet (conditional food/drink/offers) ── */}
      {formOpen && (
        <div
          className="sheet-overlay"
          onClick={() => {
            setFormOpen(false)
            resetForm()
            resetOfferForm()
          }}
          aria-modal="true"
          role="dialog"
          aria-label={viewTab === 'offers' ? (offerForm.id ? 'Edit Offer' : 'Add Offer') : (editingId ? 'Edit Item' : 'Add Item')}
        >
          <div className="bottom-sheet admin-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="sheet-handle" />
            <button
              className="sheet-close-btn"
              onClick={() => {
                setFormOpen(false)
                resetForm()
                resetOfferForm()
              }}
              aria-label="Close"
            >✕</button>

            <div className="admin-sheet-body">
              <h2 className="admin-sheet-title">
                {viewTab === 'offers'
                  ? (offerForm.id ? '✏️ Edit Offer' : '➕ Add New Offer')
                  : (editingId ? '✏️ Edit Item' : '➕ Add New Item')
                }
              </h2>

              {viewTab === 'offers' ? (
                /* ── Offer Form ── */
                <form
                  onSubmit={async (e) => {
                    await handleOfferSubmit(e)
                    setFormOpen(false)
                  }}
                  className="admin-form-sheet"
                  noValidate
                >
                  <div className="admin-form-row">
                    <label className="form-label" htmlFor="offer-name">Offer Name</label>
                    <input
                      type="text"
                      id="name"
                      className="form-input"
                      placeholder="e.g. Family Feast Deal"
                      value={offerForm.name}
                      onChange={handleOfferChange}
                      required
                    />
                  </div>

                  <div className="admin-form-row">
                    <label className="form-label" htmlFor="offer-price">Price ($)</label>
                    <input
                      type="number"
                      id="price"
                      className="form-input"
                      step="0.01"
                      placeholder="0.00"
                      value={offerForm.price}
                      onChange={handleOfferChange}
                      required
                    />
                  </div>

                  <div className="admin-form-row">
                    <label className="form-label" htmlFor="offer-image">Offer Photo</label>
                    <input
                      id="offer-image"
                      className="form-input form-input--file"
                      type="file"
                      name="img"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files[0]
                        if (!file) return
                        const reader = new FileReader()
                        reader.onload = () => setOfferForm({ ...offerForm, img: reader.result })
                        reader.readAsDataURL(file)
                      }}
                    />
                    {offerForm.img && (
                      <img
                        src={offerForm.img}
                        alt="preview"
                        className="admin-img-preview"
                      />
                    )}
                  </div>

                  <div className="admin-form-row">
                    <label className="form-label" htmlFor="date_start">Start Date</label>
                    <input
                      type="date"
                      id="date_start"
                      className="form-input"
                      value={offerForm.date_start ? offerForm.date_start.split('T')[0] : ''}
                      onChange={handleOfferChange}
                      required
                    />
                  </div>

                  <div className="admin-form-row">
                    <label className="form-label" htmlFor="date_end">End Date</label>
                    <input
                      type="date"
                      id="date_end"
                      className="form-input"
                      value={offerForm.date_end ? offerForm.date_end.split('T')[0] : ''}
                      onChange={handleOfferChange}
                      required
                    />
                  </div>

                  <div className="admin-form-actions">
                    <button
                      type="button"
                      className="admin-btn-cancel"
                      onClick={() => {
                        resetOfferForm()
                        setFormOpen(false)
                      }}
                    >
                      Cancel
                    </button>
                    <button type="submit" className="admin-btn-save" disabled={saving}>
                      {saving ? 'Saving…' : offerForm.id ? 'Update Offer' : 'Add Offer'}
                    </button>
                  </div>
                </form>
              ) : (
                /* ── Food / Drink Form ── */
                <form onSubmit={handleSubmit} className="admin-form-sheet" noValidate>

                  {/* ── Type selector ── */}
                  <div className="admin-form-row">
                    <label className="form-label">Type</label>
                    <div className="admin-type-toggle">
                      <button
                        type="button"
                        className={`type-toggle-btn ${category === 'food' ? 'type-toggle-btn--active' : ''}`}
                        onClick={() => setCategory('food')}
                      >🍔 Food</button>
                      <button
                        type="button"
                        className={`type-toggle-btn ${category === 'drink' ? 'type-toggle-btn--active' : ''}`}
                        onClick={() => setCategory('drink')}
                      >🥤 Drink</button>
                    </div>
                  </div>

                  {/* ── Category picker ── */}
                  <div className="admin-form-row">
                    <label className="form-label" htmlFor="cat-select">Category</label>
                    <div className="admin-cat-row">
                      <select
                        id="cat-select"
                        className="form-select"
                        value={category2}
                        onChange={(e) => setCategory2(e.target.value)}
                      >
                        <option value="">Select category…</option>
                        {categories.map((cat) => (
                          <option key={cat.id} value={cat.id}>{cat.category}</option>
                        ))}
                      </select>
                      <button
                        type="button"
                        className="admin-btn-icon admin-btn-del-cat"
                        onClick={handleDeleteCategory}
                        title="Delete selected category"
                        aria-label="Delete selected category"
                      >🗑️</button>
                    </div>
                  </div>

                  {/* ── New category ── */}
                  <div className="admin-form-row">
                    <label className="form-label" htmlFor="new-cat">New category name</label>
                    <div className="admin-cat-row">
                      <input
                        id="new-cat"
                        className="form-input"
                        type="text"
                        placeholder={`e.g. Grills, Juices…`}
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                      />
                      <button
                        type="button"
                        className="admin-btn-icon admin-btn-add-cat"
                        onClick={handleCreateCategory}
                        title="Add category"
                        aria-label="Add category"
                      >+</button>
                    </div>
                  </div>

                  {/* ── Item name ── */}
                  <div className="admin-form-row">
                    <label className="form-label" htmlFor="item-name">Item name</label>
                    <input
                      id="item-name"
                      className="form-input"
                      type="text"
                      name="item_name"
                      placeholder="e.g. Grilled Chicken"
                      value={form.item_name}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  {/* ── Price ── */}
                  <div className="admin-form-row">
                    <label className="form-label" htmlFor="item-price">Price ($)</label>
                    <input
                      id="item-price"
                      className="form-input"
                      type="number"
                      name="price"
                      inputMode="decimal"
                      placeholder="0.00"
                      value={form.price}
                      onChange={handleChange}
                      required
                      min="0"
                      step="0.01"
                    />
                  </div>

                  {/* ── Image ── */}
                  <div className="admin-form-row">
                    <label className="form-label" htmlFor="item-image">Photo</label>
                    <input
                      id="item-image"
                      className="form-input form-input--file"
                      type="file"
                      name="image"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files[0]
                        if (!file) return
                        const reader = new FileReader()
                        reader.onload = () => setForm({ ...form, image: reader.result })
                        reader.readAsDataURL(file)
                      }}
                    />
                    {form.image && (
                      <img
                        src={form.image}
                        alt="preview"
                        className="admin-img-preview"
                      />
                    )}
                  </div>

                  {/* ── Actions ── */}
                  <div className="admin-form-actions">
                    {editingId && (
                      <button
                        type="button"
                        className="admin-btn-cancel"
                        onClick={() => { resetForm(); setFormOpen(false) }}
                      >
                        Cancel
                      </button>
                    )}
                    <button
                      type="submit"
                      className="admin-btn-save"
                      disabled={saving}
                    >
                      {saving ? 'Saving…' : editingId ? 'Update Item' : 'Add Item'}
                    </button>
                  </div>

                </form>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  )
}

export default Admin