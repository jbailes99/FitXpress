import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

export interface AuthState {
  accessToken?: string
  refreshToken?: string
  idToken?: string
}

const getInitialState = () => {
  try {
    const storedTokens = localStorage.getItem('auth:tokens')

    if (storedTokens) {
      return JSON.parse(storedTokens)
    }
  } catch (err) {
    console.error('Error getting tokens:', err)
  }

  return {}
}

const initialState: AuthState = getInitialState()

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuth: (state, action: PayloadAction<AuthState>) => {
      // Store tokens in locat storage
      try {
        localStorage.setItem('auth:tokens', JSON.stringify(action.payload))
      } catch (err) {
        console.error('Error storing tokens:', err)
      }

      return action.payload
    },
  },
})

export const {
  reducer: authReducer,
  actions: { setAuth },
} = authSlice
