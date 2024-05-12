// SignIn.tsx

import React, { Fragment, useState } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { CheckIcon } from '@heroicons/react/24/outline'
import SignUp from './SignUp'
import { signIn, getUserDetails, signUp } from '@/utils/authService'
import SuccessfulSignUp from './SuccessfulSignUp' // Import the modal for successful sign-up

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

  const handleSubmit = async () => {
    try {
      // Clear any previous errors
      setError(null)

      // Call signIn function from authService
      const accessToken = await signIn(credentials.username, credentials.password)

      console.log('Sign-in successful')
      console.log('test', accessToken)

      const userDetails = await getUserDetails(accessToken)
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

  const handleSignUp = async () => {
    try {
      // Cwwall signUp function from authService
      await signUp(credentials.username, credentials.email, credentials.nickname, credentials.password)
      console.log('Sign-up successful')
      setSignInSuccess(true) // Set the state to trigger the successful sign-up modal
      setIsSignUpOpen(false) // Close the sign-up modal after sign-up
    } catch (error) {
      console.error('Sign-up error:', error)
    }
  }

  const handleSignInClose = () => {
    onClose()
    setOpen(false)
  }

  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog as='div' className='relative z-10' onClose={handleSignInClose}>
        <Transition.Child
          as={Fragment}
          enter='ease-out duration-300'
          enterFrom='opacity-0'
          enterTo='opacity-100'
          leave='ease-in duration-200'
          leaveFrom='opacity-100'
          leaveTo='opacity-0'
        >
          <div className='fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity' />
        </Transition.Child>

        <div className='fixed inset-0 z-10 w-screen overflow-y-auto'>
          <div className='flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0'>
            <Transition.Child
              as={Fragment}
              enter='ease-out duration-300'
              enterFrom='opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95'
              enterTo='opacity-100 translate-y-0 sm:scale-100'
              leave='ease-in duration-200'
              leaveFrom='opacity-100 translate-y-0 sm:scale-100'
              leaveTo='opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95'
            >
              <Dialog.Panel className='relative transform overflow-hidden rounded-lg bg-secondary-500 px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-sm sm:p-6'>
                <div>
                  {/* <div className='mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100'>
                    <CheckIcon className='h-6 w-6 text-green-600' aria-hidden='true' />
                  </div> */}
                  <div className='mt-3 text-center sm:mt-2'>
                    <Dialog.Title as='h2' className='text-xl font-semibold leading-6 text-gray-300'>
                      Welcome
                    </Dialog.Title>
                    <div className='mt-3'>
                      <div className='mb-4'>
                        <label htmlFor='username' className='block text-sm font-medium text-gray-300'>
                          Username
                        </label>
                        <input
                          type='text'
                          id='username'
                          name='username'
                          onChange={e => setCredentials({ ...credentials, username: e.target.value })}
                          value={credentials.username}
                          className='bg-gray-500 mt-1 p-2 border border-gray-600 rounded-md w-full'
                        />
                      </div>
                      <div className='mb-4'>
                        <label htmlFor='password' className='block text-sm font-medium text-gray-300'>
                          Password
                        </label>
                        <input
                          type='password'
                          id='password'
                          name='password'
                          onChange={e => setCredentials({ ...credentials, password: e.target.value })}
                          value={credentials.password}
                          className='bg-gray-500 mt-1 p-2 border border-gray-600 rounded-md w-full'
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <div className='mt-5 sm:mt-6'>
                  {error && <div className='text-red-500 text-center mt-2 font-bold text-sm'>{error}</div>}
                  <button
                    type='button'
                    className='inline-flex w-full justify-center rounded-md bg-medium-purple-300 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600'
                    onClick={handleSubmit}
                  >
                    Sign In
                  </button>
                </div>
                <div className='mt-2 text-center '>
                  <p className='text-sm text-gray-300'>
                    Dont have an account?{' '}
                    <span className='text-medium-purple-300 cursor-pointer' onClick={handleSignUpClick}>
                      Create one
                    </span>
                  </p>
                  {isSignUpOpen && <SignUp onClose={handleSignUpClose} onSubmit={handleSignUp} />}
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  )
}

export default SignIn
