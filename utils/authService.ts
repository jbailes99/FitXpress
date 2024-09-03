import { store } from '@/lib/store'
import { setUser } from '@/slices/user-slice'
import { setAuth } from '@/slices/auth-slice'

import { CognitoIdentityServiceProvider } from './awsConfig'
const cognitoIdentityServiceProvider = new CognitoIdentityServiceProvider()

export async function signUp(username, password, email, nickname, sex, age, weight) {
  const params = {
    ClientId: '20n5vpkjqk7l4mmeilnuv5damm',
    Username: username,
    Password: password,
    UserAttributes: [
      {
        Name: 'email',
        Value: email,
      },

      {
        Name: 'nickname', // Correct attribute name
        Value: nickname,
      },
      {
        Name: 'custom:sex', // Correct attribute name
        Value: sex,
      },
      {
        Name: 'custom:age1', // Correct attribute name
        Value: age,
      },
      {
        Name: 'custom:weight1', // Correct attribute name
        Value: weight,
      },
    ],
  }

  try {
    const response = await cognitoIdentityServiceProvider.signUp(params).promise()
    console.log('Sign up response:', response)

    return response
  } catch (error) {
    console.error('Error signing up:', error)
    throw error
  }
}

export async function getUserDetails(accessToken) {
  try {
    // Use the accessToken to make a request to your backend or Cognito to fetch user details
    // Make sure to handle errors appropriately

    // Example: Fetch user details from your backend or Cognito
    const params = {
      AccessToken: accessToken,
    }

    const response = await cognitoIdentityServiceProvider.getUser(params).promise()

    // Modify the return statement based on the structure of your user details
    return {
      email: response?.UserAttributes?.find(attr => attr.Name === 'email')?.Value || '',
      nickname: response?.UserAttributes?.find(attr => attr.Name === 'nickname')?.Value || '',
      sex: response?.UserAttributes?.find(attr => attr.Name === 'custom:sex')?.Value || '',
      age: response?.UserAttributes?.find(attr => attr.Name === 'custom:age1')?.Value || '',
      weight: response?.UserAttributes?.find(attr => attr.Name === 'custom:weight1')?.Value || '',
      username: response?.Username || '',

      isAdmin: response?.UserAttributes?.find(attr => attr.Name === 'custom:isAdmin' && attr.Value === 'true')
        ? true
        : false,
    }
  } catch (error) {
    console.error('Error fetching user details:', error)
    throw error
  }
}

export async function updateUserDetails(accessToken: string, updatedUserData: { [key: string]: string }) {
  try {
    // Use the accessToken and updatedUserData to make a request to your backend or Cognito to update user details
    // Make sure to handle errors appropriately

    // Example: Update user details on your backend or Cognito
    const params = {
      AccessToken: accessToken,
      UserAttributes: Object.entries(updatedUserData).map(([Name, Value]) => ({ Name, Value })),
    }

    const response = await cognitoIdentityServiceProvider.updateUserAttributes(params).promise()

    // Modify the return statement based on the structure of your response
    return response
  } catch (error) {
    console.error('Error updating user details:', error)
    throw error
  }
}

const STORAGE_KEY = 'auth:tokens' // You can replace 'myAppTokens' with any string you like

export function storeTokens(tokens) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tokens))
}

export function getStoredTokens() {
  const storedTokens = localStorage.getItem(STORAGE_KEY)
  return storedTokens ? JSON.parse(storedTokens) : null
}

export async function signIn(username, password) {
  const params = {
    AuthFlow: 'USER_PASSWORD_AUTH',
    ClientId: '20n5vpkjqk7l4mmeilnuv5damm',
    AuthParameters: {
      USERNAME: username,
      PASSWORD: password,
    },
  }

  // try {
  const response = await cognitoIdentityServiceProvider.initiateAuth(params).promise()
  const result = response?.AuthenticationResult

  if (result) {
    store.dispatch(
      setAuth({ accessToken: result.AccessToken, refreshToken: result.RefreshToken, idToken: result.IdToken })
    )

    refreshUserDetails(result.AccessToken!)
  }

  return response
}

export async function refreshUserDetails(accessToken: string) {
  const userDetails = await getUserDetails(accessToken)
  store.dispatch(setUser(userDetails))
}

export function getCurrentTokens() {
  const storedTokens = localStorage.getItem(STORAGE_KEY)
  console.log('Stored Tokens:', storedTokens)
  return storedTokens ? JSON.parse(storedTokens) : null
}

export async function confirmSignUp(username, confirmationCode) {
  const params = {
    ClientId: '20n5vpkjqk7l4mmeilnuv5damm',
    Username: username,
    ConfirmationCode: confirmationCode,
  }
  try {
    const response = await cognitoIdentityServiceProvider.confirmSignUp(params).promise()
    console.log('Confirmation response:', response)
    return response
  } catch (error) {
    console.error('Error confirming sign-up:', error)
    throw error
  }
}
export async function signOut() {
  try {
    // Retrieve the stored tokens
    const storedTokens = getStoredTokens()

    if (!storedTokens || !storedTokens.accessToken) {
      console.error('Access token is missing for sign-out.')
      return
    }

    const params = {
      AccessToken: storedTokens.accessToken,
    }

    const response = await cognitoIdentityServiceProvider.globalSignOut(params).promise()
    console.log('Sign-out response:', response)

    // Clear stored tokens after sign-out
    localStorage.removeItem(STORAGE_KEY)

    return response
  } catch (error) {
    console.error('Sign-out error:', error)
    throw error
  }
}
