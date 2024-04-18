'use client'

import { memo, useEffect } from 'react'
import { Provider } from 'react-redux'

import { store } from '@/lib/store'
import { refreshUserDetails } from '@/utils/authService'

export const StoreProvider = memo(function StoreProvider({
  children
}: {
  children: React.ReactNode
}) {
  useEffect(() => {
    const { accessToken } = store.getState().auth

    if (accessToken) {
      refreshUserDetails(accessToken)
    }
  }, [])
  return <Provider store={store}>{children}</Provider>
})