import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

export interface AuthState {
  accessToken?: string
  refreshToken?: string
  idToken?: string
}

const getInitialState = () => {
  if (typeof window === 'undefined') {
    return {}
  }

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
    logout: () => {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth:tokens')
      }
      return {}
    },
    setAuth: (state, action: PayloadAction<AuthState>) => {
      // Store tokens in local storage

      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('auth:tokens', JSON.stringify(action.payload))
        } catch (err) {
          console.error('Error storing tokens:', err)
        }
      }

      return action.payload
    },
  },
})

export const {
  reducer: authReducer,
  actions: { setAuth, logout },
} = authSlice
