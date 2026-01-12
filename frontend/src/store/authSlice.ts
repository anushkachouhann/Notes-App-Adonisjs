import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import api from '../services/api'

interface User {
  id: number
  name: string
  email: string
  role: string
  avatarUrl?: string
  birthdate?: string
}

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  loading: boolean
  error: string | null
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  loading: false,
  error: null,
}

export const login = createAsyncThunk(
  'auth/login',
  async (credentials: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const response = await api.post('/auth/login', credentials)
      return response.data.data.user
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Login failed')
    }
  }
)

export const register = createAsyncThunk(
  'auth/register',
  async (data: { name: string; email: string; password: string }, { rejectWithValue }) => {
    try {
      const response = await api.post('/auth/register', data)
      return response.data.data.user
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Registration failed')
    }
  }
)

export const fetchCurrentUser = createAsyncThunk(
  'auth/fetchCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/auth/me')
      return response.data.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Not authenticated')
    }
  }
)

export const logout = createAsyncThunk('auth/logout', async () => {
  await api.post('/auth/logout')
  return null
})

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload
      state.isAuthenticated = true
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => { state.loading = true; state.error = null })
      .addCase(login.fulfilled, (state, action) => { state.loading = false; state.user = action.payload; state.isAuthenticated = true })
      .addCase(login.rejected, (state, action) => { state.loading = false; state.error = action.payload as string })
      .addCase(register.pending, (state) => { state.loading = true; state.error = null })
      .addCase(register.fulfilled, (state, action) => { state.loading = false; state.user = action.payload; state.isAuthenticated = true })
      .addCase(register.rejected, (state, action) => { state.loading = false; state.error = action.payload as string })
      .addCase(fetchCurrentUser.pending, (state) => { state.loading = true })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => { state.loading = false; state.user = action.payload; state.isAuthenticated = true })
      .addCase(fetchCurrentUser.rejected, (state) => { state.loading = false; state.isAuthenticated = false })
      .addCase(logout.pending, (state) => { state.loading = true })
      .addCase(logout.fulfilled, (state) => { state.loading = false; state.user = null; state.isAuthenticated = false })
      .addCase(logout.rejected, (state) => { state.loading = false; state.user = null; state.isAuthenticated = false })
  },
})

export const { clearError, setUser } = authSlice.actions
export default authSlice.reducer
