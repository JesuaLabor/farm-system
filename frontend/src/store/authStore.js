import { create } from 'zustand'
import api from '../services/api'

const useAuthStore = create((set) => ({
  user: null,
  token: localStorage.getItem('less_farmer_token') || null,
  isLoading: false,

  login: async (email, password) => {
    set({ isLoading: true })
    const res = await api.post('/auth/login', { email, password })
    const { token, user } = res.data
    localStorage.setItem('less_farmer_token', token)
    set({ token, user, isLoading: false })
    return user
  },

  logout: () => {
    localStorage.removeItem('less_farmer_token')
    set({ user: null, token: null })
  },

  fetchMe: async () => {
    try {
      const res = await api.get('/me')
      set({ user: res.data })
    } catch {
      localStorage.removeItem('less_farmer_token')
      set({ user: null, token: null })
    }
  },
}))

export default useAuthStore
