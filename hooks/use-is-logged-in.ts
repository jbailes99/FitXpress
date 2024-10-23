import { useSelector } from './use-selector'

export const useIsLoggedIn = () => useSelector((state) => !!state.user) as boolean
