'use client'
import React, { useEffect, useState, ChangeEvent, FormEvent } from 'react'
import { motion } from 'framer-motion'
import { getUserDetails, getCurrentTokens, updateUserDetails } from '@/utils/authService'
import { PhotoIcon, UserCircleIcon } from '@heroicons/react/24/solid'

interface UserData {
  email?: string
  nickname?: string
  username?: string
  isAdmin?: boolean
  // Add other user properties as needed
}

const ProfilePage: React.FC = () => {
  const [userData, setUserData] = useState<UserData | null>(null)
  const [editMode, setEditMode] = useState(false)
  const [formValues, setFormValues] = useState({
    email: '',
    nickname: '',
    username: '',
    isAdmin: '',
  })
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Retrieve stored tokens
        const tokens = getCurrentTokens()
        console.log('Access Token:', tokens?.accessToken)

        if (tokens && tokens.accessToken) {
          // Fetch user data using the stored access token

          const user = await getUserDetails(tokens.accessToken)
          setUserData(user)

          // Set form values for editing
          setFormValues({
            email: user?.email || '',
            nickname: user?.nickname || '',
            username: user?.username || '',
            isAdmin: user?.isAdmin ? 'true' : 'false',
          })
        } else {
          console.error('Access token not found. User is not authenticated.')
        }
      } catch (error) {
        setError(error as Error)
        console.error('Error fetching user data:', error)
      }
    }

    fetchUserData()
  }, [])

  const handleEditClick = () => {
    setEditMode(true)
  }
  const handleSaveClick = async () => {
    try {
      // Ensure that formValues is defined and contains necessary properties
      if (formValues && formValues.email && formValues.nickname && formValues.username && accessToken) {
        await updateUserDetails(accessToken, {
          // Passing accessToken as the first argument
          email: formValues.email,
          nickname: formValues.nickname,
          username: formValues.username,
        })
        setEditMode(false)
        // You might want to refetch user data to ensure it's up to date
      } else {
        console.error('Some form values are missing or undefined.')
      }
    } catch (error) {
      console.error('Error updating user data:', error)
    }
  }

  const handleCancelClick = () => {
    // Reset form values to original user data
    setFormValues({
      email: userData?.email || '',
      nickname: userData?.nickname || '',
      username: userData?.username || '',
      isAdmin: userData?.isAdmin ? 'true' : 'false',
    })

    setEditMode(false)
  }

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    // Update form values as the user types
    setFormValues({
      ...formValues,
      [e.target.name]: e.target.value,
    })
  }

  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  }

  return (
    <motion.div
      initial='hidden'
      animate='visible'
      variants={fadeInUp}
      className='bg-gradient-to-b from-gray-700 to-gray-500 shadow min-h-screen flex items-center justify-center'
    >
      <div>
        <h1 className='text-2xl font-bold mb-6 text-center'>Your Profile</h1>

        <form className='max-w-full w-full p-6 bg-gray-500 rounded shadow-md text-center'>
          {userData ? (
            <>
              {editMode ? (
                <div>
                  <label className='block text-sm font-medium text-gray-700'>Email:</label>
                  <input
                    type='email'
                    name='email'
                    value={formValues.email}
                    onChange={handleChange}
                    className='mt-1 p-2 border rounded-md w-full'
                  />

                  <label className='block mt-4 text-sm font-medium text-gray-700'>Nickname:</label>
                  <input
                    type='text'
                    name='nickname'
                    value={formValues.nickname}
                    onChange={handleChange}
                    className='mt-1 p-2 border rounded-md w-full'
                  />

                  <label className='block mt-4 text-sm font-medium text-gray-700'>Username:</label>
                  <input
                    type='text'
                    name='username'
                    value={formValues.username}
                    onChange={handleChange}
                    className='mt-1 p-2 border rounded-md w-full'
                  />

                  <div className='mt-6 flex justify-end'>
                    <button
                      type='button'
                      onClick={handleSaveClick}
                      className='px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-500 focus:outline-none focus:ring focus:border-indigo-300'
                    >
                      Save
                    </button>
                    <button
                      type='button'
                      onClick={handleCancelClick}
                      className='ml-2 px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-200 focus:outline-none focus:ring focus:border-gray-300'
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className='grid grid-cols-1 gap-x-8 gap-y-10 border-b border-gray-900/10 pb-12 md:grid-cols-1'>
                  <p className='text-gray-200 '>Email: {userData.email}</p>
                  <p className='text-gray-200'>Nickname: {userData.nickname}</p>
                  <p className='text-gray-200'>Username: {userData.username}</p>
                  <p className='text-gray-200'>Admin: {userData.isAdmin ? 'Yes' : 'No'}</p>

                  <button
                    type='button'
                    onClick={handleEditClick}
                    className='mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-500 focus:outline-none focus:ring focus:border-indigo-300'
                  >
                    Edit
                  </button>
                </div>
              )}
            </>
          ) : (
            <p>
              {accessToken ? (
                // User is not logged in
                <>
                  To view your profile, please <a href='/login'>log in</a>.
                </>
              ) : (
                // Access token is not found, likely expired

                // Unable to fetch user data
                <>
                  {error ? (
                    // Show error message if error exists
                    <>
                      {error instanceof Error ? (
                        // Display the error message
                        <>
                          <p className='text-red-200'>Your session has expired. Please log in again</p>
                        </>
                      ) : (
                        // Show generic error message if the error is not an instance of Error
                        <>
                          Unable to fetch user data. Please try again later or <a href='/login'>log in</a>.
                        </>
                      )}
                    </>
                  ) : (
                    // Show generic loading message if no error
                    <>
                      To view your profile, please <a href='/login'>log in</a>
                    </>
                  )}
                </>
              )}
            </p>
          )}
        </form>
      </div>
    </motion.div>
  )
}

export default ProfilePage
