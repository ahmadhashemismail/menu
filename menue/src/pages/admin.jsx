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
} from './api'

function Admin() {
  const [food, setFood] = useState([])
  const [drinks, setDrinks] = useState([])
  const [category, setCategory] = useState('food') // 'food' or 'drink'
  const [form, setForm] = useState({ item_name: '', image: '' })
  const [editingId, setEditingId] = useState(null)

  const fetchAll = async () => {
    try {
      const [foodData, drinkData] = await Promise.all([getFood(), getDrinks()])
      setFood(foodData)
      setDrinks(drinkData)
    } catch (err) {
      console.error(err)
      alert('Could not load menu items')
    }
  }

  useEffect(() => {
    fetchAll()
  }, [])

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      if (category === 'food') {
        editingId ? await updateFood(editingId, form) : await addFood(form)
      } else {
        editingId ? await updateDrink(editingId, form) : await addDrink(form)
      }

      setForm({ item_name: '', image: '' })
      setEditingId(null)
      fetchAll()
    } catch (err) {
      console.error(err)
      alert(err.message || 'Something went wrong saving the item')
    }
  }

  const handleEdit = (item, cat) => {
    setCategory(cat)
    setForm({ item_name: item.item_name, image: item.image })
    setEditingId(item.id)
  }

  const handleDelete = async (id, cat) => {
    if (!confirm('Delete this item?')) return
    try {
      cat === 'food' ? await deleteFood(id) : await deleteDrink(id)
      fetchAll()
    } catch (err) {
      console.error(err)
      alert(err.message || 'Something went wrong deleting the item')
    }
  }

  const renderList = (items, cat) => (
    <div className="admin-grid">
      {items.map((item) => (
        <div key={item.id} className="admin-item">
          <img src={item.image} alt={item.item_name} width="100" />
          <p>{item.item_name}</p>
          <button onClick={() => handleEdit(item, cat)}>Edit</button>
          <button onClick={() => handleDelete(item.id, cat)}>Delete</button>
        </div>
      ))}
    </div>
  )

  return (
    <div>
      <h1>Admin — Manage Menu</h1>

      <form onSubmit={handleSubmit}>
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="food">Food</option>
          <option value="drink">Drink</option>
        </select>

        <input
          type="text"
          name="item_name"
          placeholder="Item name"
          value={form.item_name}
          onChange={handleChange}
          required
        />

        <input
  type="file"
  name="image"
  accept="image/*"
  onChange={(e) => {
    const file = e.target.files[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = () => {
      setForm({ ...form, image: reader.result })
    }
    reader.readAsDataURL(file)
  }}
/>

{form.image && (
  <img src={form.image} alt="preview" width="80" style={{ marginTop: '8px' }} />
)}

        <button type="submit">{editingId ? 'Update' : 'Add'} Item</button>
        {editingId && (
          <button
            type="button"
            onClick={() => {
              setEditingId(null)
              setForm({ item_name: '', image: '' })
            }}
          >
            Cancel
          </button>
        )}
      </form>

      <h2 className='items'>Food Items</h2>
      {renderList(food, 'food')}

      <h2 className='items'>Drink Items</h2>
      {renderList(drinks, 'drink')}
    </div>
  )
}

export default Admin