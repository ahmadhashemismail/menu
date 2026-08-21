import { useState, useEffect } from 'react'
import { getFood, getDrinks } from './api'

function Menu() {
  const [food, setFood] = useState([])
  const [drinks, setDrinks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchMenu() {
      try {
        const [foodData, drinkData] = await Promise.all([getFood(), getDrinks()])
        setFood(foodData)
        setDrinks(drinkData)
      } catch (err) {
        console.error(err)
        setError('Could not load menu. Please try again later.')
      } finally {
        setLoading(false)
      }
    }

    fetchMenu()
  }, [])

  if (loading) return <p>Loading menu...</p>
  if (error) return <p>{error}</p>

  return (
    <div>
      <h1>Menu</h1>

      <section>
        <h2>Food</h2>
        <div className="menu-grid">
          {food.map((item) => (
            <div key={item.id} className="menu-item">
              <img src={item.image} alt={item.item_name} width="150" />
              <p>{item.item_name}</p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2>Drinks</h2>
        <div className="menu-grid">
          {drinks.map((item) => (
            <div key={item.id} className="menu-item">
              <img src={item.image} alt={item.item_name} width="150" />
              <p>{item.item_name}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

export default Menu