'use client'
import React, { useEffect, useState, ChangeEvent, FormEvent } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { getUserDetails, getCurrentTokens, updateUserDetails } from '@/utils/authService'
import { PhotoIcon, UserCircleIcon } from '@heroicons/react/24/solid'
import { Panel } from '@/components/panel'
import { Input, Alert, Spinner } from '@material-tailwind/react'
import { FaWeight } from 'react-icons/fa'

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
  const [newWeight, setNewWeight] = useState<string>('')
  const [weightError, setWeightError] = useState<string | null>(null)
  const [loading, setLoading] = useState<boolean>(true) // Add loading state
  const [successMessage, setSuccessMessage] = useState<string | null>(null) // Add success message state

  const fetchUserData = async () => {
    try {
      setLoading(true) // Set loading to true before fetching

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
    } finally {
      setLoading(false) // Set loading to false after fetching
    }
  }
  useEffect(() => {
    fetchUserData()
  }, [])

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
          nickname: formValues.nickname,
          // 'username': formValues.username, *cant update username, cognito error?
          'custom:weight1': formValues.weight,
          'custom:age1': formValues.age,
          'custom:sex': formValues.sex,
        })

        console.log('Updating user details with:', updateUserDetails)

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

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormValues((prevValues) => ({
      ...prevValues,
      [name]: value,
    }))
  }

  const handleWeightChange = (e: ChangeEvent<HTMLInputElement>) => {
    setNewWeight(e.target.value)
  }

  const handleWeightSubmit = async () => {
    // Reset weight error before validation
    setWeightError(null)
    setSuccessMessage(null) // Reset success message before submission

    if (!newWeight) {
      setWeightError('Weight input is empty.')
      return // Exit if the input is empty
    }

    if (isNaN(Number(newWeight))) {
      setWeightError('Weight input is not a number.')
      return // Exit if the input is not a number
    }

    if (newWeight.length > 4) {
      setWeightError('Please put in your real weight.')
      return // Exit if the input exceeds four digits
    }

    if (newWeight && accessToken) {
      try {
        await updateUserDetails(accessToken, {
          'custom:weight1': newWeight,
        })
        console.log('Weight updated to:', newWeight)
        setNewWeight('')
        setSuccessMessage('Weight submitted successfully!') // Set success message

        // Hide success message after 3 seconds
        setTimeout(() => {
          setSuccessMessage(null)
        }, 3000)

        fetchUserData()
      } catch (error) {
        console.error('Error updating weight:', error)
      }
    } else {
      setWeightError('Weight input is empty or access token is missing.')
    }
  }

  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  }

  // test
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={fadeInUp}
      className="shadow min-h-screen flex sm:mt-12 justify-center"
    >
      <div className="sm:w-3/4 w-11/12 py-4 pb-4 ">
        {/* Adjust max-width as needed */}
        <div className="rounded-xl outline pb-4 outline-medium-purple-500 bg-secondary-400">
          <div className="bg-medium-purple-500 text-gray-200 rounded-tl-lg rounded-tr-lg text-2xl p-3 text-center font-bold ">
            Profile
          </div>

          <div className="mt-8 flex flex-col bg-secondary-500 outline outline-medium-purple-500 sm:w-1/2 w-11/12 p-4 mx-auto rounded-md items-center space-y-4 text-gray-200">
            <h2 className="text-xl font-semibold text-center">
              {' '}
              <FaWeight className="inline-block mr-2" /> Weigh In
            </h2>
            <p className="text-gray-200">Current Weight: {userData?.weight}</p>
            <div className="">
              <Input
                type="text"
                value={newWeight}
                color="white"
                onChange={handleWeightChange}
                label="Weight in lbs"
                className="text-center"
                crossOrigin={undefined}
              />
            </div>
            <button
              type="button"
              onClick={handleWeightSubmit}
              className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 focus:outline-none focus:ring focus:border-indigo-300"
            >
              Submit Weight
            </button>
            <AnimatePresence>
              {weightError && (
                <motion.div
                  initial={{ opacity: 0, y: -50 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -50 }}
                  transition={{ duration: 0.3 }}
                  className=" transform -translate-x-1/2 z-50"
                >
                  <Alert color="red" className="mt-4 w-full mx-auto">
                    {weightError}
                  </Alert>
                </motion.div>
              )}
            </AnimatePresence>
            <AnimatePresence>
              {successMessage && ( // Display success message if it exists
                <motion.div
                  initial={{ opacity: 0, y: -50 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -50 }}
                  transition={{ duration: 0.3 }}
                  className=" transform -translate-x-1/2 z-50"
                >
                  <Alert color="green" className="mt-4 w-full mx-auto">
                    {successMessage}
                  </Alert>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* <div className="relative w-11/12 mx-auto mt-12">
            <div aria-hidden="true" className="absolute inset-0 flex items-center">
              <h1 className="mx-auto text-medium-purple-300 bg-secondary-400 p-4 text-lg">
                User Settings
              </h1>
            </div>
          </div> */}
          <div className="relative w-11/12 mx-auto mt-12">
            <div aria-hidden="true" className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-secondary-400 text-medium-purple-300 rounded px-3 text-xl font-semibold leading-6 ">
                User Settings
              </span>
            </div>
          </div>
          <div className="rounded sm:w-3/4 w-2/3 mb-4 p-4 mx-auto ">
            <form className="p-4 mt-4 ">
              {loading ? (
                <div className="flex justify-center">
                  <Spinner
                    color="purple"
                    onPointerEnterCapture={undefined}
                    onPointerLeaveCapture={undefined}
                  />
                </div>
              ) : userData ? (
                <>
                  <div className="flex flex-col items-center space-y-4 w-full max-w-md mx-auto">
                    <div className="sm:w-1/2 w-full">
                      <label className="block text-sm font-medium text-gray-200 text-center">
                        Email:
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={userData.email}
                        readOnly
                        className="mt-1 p-2 bg-gray-500 border rounded-md w-full text-center"
                      />

                      <label className="block mt-4 text-sm font-medium text-gray-200 text-center">
                        Nickname:
                      </label>
                      <input
                        type="text"
                        name="nickname"
                        value={formValues.nickname}
                        onChange={handleChange}
                        className="mt-1 p-2 border rounded-md w-full text-center"
                      />

                      <label className="block mt-4 text-sm font-medium text-gray-200 text-center">
                        Username:
                      </label>
                      <input
                        type="text"
                        name="username"
                        value={userData.username}
                        readOnly
                        className="mt-1 p-2 bg-gray-500 border rounded-md w-full text-center"
                      />

                      <label className="block mt-4 text-sm font-medium text-gray-200 text-center">
                        Age:
                      </label>

                      <input
                        type="text"
                        name="age"
                        value={formValues.age}
                        onChange={handleChange}
                        className="mt-1 p-2 border rounded-md w-full text-center"
                      />

                      <label className="block mt-4 text-sm font-medium text-gray-200 text-center">
                        Sex:
                      </label>
                      <select
                        name="sex"
                        value={formValues.sex}
                        onChange={handleChange}
                        className="mt-1 p-2 border rounded-md w-full text-center"
                      >
                        <option value="" disabled>
                          Select sex
                        </option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                      </select>
                    </div>

                    <div className="mt-6 flex space-x-4">
                      <button
                        type="button"
                        onClick={handleSaveClick}
                        className="px-4 py-2 bg-medium-purple-500 text-white rounded-md hover:bg-medium-purple-600 focus:outline-none focus:ring focus:border-indigo-300"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <p>
                  {accessToken ? (
                    <>
                      <div className="text-white">
                        To view your profile, please <a href="/login">log in</a>.
                      </div>
                    </>
                  ) : (
                    <>
                      {error ? (
                        <>
                          {error instanceof Error ? (
                            <p className="text-red-200">
                              Your session has expired. Please log in again
                            </p>
                          ) : (
                            <>
                              Unable to fetch user data. Please try again later or{' '}
                              <a href="/login">log in</a>.
                            </>
                          )}
                        </>
                      ) : (
                        <>
                          To view your profile, please <a href="/login">log in</a>
                        </>
                      )}
                    </>
                  )}
                </p>
              )}
            </form>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default ProfilePage
