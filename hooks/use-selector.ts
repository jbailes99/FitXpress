import { useSelector as useAppSelector } from 'react-redux'
import type { RootState } from '@/lib/store'

export const useSelector = useAppSelector<RootState>
