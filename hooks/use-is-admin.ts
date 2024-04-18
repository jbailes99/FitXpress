import { useUserDetails } from './use-user-details'

export const useIsAdmin = () => {
  const userDetails = useUserDetails()
  return userDetails ? userDetails.isAdmin : false
}
