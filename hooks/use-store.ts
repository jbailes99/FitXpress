import { useStore as useAppStore } from 'react-redux'
import type { AppStore } from '@/lib/store'

export const useStore = useAppStore.withTypes<AppStore>()
