import { configureStore } from '@reduxjs/toolkit'
import authReducer from './authSlice'
import votesReducer from './votesSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    votes: votesReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
