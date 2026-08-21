import express from 'express'
import cors from 'cors'
import pool from './db.js'

const app = express()
const PORT = 3000

app.use(cors())
app.use(express.json({ limit: '10mb' }))

// ---------- FOOD ----------
app.get('/api/food', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM food ORDER BY id')
    res.json(result.rows)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Something went wrong' })
  }
})

app.post('/api/food', async (req, res) => {
  const { item_name, image } = req.body
  try {
    const result = await pool.query(
      'INSERT INTO food (item_name, image) VALUES ($1, $2) RETURNING *',
      [item_name, image]
    )
    res.status(201).json(result.rows[0])
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Something went wrong' })
  }
})

app.put('/api/food/:id', async (req, res) => {
  const { id } = req.params
  const { item_name, image } = req.body
  try {
    const result = await pool.query(
      'UPDATE food SET item_name = $1, image = $2 WHERE id = $3 RETURNING *',
      [item_name, image, id]
    )
    if (result.rows.length === 0) return res.status(404).json({ error: 'Item not found' })
    res.json(result.rows[0])
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Something went wrong' })
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
    res.status(500).json({ error: 'Something went wrong' })
  }
})

// ---------- DRINK ----------
app.get('/api/drink', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM drink ORDER BY id')
    res.json(result.rows)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Something went wrong' })
  }
})

app.post('/api/drink', async (req, res) => {
  const { item_name, image } = req.body
  try {
    const result = await pool.query(
      'INSERT INTO drink (item_name, image) VALUES ($1, $2) RETURNING *',
      [item_name, image]
    )
    res.status(201).json(result.rows[0])
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Something went wrong' })
  }
})

app.put('/api/drink/:id', async (req, res) => {
  const { id } = req.params
  const { item_name, image } = req.body
  try {
    const result = await pool.query(
      'UPDATE drink SET item_name = $1, image = $2 WHERE id = $3 RETURNING *',
      [item_name, image, id]
    )
    if (result.rows.length === 0) return res.status(404).json({ error: 'Item not found' })
    res.json(result.rows[0])
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Something went wrong' })
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
    res.status(500).json({ error: 'Something went wrong' })
  }
})

app.listen(PORT, () => console.log(`Server running on port ${PORT}`))