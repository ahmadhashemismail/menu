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

export async function addFood(item) {
  const res = await fetch(`${BASE_URL}/food`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(item),
  })
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
export async function loginAdmin(username, password) {
  const res = await fetch(`${BASE_URL}/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  })
  return handleResponse(res)
}