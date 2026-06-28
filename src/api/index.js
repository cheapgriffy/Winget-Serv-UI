import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
})

// Attach token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Auth
export const authApi = {
  login: (credentials) => api.post('/user/login', credentials),
  register: (data) => api.post('/user/create', data),
  getMe: () => api.get('/user/me'),
  getUser: (id) => api.get(`/user/${id}`),
  removeUser: (id) => api.delete('/user/remove', { data: { id } }),
}

// Scripts
export const scriptApi = {
  list: () => api.get('/script/list'),
  create: (data) => api.post('/script/create', data),
  remove: (id) => api.delete('/script/remove', { data: { id } }),
  get: (publicId) => api.get(`/script/${publicId}`),
}

export default api