import { useSelector } from './use-selector'

export const useUserDetails: any = () => useSelector(state => state.user)
