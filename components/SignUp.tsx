// SignUp.tsx

import React, { Fragment, useState } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { CheckIcon } from '@heroicons/react/24/outline'
import { signUp } from '@/utils/authService'
import SuccessModal from '@/components/SuccessfulSignUp' // Import the SuccessModal component
import SuccessfulSignUpModal from '@/components/SuccessfulSignUp'
import SignInModal from '@/components/SignInModal'
import SignIn from '@/components/SignInModal'
import { Panel } from '@/components/panel'
import { String } from 'aws-sdk/clients/cloudsearchdomain'

interface SignUpProps {
  onClose: () => void
}

const apiEndpoint = 'https://lz9iflahdk.execute-api.us-east-1.amazonaws.com/default/authService'

const SignUp: React.FC<SignUpProps> = ({ onClose }) => {
  const [credentials, setCredentials] = useState<{
    sex: string
    nickname: string
    username: string
    password: string
    email: string
    weight: string
    age: string
  }>({ nickname: '', username: '', password: '', email: '', sex: '', weight: '', age: '' })
  const [open, setOpen] = useState(true)
  const [signUpSuccess, setSignUpSuccess] = useState(false)
  const [isSignInModal, setIsSignInModal] = useState(false)
  const [error, setError] = useState<string | null>(null) // Explicitly type error state

  const handleSubmit = async () => {
    try {
      // Call signUp function from authService
      await signUp(
        credentials.username,
        credentials.password,
        credentials.email,
        credentials.nickname,
        credentials.sex,
        credentials.age,
        credentials.weight
      )
      console.log('Sign-up successful')
      onClose()
    } catch (error) {
      console.error('Sign-up error:', error)

      // Check if the error is a Cognito user already exists error
      if (error.code === 'UsernameExistsException') {
        // Show a specific error message for duplicate username
        setError('Username already exists. Please choose a different one.')
      } else {
        // Show a generic error message for other errors
        setError('Sign-up failed. Please try again.')
      }
    }
  }

  const handleSignUpClose = () => {
    onClose()
    setOpen(false)
  }

  const handleSignInClose = () => {
    onClose()
    setIsSignInModal(false)
  }

  const handleSignInOpen = () => {
    setIsSignInModal(true)
    handleSignUpClose()
  }

  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog as='div' className='relative z-10' onClose={handleSignUpClose}>
        <Transition.Child
          as={Fragment}
          enter='ease-out duration-300'
          enterFrom='opacity-0'
          enterTo='opacity-100'
          leave='ease-in duration-200'
          leaveFrom='opacity-100'
          leaveTo='opacity-0'
        >
          <div className='fixed inset-0 bg-gray-600 bg-opacity-85 transition-opacity' />
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
                  <div className='mt-3 text-center sm:mt-5'>
                    <Dialog.Title as='h3' className='text-xl font-semibold leading-6 text-gray-300'>
                      Sign Up
                    </Dialog.Title>
                    {/* {signUpSuccess ? (
                      <SuccessModal onGoToSignIn={handleGoToSignIn} />
                    ) : ( */}
                    <div className='mt-2'>
                      {/* <div className='mb-4'>
                        <label htmlFor='gender' className='block text-sm font-medium text-gray-300'>
                          Gender
                        </label>6
                        <input
                          type='text'
                          id='nickname'
                          name='nickname'
                          onChange={e => setCredentials({ ...credentials, gender: e.target.value })}
                          value={credentials.gender}
                          className='bg-gray-500 mt-1 p-2 border border-gray-600 rounded-md w-full'
                        />
                      </div> */}
                      <div className='mb-4'>
                        <label htmlFor='nickname' className='block text-sm font-medium text-gray-300'>
                          Nickname
                        </label>
                        <input
                          type='text'
                          id='nickname'
                          name='nickname'
                          onChange={e => setCredentials({ ...credentials, nickname: e.target.value })}
                          value={credentials.nickname}
                          className='bg-gray-500 mt-1 p-2 border border-gray-600 rounded-md w-full'
                        />
                      </div>
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
                        <p className='text-left text-sm text-red-200'>
                          <p className='text-center mt-2 text-sm text-red-300 font-bold '>Password requirements</p>
                          Contains at least 1 number <br />
                          Contains at least 1 special character <br />
                          Contains at least 1 uppercase letter
                          <br />
                          Contains at least 1 lowercase letter
                        </p>
                      </div>
                      <div className='mb-4'>
                        <label htmlFor='email' className='block text-sm font-medium text-gray-300'>
                          Email
                        </label>
                        <input
                          type='text'
                          id='email'
                          name='email'
                          onChange={e => setCredentials({ ...credentials, email: e.target.value })}
                          value={credentials.email}
                          className='bg-gray-500 mt-1 p-2 border border-gray-600 rounded-md w-full'
                        />
                      </div>
                      <div className='mb-4'>
                        <label htmlFor='sex' className='block text-sm font-medium text-gray-300'>
                          Sex
                        </label>
                        <select
                          id='sex'
                          name='sex'
                          onChange={e => setCredentials({ ...credentials, sex: e.target.value })}
                          value={credentials.sex}
                          className='bg-gray-500 mt-1 p-2 border border-gray-600 rounded-md w-full'
                        >
                          <option value='' disabled>
                            Select your sex
                          </option>
                          <option value='male'>Male</option>
                          <option value='female'>Female</option>
                        </select>
                      </div>

                      <div className='mb-4'>
                        <label htmlFor='age' className='block text-sm font-medium text-gray-300'>
                          Age
                        </label>
                        <select
                          id='age'
                          name='age'
                          onChange={e => setCredentials({ ...credentials, age: e.target.value })}
                          value={credentials.age}
                          className='bg-gray-500 mt-1 p-2 border border-gray-600 rounded-md w-full'
                        >
                          <option value='' disabled>
                            Select your age
                          </option>
                          {Array.from({ length: 100 - 16 + 1 }, (_, index) => 16 + index).map(age => (
                            <option key={age} value={age}>
                              {age}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className='mb-4'>
                        <label htmlFor='weight' className='block text-sm font-medium text-gray-300'>
                          Weight
                        </label>
                        <input
                          type='text'
                          id='weight'
                          name='weight'
                          onChange={e => setCredentials({ ...credentials, weight: e.target.value })}
                          value={credentials.weight}
                          className='bg-gray-500 mt-1 p-2 border border-gray-600 rounded-md w-full'
                        />
                      </div>
                    </div>
                    {/* )} */}
                  </div>
                </div>
                <div className='mt-5 sm:mt-6'>
                  <button
                    type='button'
                    className='inline-flex w-full justify-center rounded-md bg-medium-purple-300 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600'
                    onClick={handleSubmit}
                  >
                    Sign Up
                  </button>

                  {error && <div className='text-red-500 text-center mt-2 font-bold text-sm'>{error}</div>}
                </div>

                <div className='mt-2'>
                  <p className='text-sm text-gray-300'>
                    Already have an account?{' '}
                    <span className='text-medium-purple-300 cursor-pointer' onClick={handleSignInOpen}>
                      Sign in
                    </span>
                  </p>
                </div>
                {isSignInModal && (
                  <SignIn
                    onClose={() => setIsSignInModal(false)}
                    onSignUpClick={function (): void {
                      throw new Error('Function not implemented.')
                    }}
                  />
                )}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
        <SuccessfulSignUpModal open={signUpSuccess} onClose={() => setSignUpSuccess(false)} />
      </Dialog>
    </Transition.Root>
  )
}

export default SignUp
