import { useDispatch as useAppDispatch } from 'react-redux'
import type { AppDispatch } from '@/lib/store'

export const useDispatch = useAppDispatch.withTypes<AppDispatch>()
