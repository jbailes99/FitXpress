import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

export interface User {
  email: string
  nickname: string
  username: string
  isAdmin: boolean
}

export type UserState = User | null

const initialState: UserState = null

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<any>) => action.payload,
    clearUser: () => initialState,
  },
})

export const {
  reducer: userReducer,
  actions: { setUser, clearUser },
} = userSlice
