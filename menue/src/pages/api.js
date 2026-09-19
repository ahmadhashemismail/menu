// src/api.js
// Central place for every function that talks to the server.
// Pages (Menu.jsx, Admin.jsx, etc) import from here instead of calling fetch() directly.

const BASE_URL = '/api'

async function handleResponse(res) {
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.error || 'Request failed')
  }
  return res.json()
}

// ---------- FOOD ----------
export async function getFood() {
  const res = await fetch(`${BASE_URL}/food`)
  return handleResponse(res)
}

export async function updateFood(id, item) {
  const res = await fetch(`${BASE_URL}/food/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(item),
  })
  return handleResponse(res)
}
export async function addFood(item) {
  const res = await fetch(`${BASE_URL}/food`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(item),
  })
  return handleResponse(res)
}
export async function deleteFood(id) {
  const res = await fetch(`${BASE_URL}/food/${id}`, { method: 'DELETE' })
  return handleResponse(res)
}

// ---------- DRINK ----------
export async function getDrinks() {
  const res = await fetch(`${BASE_URL}/drink`)
  return handleResponse(res)
}

export async function addDrink(item) {
  const res = await fetch(`${BASE_URL}/drink`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(item),
  })
  return handleResponse(res)
}

export async function updateDrink(id, item) {
  const res = await fetch(`${BASE_URL}/drink/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(item),
  })
  return handleResponse(res)
}

export async function deleteDrink(id) {
  const res = await fetch(`${BASE_URL}/drink/${id}`, { method: 'DELETE' })
  return handleResponse(res)
}

// ---------- ADMIN ----------
export async function loginAdmin(username,email, password) {
  const res = await fetch(`${BASE_URL}/admin/login`)
  return handleResponse(res)
}

//---------category---------

// GET category by type
export async function getCategoryByType(type) {
  try {
    const result = await fetch(`${BASE_URL}/category/${type}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!result.ok) {
      const errorData = await result.json()
      throw new Error(errorData.error || 'Failed to fetch category')
    }

    return await result.json()
  } catch (err) {
    console.error('getCategoryByType error:', err)
    throw err
  }
}

// POST add a new category
export async function addCategory(category, type) {
  try {
    const result = await fetch(`${BASE_URL}/category`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ category, type }),
    })

    if (!result.ok) {
      const errorData = await result.json()
      throw new Error(errorData.error || 'Failed to add category')
    }

    return await result.json()
  } catch (err) {
    console.error('addCategory error:', err)
    throw err
  }
}

// PUT update a category by its type
export async function updateCategoryByType(type, category) {
  try {
    const result = await fetch(`${BASE_URL}/category/${type}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ category }),
    })

    if (!result.ok) {
      const errorData = await result.json()
      throw new Error(errorData.error || 'Failed to update category')
    }

    return await result.json()
  } catch (err) {
    console.error('updateCategoryByType error:', err)
    throw err
  }
}

// DELETE a category by its type (deletes ALL categories of that type)
export async function deleteCategoryByType(type) {
  try {
    const result = await fetch(`${BASE_URL}/category/${type}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!result.ok) {
      const errorData = await result.json()
      throw new Error(errorData.error || 'Failed to delete category')
    }

    return await result.json()
  } catch (err) {
    console.error('deleteCategoryByType error:', err)
    throw err
  }
}

// DELETE a single category by its id — NEW
export async function deleteCategory(id) {
  try {
    const result = await fetch(`${BASE_URL}/category/id/${id}`, {
      method: 'DELETE',
    })

    if (!result.ok) {
      const errorData = await result.json()
      throw new Error(errorData.error || 'Failed to delete category')
    }

    return await result.json()
  } catch (err) {
    console.error('deleteCategory error:', err)
    throw err
  }
}
export async function getaddress() {
  const res = await fetch(`${BASE_URL}/address`)
  return handleResponse(res)
}
export async function address(item) {
  const res = await fetch(`${BASE_URL}/address`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(item),
  })
  return handleResponse(res)
}
export async function updateAddress(id, item) {
  const res = await fetch(`${BASE_URL}/address/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(item),
  })
  return handleResponse(res)
}
export async function deleteAddress(id) {
  const res = await fetch(`${BASE_URL}/address/${id}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(item),
  })
  return handleResponse(res)
}

// GET all rows
export async function getOrderdates() {
  const res = await fetch(`${BASE_URL}/orderdate`);
  if (!res.ok) throw new Error('Failed to fetch orderdates');
  return res.json();
}
 
// GET single row by id
export async function getOrderdate(id) {
  const res = await fetch(`${BASE_URL}/orderdate/${id}`);
  if (!res.ok) throw new Error('Failed to fetch orderdate');
  return res.json();
}
 
// POST create a new row
export async function createOrderdate(data) {
  // data = { name, price, img, date_start, date_end }
  const res = await fetch(`${BASE_URL}/orderdate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to create orderdate');
  return res.json();
}
 
// PUT update an existing row
export async function updateOrderdate(id, data) {
  // data = { name, price, img, date_start, date_end }
  const res = await fetch(`${BASE_URL}/orderdate/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to update orderdate');
  return res.json();
}
 
// DELETE a row
export async function deleteOrderdate(id) {
  const res = await fetch(`${BASE_URL}/orderdate/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete orderdate');
  return res.json();
}