'use client'
import React, { useEffect, useState, ChangeEvent, FormEvent } from 'react'
import { motion } from 'framer-motion'
import { getUserDetails, getCurrentTokens, updateUserDetails } from '@/utils/authService'
import { PhotoIcon, UserCircleIcon } from '@heroicons/react/24/solid'
import { Panel } from '@/components/panel'

interface UserData {
  email?: string
  nickname?: string
  username?: string
  weight?: string
  age?: string
  sex?: string

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
    weight: '',
    age: '',
    sex: '',
    isAdmin: '',
  })
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [error, setError] = useState<Error | null>(null)
  const fetchUserData = async () => {
    try {
      // Retrieve stored tokens
      const tokens = getCurrentTokens()
      setAccessToken(tokens?.accessToken)
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
          sex: user?.sex || '',
          weight: user?.weight || '',
          age: user?.age || '',
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
  useEffect(() => {
    fetchUserData()
  }, [])

  const handleEditClick = () => {
    setEditMode(true)
  }
  const handleSaveClick = async () => {
    try {
      // Ensure that formValues is defined and contains necessary properties
      if (
        formValues &&
        formValues.nickname &&
        formValues.username &&
        formValues.weight &&
        formValues.age &&
        formValues.sex &&
        accessToken
      ) {
        await updateUserDetails(accessToken, {
          // Passing accessToken as the first argument
          'nickname': formValues.nickname,
          // 'username': formValues.username, *cant update username, cognito error?
          'custom:weight1': formValues.weight,
          'custom:age1': formValues.age,
          'custom:sex': formValues.sex,
        })

        console.log('Updating user details with:', updateUserDetails)

        setEditMode(false)
        // You might want to refetch user data to ensure it's up to date
      } else {
        console.error('Some form values are missing or undefined.', {
          formValues,
          accessToken,
        })
      }
    } catch (error) {
      console.error('Error updating user data:', error)
    }

    fetchUserData()
  }

  const handleCancelClick = () => {
    // Reset form values to original user data
    setFormValues({
      email: userData?.email || '',
      nickname: userData?.nickname || '',
      username: userData?.username || '',
      isAdmin: userData?.isAdmin ? 'true' : 'false',
      sex: userData?.sex || '',
      weight: userData?.weight || '',
      age: userData?.age || '',
    })

    setEditMode(false)
  }

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormValues(prevValues => ({
      ...prevValues,
      [name]: value,
    }))
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
      className='bg-gray-800 shadow min-h-screen flex items-center justify-center'
    >
      <div className='w-full max-w-2xl'>
        {' '}
        {/* Adjust max-width as needed */}
        <Panel className='rounded-xl'>
          <h1 className='text-2xl text-medium-purple-500 font-bold mb-6 text-center'>Your Profile</h1>
          <form className='p-4 '>
            {userData ? (
              <>
                {editMode ? (
                  <div className='flex flex-col items-center space-y-4 w-full max-w-md mx-auto'>
                    <div className='w-1/2'>
                      <label className='block text-sm font-medium text-gray-700 text-center'>Email:</label>
                      <input
                        type='email'
                        name='email'
                        value={userData.email}
                        readOnly
                        className='mt-1 p-2 bg-gray-500 border rounded-md w-full text-center'
                      />

                      <label className='block mt-4 text-sm font-medium text-gray-700 text-center'>Nickname:</label>
                      <input
                        type='text'
                        name='nickname'
                        value={formValues.nickname}
                        onChange={handleChange}
                        className='mt-1 p-2 border rounded-md w-full text-center'
                      />

                      <label className='block mt-4 text-sm font-medium text-gray-700 text-center'>Username:</label>
                      <input
                        type='text'
                        name='username'
                        value={userData.username}
                        readOnly
                        className='mt-1 p-2 bg-gray-500 border rounded-md w-full text-center'
                      />

                      <label className='block mt-4 text-sm font-medium text-gray-700 text-center'>Weight:</label>
                      <input
                        type='text'
                        name='weight'
                        value={formValues.weight}
                        onChange={handleChange}
                        className='mt-1 p-2 border rounded-md w-full text-center'
                      />

                      <label className='block mt-4 text-sm font-medium text-gray-700 text-center'>Age:</label>

                      <input
                        type='text'
                        name='age'
                        value={formValues.age}
                        onChange={handleChange}
                        className='mt-1 p-2 border rounded-md w-full text-center'
                      />

                      <label className='block mt-4 text-sm font-medium text-gray-700 text-center'>Sex:</label>
                      <select
                        name='sex'
                        value={formValues.sex}
                        onChange={handleChange}
                        className='mt-1 p-2 border rounded-md w-full text-center'
                      >
                        <option value='' disabled>
                          Select sex
                        </option>
                        <option value='male'>Male</option>
                        <option value='female'>Female</option>
                      </select>
                    </div>

                    <div className='mt-6 flex space-x-4'>
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
                        className='px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-200 focus:outline-none focus:ring focus:border-gray-300'
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className='flex flex-col items-center gap-x-8 gap-y-6 border-gray-900/10 pb-12 md:grid-cols-1'>
                    <p className='text-gray-200'>Email: {userData.email}</p>
                    <p className='text-gray-200'>Nickname: {userData.nickname}</p>
                    <p className='text-gray-200'>Username: {userData.username}</p>
                    <p className='text-gray-200'>Weight: {userData.weight}</p>
                    <p className='text-gray-200'>Age: {userData.age}</p>
                    <p className='text-gray-200'>Sex: {userData.sex}</p>

                    {userData.isAdmin && <p className='text-gray-200'>Admin: Yes</p>}

                    <button
                      type='button'
                      onClick={handleEditClick}
                      className='mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-500 focus:outline-none focus:ring focus:border-indigo-300 self-center justify-self-center'
                    >
                      Edit
                    </button>
                  </div>
                )}
              </>
            ) : (
              <p>
                {accessToken ? (
                  <>
                    To view your profile, please <a href='/login'>log in</a>.
                  </>
                ) : (
                  <>
                    {error ? (
                      <>
                        {error instanceof Error ? (
                          <p className='text-red-200'>Your session has expired. Please log in again</p>
                        ) : (
                          <>
                            Unable to fetch user data. Please try again later or <a href='/login'>log in</a>.
                          </>
                        )}
                      </>
                    ) : (
                      <>
                        To view your profile, please <a href='/login'>log in</a>
                      </>
                    )}
                  </>
                )}
              </p>
            )}
          </form>
        </Panel>
      </div>
    </motion.div>
  )
}

export default ProfilePage
