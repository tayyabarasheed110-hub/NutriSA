import { create } from 'zustand'
import client from '../api/client.js'

export const useAuthStore = create((set, get) => ({
  user: null,
  token: localStorage.getItem('nutrisa_token') || null,
  isLoading: false,
  error: null,

  signIn: async (email, password) => {
    set({ isLoading: true, error: null })
    try {
      const res = await client.post('/auth/login', { email, password })
      const { access_token, user } = res.data
      localStorage.setItem('nutrisa_token', access_token)
      set({ token: access_token, user, isLoading: false, error: null })
      return { ok: true }
    } catch (err) {
      const msg = err.response?.data?.error || err.message
      set({ isLoading: false, error: msg })
      return { ok: false, error: msg }
    }
  },

  signUp: async (email, password) => {
    set({ isLoading: true, error: null })
    try {
      const res = await client.post('/auth/signup', { email, password })
      set({ isLoading: false, error: null })
      return { ok: true, id: res.data.id }
    } catch (err) {
      const msg = err.response?.data?.error || err.message
      set({ isLoading: false, error: msg })
      return { ok: false, error: msg }
    }
  },

  signOut: () => {
    localStorage.removeItem('nutrisa_token')
    set({ user: null, token: null, error: null })
    window.location.href = '/auth'
  },

  loadProfile: async () => {
    try {
      const res = await client.get('/user/profile')
      set({ user: res.data })
      return res.data
    } catch { return null }
  },

  updateProfile: async (data) => {
    try {
      const res = await client.put('/user/profile', data)
      set({ user: res.data })
      return res.data
    } catch (err) {
      const msg = err.response?.data?.error || err.message
      set({ error: msg })
      return null
    }
  },
}))
