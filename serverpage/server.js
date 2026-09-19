import express from 'express'
import cors from 'cors'
import pool from './db.js'

const app = express()
const PORT = 3000

app.use(cors())
app.use(express.json({ limit: '25mb' }))

// Helper: converts empty string or null/undefined to null, otherwise parses Number


const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Verify error handling on the server listener
server.on('error', (err) => {
  console.error('Server error:', err);
});
// In development, real database error is added to the message.
const isDev = process.env.NODE_ENV !== 'production'
const fail = (res, err, status = 500, msg = 'Something went wrong') =>
  res.status(status).json({ error: isDev && err && err.message ? `${msg}: ${err.message}` : msg })

// ---------- FOOD ----------
app.get('/api/food', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM food ORDER BY id')
    res.json(result.rows)
  } catch (err) {
    console.error(err)
    fail(res, err, 500, 'Something went wrong')
  }
})

app.post('/api/food', async (req, res) => {
  const { item_name, price, medium_price, large_price, image, category_id } = req.body
  try {
    const result = await pool.query(
      'INSERT INTO food (item_name, price, medium_price, large_price, image, category_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [item_name, price, medium_price, large_price, image, category_id]
    )
    res.status(201).json(result.rows[0])
  } catch (err) {
    console.error(err)
    fail(res, err, 500, 'Something went wrong')
  }
})

app.put('/api/food/:id', async (req, res) => {
  const { id } = req.params
  const { item_name, price, medium_price, large_price, image, category_id } = req.body


  try {
    const result = await pool.query(
      'UPDATE food SET item_name = $1, price = $2, medium_price = $3, large_price = $4, image = $5, category_id = $6 WHERE id = $7 RETURNING *',
      [item_name, price, medium_price, large_price, image, category_id , id]
    )
    if (result.rows.length === 0) return res.status(404).json({ error: 'Item not found' })
    res.json(result.rows[0])
  } catch (err) {
    console.error(err)
    fail(res, err, 500, 'Something went wrong')
  }
})

app.delete('/api/food/:id', async (req, res) => {
  const { id } = req.params
  try {
    const result = await pool.query('DELETE FROM food WHERE id = $1 RETURNING *', [id])
    if (result.rows.length === 0) return res.status(404).json({ error: 'Item not found' })
    res.json({ message: 'Deleted successfully' })
  } catch (err) {
    console.error(err)
    fail(res, err, 500, 'Something went wrong')
  }
})

// ---------- DRINK ----------
app.get('/api/drink', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM drink ORDER BY id')
    res.json(result.rows)
  } catch (err) {
    console.error(err)
    fail(res, err, 500, 'Something went wrong')
  }
})

app.post('/api/drink', async (req, res) => {
  const { item_name, price, medium_price, large_price, image, category_id } = req.body

  try {
    const result = await pool.query(
      'INSERT INTO drink (item_name, price, medium_price, large_price, image, category_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [item_name, price, medium_price, large_price, image, category_id ]
    )
    res.status(201).json(result.rows[0])
  } catch (err) {
    console.error(err)
    fail(res, err, 500, 'Something went wrong')
  }
})

app.put('/api/drink/:id', async (req, res) => {
  const { id } = req.params
  const { item_name, price, medium_price, large_price, image, category_id } = req.body

  try {
    const result = await pool.query(
      'UPDATE drink SET item_name = $1, price = $2, medium_price = $3, large_price = $4, image = $5, category_id = $6 WHERE id = $7 RETURNING *',
      [item_name, price, medium_price, large_price, image, category_id, id]
    )
    if (result.rows.length === 0) return res.status(404).json({ error: 'Item not found' })
    res.json(result.rows[0])
  } catch (err) {
    console.error(err)
    fail(res, err, 500, 'Something went wrong')
  }
})

app.delete('/api/drink/:id', async (req, res) => {
  const { id } = req.params
  try {
    const result = await pool.query('DELETE FROM drink WHERE id = $1 RETURNING *', [id])
    if (result.rows.length === 0) return res.status(404).json({ error: 'Item not found' })
    res.json({ message: 'Deleted successfully' })
  } catch (err) {
    console.error(err)
    fail(res, err, 500, 'Something went wrong')
  }
})

// ---------- CATEGORY ----------
app.get('/api/category/:type', async (req, res) => {
  const { type } = req.params
  if (!['food', 'drink'].includes(type)) {
    return res.status(400).json({ error: 'Type must be either "food" or "drink"' })
  }
  try {
    const result = await pool.query('SELECT * FROM category WHERE type = $1 ORDER BY id', [type])
    res.json(result.rows)
  } catch (err) {
    console.error(err)
    fail(res, err, 500, 'Failed to fetch categories')
  }
})

app.post('/api/category', async (req, res) => {
  const { category, type } = req.body
  if (!category || !type) {
    return res.status(400).json({ error: 'category and type are required' })
  }
  if (!['food', 'drink'].includes(type)) {
    return res.status(400).json({ error: 'Type must be either "food" or "drink"' })
  }
  try {
    const result = await pool.query('INSERT INTO category (category, type) VALUES ($1, $2) RETURNING *', [category, type])
    res.status(201).json(result.rows[0])
  } catch (err) {
    console.error(err)
    fail(res, err, 500, 'Failed to add category')
  }
})

app.put('/api/category/:type', async (req, res) => {
  const { type } = req.params
  const { category } = req.body
  if (!['food', 'drink'].includes(type)) {
    return res.status(400).json({ error: 'Type must be either "food" or "drink"' })
  }
  if (!category) {
    return res.status(400).json({ error: 'category is required' })
  }
  try {
    const result = await pool.query('UPDATE category SET category = $1 WHERE type = $2 RETURNING *', [category, type])
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'No categories found with that type' })
    }
    res.json({ message: 'Category updated', type, category })
  } catch (err) {
    console.error(err)
    fail(res, err, 500, 'Failed to update category')
  }
})

app.delete('/api/category/:type', async (req, res) => {
  const { type } = req.params
  if (!['food', 'drink'].includes(type)) {
    return res.status(400).json({ error: 'Type must be either "food" or "drink"' })
  }
  try {
    const result = await pool.query('DELETE FROM category WHERE type = $1 RETURNING *', [type])
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'No categories found with that type' })
    }
    res.json({
      message: `Deleted ${result.rows.length} categor${result.rows.length === 1 ? 'y' : 'ies'} of type "${type}"`,
    })
  } catch (err) {
    console.error(err)
    fail(res, err, 500, 'Failed to delete category')
  }
})

app.delete('/api/category/id/:id', async (req, res) => {
  const { id } = req.params
  try {
    const result = await pool.query('DELETE FROM category WHERE id = $1 RETURNING *', [id])
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Category not found' })
    }
    res.json({ message: 'Category deleted', category: result.rows[0] })
  } catch (err) {
    console.error(err)
    if (err.code === '23503') {
      return res.status(409).json({ error: 'Cannot delete: some items still use this category' })
    }
    fail(res, err, 500, 'Failed to delete category')
  }
})

// ---------- ADDRESS ----------
app.get('/api/address', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM address ORDER BY id')
    res.json(result.rows)
  } catch (err) {
    console.error(err)
    fail(res, err, 500, 'Something went wrong')
  }
})

app.post('/api/address', async (req, res) => {
  const { note, address, home, street } = req.body
  try {
    const result = await pool.query(
      'INSERT INTO address (note, address, home, street) VALUES ($1, $2, $3, $4) RETURNING *',
      [note, address, home, street]
    )
    res.status(201).json(result.rows[0])
  } catch (err) {
    console.error(err)
    fail(res, err, 500, 'Something went wrong')
  }
})

app.put('/api/address/:id', async (req, res) => {
  const { id } = req.params
  const { note, address, home, street } = req.body
  try {
    const result = await pool.query(
      'UPDATE address SET note = $1, address = $2, home = $3, street = $4 WHERE id = $5 RETURNING *',
      [note, address, home, street, id]
    )
    if (result.rows.length === 0) return res.status(404).json({ error: 'Item not found' })
    res.json(result.rows[0])
  } catch (err) {
    console.error(err)
    fail(res, err, 500, 'Something went wrong')
  }
})

app.delete('/api/address/:id', async (req, res) => {
  const { id } = req.params
  try {
    const result = await pool.query('DELETE FROM address WHERE id = $1 RETURNING *', [id])
    if (result.rows.length === 0) return res.status(404).json({ error: 'Item not found' })
    res.json({ message: 'Deleted successfully' })
  } catch (err) {
    console.error(err)
    fail(res, err, 500, 'Something went wrong')
  }
})

// ---------- ORDERDATE ----------
app.get('/api/orderdate', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM orderdate ORDER BY id')
    res.json(result.rows)
  } catch (err) {
    console.error(err)
    fail(res, err, 500, 'Server error')
  }
})

app.get('/api/orderdate/:id', async (req, res) => {
  try {
    const { id } = req.params
    const result = await pool.query('SELECT * FROM orderdate WHERE id = $1', [id])
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' })
    res.json(result.rows[0])
  } catch (err) {
    console.error(err)
    fail(res, err, 500, 'Server error')
  }
})

app.post('/api/orderdate', async (req, res) => {
  try {
    const { name, price, img, date_start, date_end } = req.body
    if (!name || !price || !date_start || !date_end) {
      return res.status(400).json({ error: 'name, price, date_start and date_end are required' })
    }
    const result = await pool.query(
      `INSERT INTO orderdate (name, price, img, date_start, date_end) VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [name, price, img, date_start, date_end]
    )
    res.status(201).json(result.rows[0])
  } catch (err) {
    console.error(err)
    fail(res, err, 500, 'Server error')
  }
})

app.put('/api/orderdate/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { name, price, img, date_start, date_end } = req.body
    const result = await pool.query(
      `UPDATE orderdate SET name = $1, price = $2, img = $3, date_start = $4, date_end = $5 WHERE id = $6 RETURNING *`,
      [name, price, img, date_start, date_end, id]
    )
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' })
    res.json(result.rows[0])
  } catch (err) {
    console.error(err)
    fail(res, err, 500, 'Server error')
  }
})

app.delete('/api/orderdate/:id', async (req, res) => {
  try {
    const { id } = req.params
    const result = await pool.query('DELETE FROM orderdate WHERE id = $1 RETURNING *', [id])
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' })
    res.json({ message: 'Deleted', deleted: result.rows[0] })
  } catch (err) {
    console.error(err)
    fail(res, err, 500, 'Server error')
  }
})

app.use('/api', (req, res) => res.status(404).json({ error: 'Not found' }))

app.use((err, req, res, next) => {
  if (err.type === 'entity.too.large') {
    return res.status(413).json({ error: 'Image is too large. Use a smaller image.' })
  }
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Invalid JSON' })
  }
  console.error(err)
  res.status(err.status || 500).json({ error: 'Something went wrong' })
})

app.listen(PORT, () => console.log(`Server running on port ${PORT}`))