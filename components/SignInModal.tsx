// SignIn.tsx

import React, { useState } from 'react'
import {
  Button,
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Input,
} from '@material-tailwind/react'
import SignUp from './SignUp'
import { signIn, getUserDetails } from '@/utils/authService'

interface SignInProps {
  onClose: () => void
  // onSubmit: (credentials: { username: string; password: string }) => void
  onSignUpClick: () => void // Add this prop for handling sign-up click
}

const SignIn: React.FC<SignInProps> = ({ onClose }) => {
  const [credentials, setCredentials] = useState<{
    username: string
    password: string
    nickname: string
    email: string
  }>({ username: '', password: '', nickname: '', email: '' })
  const [open, setOpen] = useState(true)
  const [isSignUpOpen, setIsSignUpOpen] = useState(false)
  const [signInSuccess, setSignInSuccess] = useState(false) // State for successful sign-in
  const [error, setError] = useState<string | null>(null)

  const handleOpen = () => {
    setOpen(!open)
    if (open) {
      onClose()
    }
  }

  const handleSubmit = async () => {
    try {
      // Clear any previous errors
      setError(null)

      // Call signIn function from authService
      const accessToken = await signIn(credentials.username, credentials.password)

      //extracts accessToken from data above (fixes false login error issue)
      const accessToken1 = accessToken.AuthenticationResult?.AccessToken

      console.log(accessToken1)

      console.log('Sign-in successful')
      console.log('test', accessToken)

      const userDetails = await getUserDetails(accessToken1)
      console.log('test details', userDetails)
      onClose() // Close the sign-in modal
    } catch (error) {
      console.error('Sign-in error:', error)
      // Set error state to display the error message
      if ((error as any).code === 'UserNotConfirmedException') {
        // Show a specific error message for duplicate username
        setError('Please confirm your account before logging in.')
      } else {
        // Show a generic error message for other errors
        setError('Sign-up failed due to an incorrect username or password. Please try again.')
      }
    }
  }

  const handleSignUpClose = () => {
    setIsSignUpOpen(false)
  }

  const handleSignUpClick = (e: React.MouseEvent) => {
    setIsSignUpOpen(true)
    e.preventDefault()
    e.stopPropagation()
    setOpen(true)
  }

  const handleSignInClose = () => {
    onClose()
    setOpen(false)
  }

  return (
    <>
      <Dialog
        className="bg-secondary-500 outline outline-medium-purple-500/70  bg-opacity-90"
        open={open}
        handler={handleOpen}
        size="sm"
        dismiss={{
          outsidePress: () => {
            handleSignInClose()
            return true
          },
        }}
      >
        <DialogHeader className="text-white text-center flex justify-center items-center">
          Welcome back!
        </DialogHeader>
        <DialogBody>
          <div className="mt-3 flex flex-col justify-center items-center">
            <div className="mb-4 sm:w-1/2 ">
              <Input
                color="purple"
                type="text"
                label="Username"
                onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
                value={credentials.username}
                crossOrigin={undefined}
              />
            </div>
            <div className="mb-4 sm:w-1/2 ">
              <Input
                type="password"
                label="Password"
                onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                value={credentials.password}
                crossOrigin={undefined}
              />
            </div>
          </div>
          {error && <div className="text-red-500 text-center mt-2 font-bold text-sm">{error}</div>}
        </DialogBody>
        <DialogFooter className="flex justify-center items-center">
          <Button variant="text" color="red" onClick={handleSignInClose} className="mr-1">
            <span>Cancel</span>
          </Button>
          <Button variant="gradient" color="purple" onClick={handleSubmit}>
            <span>Sign In</span>
          </Button>
        </DialogFooter>
        <div className="mt-2 text-center pb-4">
          <p className="text-sm text-white">
            Don&apos;t have an account?{' '}
            <span className="text-medium-purple-500 cursor-pointer" onClick={handleSignUpClick}>
              Create one
            </span>
          </p>
          {isSignUpOpen && <SignUp onClose={handleSignUpClose} />}
        </div>
      </Dialog>
    </>
  )
}

export default SignIn
