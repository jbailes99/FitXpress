'use client'
import React, { useState, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { api } from '@/lib/api' // Import your API utility function
import { getCurrentTokens, getUserDetails } from '@/utils/authService'
import { FaRunning, FaWalking, FaBiking, FaHeart, FaUser } from 'react-icons/fa'
import IntensitySelector from '@/components/intensitySelector' // Import the IntensitySelector component
import { redirect } from 'next/dist/server/api-utils'
import { useIsLoggedIn, useUserDetails, useIsAdmin } from '@/hooks'
import { Button } from '@/components/button'
import CalendarView from '@/components/calendarView'
import { Spinner, Tooltip, Typography } from '@material-tailwind/react'
import { Alert } from '@material-tailwind/react'
import { Panel } from '@/components/panel'
import { GiWeightLiftingUp } from 'react-icons/gi'
import { GiRunningNinja } from 'react-icons/gi'
import { GiBodyBalance } from 'react-icons/gi'
import { TbInfoTriangle } from 'react-icons/tb'
import { IoFitness } from 'react-icons/io5'

type ExerciseEntry = {
  entryId(entryId: any): unknown
  id: number
  amount?: number
  type: string
  reps?: string
  sets?: string
  additionalInfo: string
  weight?: string
  distance?: string
  time?: string
  intensity?: string
  timestamp: string
  exerciseCategory: string
  exerciseType: string
}

interface ExerciseData {
  items: { exerciseType: { S: string }; exerciseCategory: { S: string } }[]
}

const AlertMessage = ({ message, color, show }) => (
  <AnimatePresence>
    {show && (
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -50 }}
        transition={{ duration: 0.3 }}
        className="transform -translate-x-1/2 z-50"
      >
        <Alert color={color} className="bg-opacity-75 w-1/2 mx-auto mt-4">
          {message}
        </Alert>
      </motion.div>
    )}
  </AnimatePresence>
)

const ExerciseTracker = () => {
  const userDetails = useUserDetails()
  const [isLoading, setIsLoading] = useState(true)
  const [showDeleteAlert, setShowDeleteAlert] = useState(false) // Add state for delete alert visibility

  const [exerciseEntries, setExerciseEntries] = useState<ExerciseEntry[]>([])
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)
  const [categories, setCategories] = useState<string[]>([])
  const [selectedCategory, setSelectedCategory] = useState('')
  const [exerciseTypes, setExerciseTypes] = useState<string[]>([])
  const [selectedExerciseType, setSelectedExerciseType] = useState<string>('')
  const [newExerciseEntry, setNewExerciseEntry] = useState<Partial<ExerciseEntry>>({
    type: '',
    additionalInfo: '',
  })
  const intensityLevels = [
    { value: 'low', icon: <FaWalking />, label: 'Low' },
    { value: 'medium', icon: <FaBiking />, label: 'Medium' },
    { value: 'high', icon: <FaRunning />, label: 'High' },
    { value: 'extreme', icon: <FaHeart />, label: 'Extreme' },
  ]
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [showDurationAlert, setShowDurationAlert] = useState(false)

  const handleDateChange = (newDate: Date) => {
    setSelectedDate(newDate)
  }

  const categoryUrl =
    'https://69f40ajyj9.execute-api.us-east-1.amazonaws.com/default/getExerciseCategory'
  const exerciseDeleteEndpoint =
    'https://d4wil5bz64.execute-api.us-east-1.amazonaws.com/default/deleteExerciseLog'

  useEffect(() => {
    // Fetch exercise categories
    const fetchExerciseCategories = async () => {
      try {
        const response = await api.get(categoryUrl) // Assuming api.get returns the JSON response
        const { data } = response // Extract categories from the response
        const categories = data.categories
        setCategories(categories)
      } catch (error) {
        console.error('Error fetching exercise categories:', error)
      }
    }

    fetchExerciseCategories()
  }, [])
  const exerciseTypeUrl =
    'https://w8pu4zj2ol.execute-api.us-east-1.amazonaws.com/default/getExerciseType'

  useEffect(() => {
    const fetchExerciseTypes = async () => {
      try {
        if (selectedCategory) {
          const response = await api.get<{ types: string[] }>(exerciseTypeUrl, {
            params: { category: selectedCategory },
          })

          console.log(response.data.types)
          setExerciseTypes(response.data.types)
        } else {
          // If no category selected, clear exercise types
          setExerciseTypes([])
        }
      } catch (error) {
        console.error('Error fetching exercise types:', error)
      }
    }

    fetchExerciseTypes()
  }, [selectedCategory])

  const fetchExerciseLogs = async () => {
    setIsLoading(true)

    const storedTokens = getCurrentTokens()

    if (!storedTokens || !storedTokens.accessToken) {
      console.warn('Access token is missing. User might not be logged in.')
      return
    }

    try {
      const userDetails = await getUserDetails(storedTokens.accessToken)
      const userId = userDetails?.username

      if (!userId) {
        console.error('User ID is not defined.')
        return
      }

      const response = await api.post(
        'https://dqb2sp9hpk.execute-api.us-east-1.amazonaws.com/default/getExerciseLogs',
        { userId }
      )

      const responseData = response.data.items
      setExerciseEntries(responseData)
    } catch (error) {
      console.error('Error fetching exercise logs:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchExerciseLogs()
  }, [])

  const handleDelete = async (entryId) => {
    try {
      const storedTokens = getCurrentTokens()
      const userDetails = await getUserDetails(storedTokens.accessToken)
      const userId = userDetails.username

      console.log('Deleting item with entryId:', entryId)
      const response = await api.post(exerciseDeleteEndpoint, { entryId, userId })
      console.log('Response from lambda:', response.data)

      setShowDeleteAlert(true)

      // Fade away alert after 2 seconds
      setTimeout(() => {
        setShowDeleteAlert(false) // Reset alert visibility
      }, 2000) // 2000 milliseconds = 2 seconds

      fetchExerciseLogs()
    } catch (error) {
      console.error('Error deleting item:', error)
    }
  }

  const handleExerciseSubmit = async () => {
    setShowSuccessMessage(false)
    const storedTokens = getCurrentTokens()

    if (!storedTokens || !storedTokens.accessToken) {
      console.error('Access token is missing for saving results.')
      return
    }

    const userDetails = await getUserDetails(storedTokens.accessToken)
    const userId = userDetails.username

    // Check if the selected category is Cardio and duration is not selected
    if (selectedCategory === 'Cardio' && !newExerciseEntry.time) {
      console.error('Duration is required for Cardio exercises.')
      setShowDurationAlert(true)

      // Fade away alert after 2 seconds
      setTimeout(() => {
        setShowDurationAlert(false) // Reset alert visibility
      }, 2000) // 2000 milliseconds = 2 seconds

      return
    }

    const exerciseData = {
      userId,
      exerciseCategory: selectedCategory,
      exerciseType: selectedExerciseType,
      amount: newExerciseEntry.amount,
      reps: newExerciseEntry.reps,
      sets: newExerciseEntry.sets,
      additionalInfo: newExerciseEntry.additionalInfo,
      weight: newExerciseEntry.weight,
      distance: newExerciseEntry.distance,
      intensity: newExerciseEntry.intensity,
      time: newExerciseEntry.time,
      date: selectedDate.toISOString(),
    }

    try {
      await api.post(
        'https://7f1kwk0so2.execute-api.us-east-1.amazonaws.com/default/saveExerciseLog',
        exerciseData
      )
      setExerciseEntries((prevEntries) => [
        ...prevEntries,
        { ...newExerciseEntry, id: prevEntries.length + 1 } as ExerciseEntry,
      ])
      setShowSuccessMessage(true)

      // Fade away success message after 2 seconds
      setTimeout(() => {
        setShowSuccessMessage(false) // Reset success message visibility
      }, 2000) // 2000 milliseconds = 2 seconds

      // Reset the select boxes and new exercise entry state
      setNewExerciseEntry({
        type: '',
        amount: undefined,
        reps: '',
        sets: '',
        additionalInfo: '',
        weight: '',
        distance: '',
        intensity: '',
        time: '',
      })
      setSelectedExerciseType('')
      setSelectedCategory('') // Reset selected category

      fetchExerciseLogs()
    } catch (error) {
      console.error('Error logging exercise:', error)
    }
  }

  const renderExerciseDetails = (item: ExerciseEntry) => {
    const calculateCaloriesBurned = (intensity: string, time: number, weight: number) => {
      const CALORIES_PER_MINUTE = {
        low: 3.5,
        medium: 7,
        high: 10,
        extreme: 12.5,
      }

      // Base calories burned per minute based on intensity
      const baseCaloriesPerMinute = CALORIES_PER_MINUTE[intensity.toLowerCase()] || 0

      // Weight adjustment factor (calories burned per lb per minute)
      const weightFactor = 0.005

      // Calculate calories burned based on weight
      const caloriesPerMinute = baseCaloriesPerMinute * weightFactor * weight

      return caloriesPerMinute * time
    }

    // Calculate calories burned
    let caloriesBurned: number | null = null

    // Ensure item.time is converted to a number
    if (item.intensity && item.time && userDetails.weight) {
      // Convert item.time to a number
      const timeInMinutes = Number(item.time)

      if (!isNaN(timeInMinutes)) {
        caloriesBurned = calculateCaloriesBurned(item.intensity, timeInMinutes, userDetails.weight)
      } else {
        console.error('Invalid time value')
      }
    }

    switch (item.exerciseCategory) {
      case 'Cardio':
        const formatTime = (time: string): React.ReactNode => {
          const minutes = parseInt(time, 10)
          const hours = Math.floor(minutes / 60)
          const remainingMinutes = minutes % 60
          return `${hours} hour${hours > 1 ? 's' : ''} ${remainingMinutes} minute${
            remainingMinutes > 1 ? 's' : ''
          }`
        }

        return (
          <>
            <div className="text-white">
              <div className="flex items-center space-x-3 justify-center mb-4">
                <GiRunningNinja className="text-gray-200 h-6 w-6" />
                <h2 className="text-gray-300 text-base sm:text-lg">
                  <span className="font-semibold text-white">
                    {item.exerciseCategory.charAt(0).toUpperCase() + item.exerciseCategory.slice(1)}
                  </span>{' '}
                  at <span className="font-semibold text-white">{item.timestamp}</span>
                </h2>
              </div>
              <div className="space-y-3 w-3/4 mx-auto sm:space-y-2 border-t border-gray-700 pt-4">
                <p className="text-gray-300 text-base sm:text-lg flex items-center">
                  <div>
                    <span className="font-bold">Exercise:</span>{' '}
                    {item.exerciseType.charAt(0).toUpperCase() + item.exerciseType.slice(1)}
                  </div>
                </p>
                {item.distance && (
                  <p className="text-gray-300 text-base sm:text-lg flex items-center">
                    <div>
                      <span className="font-bold">Distance:</span> {item.distance}
                    </div>
                  </p>
                )}
                {item.time && (
                  <p className="text-gray-300 text-base sm:text-lg flex items-center">
                    <div>
                      <span className="font-bold">Time:</span> {formatTime(item.time)}
                    </div>
                  </p>
                )}
                {item.intensity && (
                  <p className="text-gray-300 text-base sm:text-lg flex items-center">
                    <div>
                      <span className="font-bold">Intensity:</span> {item.intensity}
                    </div>
                  </p>
                )}
                {item.additionalInfo && (
                  <p className="text-gray-300 text-base sm:text-lg flex items-center">
                    <div>
                      <span className="font-bold">Additional Info:</span> {item.additionalInfo}
                    </div>
                  </p>
                )}
                <p className="text-gray-300 text-base sm:text-lg flex items-center space-x-4">
                  <span className="font-bold">Estimated Calories Burned:</span>
                  <div className="flex space-x-2 items-center">
                    <Tooltip
                      className="bg-medium-purple-500"
                      content="Calories burned are estimated based on user weight, exercise type, intensity, and duration."
                      position="right"
                    >
                      <div className="text-gray-300 text-base sm:text-lg flex items-center">
                        <div>
                          <TbInfoTriangle className="text-medium-purple-300" />
                        </div>
                      </div>
                    </Tooltip>
                    <span>
                      {caloriesBurned !== null ? Math.round(caloriesBurned) : 'N/A'} calories
                    </span>
                  </div>
                </p>
              </div>
              <div className="flex justify-center mt-4">
                <Button
                  onClick={() => {
                    handleDelete(item.entryId)
                  }}
                  className="bg-red-600 text-gray-200 rounded shadow"
                >
                  Delete
                </Button>
              </div>
            </div>
          </>
        )
      case 'Strength training':
        return (
          <>
            <div className="text-white">
              <div className="flex items-center space-x-3 justify-center mb-4">
                <GiWeightLiftingUp className="text-gray-200 h-6 w-6" />
                <h2 className="text-gray-300 text-base sm:text-lg">
                  <span className="font-semibold text-white">{item.exerciseCategory}</span> at{' '}
                  <span className="font-semibold text-white">{item.timestamp}</span>
                </h2>
              </div>
              <div className="space-y-3 w-3/4  mx-auto sm:space-y-2 border-t border-gray-700 pt-4">
                <p className="text-gray-300 text-base sm:text-lg flex items-center">
                  <div>
                    <span className="font-bold">Exercise:</span>{' '}
                    {item.exerciseType.charAt(0).toUpperCase() + item.exerciseType.slice(1)}
                  </div>
                </p>
                {item.weight && (
                  <p className="text-gray-300 text-base sm:text-lg flex items-center">
                    <div>
                      <span className="font-bold">Weight:</span> {item.weight}
                    </div>
                  </p>
                )}
                {item.reps && (
                  <p className="text-gray-300 text-base sm:text-lg flex items-center">
                    <div>
                      <span className="font-bold">Reps:</span> {item.reps}
                    </div>
                  </p>
                )}
                {item.sets && (
                  <p className="text-gray-300 text-base sm:text-lg flex items-center">
                    <div>
                      <span className="font-bold">Sets:</span> {item.sets}
                    </div>
                  </p>
                )}
                {item.additionalInfo && (
                  <p className="text-gray-300 text-base sm:text-lg flex items-center">
                    <div>
                      <span className="font-bold">Additional Info:</span> {item.additionalInfo}
                    </div>
                  </p>
                )}
              </div>
              <div className="flex justify-center mt-4">
                <Button
                  onClick={() => {
                    handleDelete(item.entryId)
                  }}
                  className="bg-red-600 text-gray-200 rounded shadow"
                >
                  Delete
                </Button>
              </div>
            </div>
          </>
        )
      case 'Bodyweight Exercises':
        return (
          <>
            <div className="flex items-center space-x-3 justify-center mb-4">
              <GiBodyBalance className="text-gray-200 h-6 w-6" />
              <h2 className="text-gray-300 text-base sm:text-lg">
                <span className="font-semibold text-white">{item.exerciseCategory}</span> at{' '}
                <span className="font-semibold text-white">{item.timestamp}</span>
              </h2>
            </div>
            <div className="space-y-3 w-3/4  mx-auto sm:space-y-2 border-t border-gray-700 pt-4">
              <p className="text-gray-300 text-base sm:text-lg flex items-center">
                <div>
                  <span className="font-bold">Exercise:</span> {item.exerciseType}
                </div>
              </p>
              {item.amount && (
                <p className="text-gray-300 text-base sm:text-lg flex items-center">
                  <div>
                    <span className="font-bold">Reps:</span> {item.amount}
                  </div>
                </p>
              )}
              {item.additionalInfo && (
                <p className="text-gray-300 text-base sm:text-lg flex items-center">
                  <div>
                    <span className="font-bold">Additional Info:</span> {item.additionalInfo}
                  </div>
                </p>
              )}
            </div>

            <div className="flex justify-center mt-auto">
              <Button
                onClick={() => {
                  handleDelete(item.entryId)
                }}
                className="bg-red-600 text-gray-200 rounded shadow"
              >
                Delete
              </Button>
            </div>
          </>
        )

      default:
        return (
          <>
            <div className="text-white">
              <div className="flex items-center space-x-3 justify-center mb-4">
                <IoFitness className="text-gray-200 h-6 w-6" />
                <h2 className="text-gray-300 text-base sm:text-lg">
                  <span className="font-semibold text-white">
                    {item.exerciseCategory.charAt(0).toUpperCase() + item.exerciseCategory.slice(1)}
                  </span>{' '}
                  at <span className="font-semibold text-white">{item.timestamp}</span>
                </h2>
              </div>
              <div className="space-y-3 w-3/4 mx-auto sm:space-y-2 border-t border-gray-700 pt-4">
                <p className="text-gray-300 text-base sm:text-lg flex items-center">
                  <div>
                    <span className="font-bold">Exercise:</span>{' '}
                    {item.exerciseType.charAt(0).toUpperCase() + item.exerciseType.slice(1)}
                  </div>
                </p>
                {item.additionalInfo && (
                  <p className="text-gray-300 text-base sm:text-lg flex items-center">
                    <div>
                      <span className="font-bold">Additional Info:</span> {item.additionalInfo}
                    </div>
                  </p>
                )}
              </div>
              <div className="flex justify-center mt-auto">
                <Button
                  onClick={() => {
                    handleDelete(item.entryId)
                  }}
                  className="bg-red-600 text-gray-200 rounded shadow"
                >
                  Delete
                </Button>
              </div>
            </div>
          </>
        )
    }
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 },
      }}
    >
      <main>
        <div className="  mx-4 my-4  rounded-xl  relative isolate overflow-hidden ">
          <div className="flex flex-col justify-center items-center mb-4 ">
            <div className="bg-secondary-400 sm:outline sm:outline-medium-purple-500 rounded-xl mt-6 w-full sm:w-11/12 min-h-[60vh]">
              <div className="bg-medium-purple-500 text-gray-200 rounded-tl-lg rounded-tr-lg text-2xl p-3 text-center font-bold ">
                Log Exercises
              </div>

              <div className="flex">
                <div className="mt-12 text-black text-center justify-center items-center flex-grow w-11/12">
                  <h1 className="text-center text-white text-3xl font-bold mb-4">
                    Let&apos;s get started
                  </h1>
                  {/* Workout category dropdown */}
                  <div className="flex justify-center text-center ">
                    <div className="w-1/2">
                      <select
                        className="mt-1 p-2 border border-gray-300 rounded-md w-full text-center"
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                      >
                        <option value="" disabled>
                          Select a Workout Category
                        </option>
                        {categories.map((category) => (
                          <option key={category} value={category}>
                            {category}
                          </option>
                        ))}
                      </select>

                      {/* Exercise type dropdown */}
                      {selectedCategory && exerciseTypes.length > 0 && (
                        <select
                          className="mt-1 p-2 border border-gray-300 rounded-md w-full"
                          value={selectedExerciseType}
                          onChange={(e) => setSelectedExerciseType(e.target.value)}
                        >
                          <option value="" disabled>
                            Select an Exercise Type
                          </option>
                          {exerciseTypes.map((type) => (
                            <option key={type} value={type}>
                              {type.charAt(0).toUpperCase() + type.slice(1)}
                            </option>
                          ))}
                        </select>
                      )}

                      {selectedCategory === 'Cardio' && selectedExerciseType && (
                        <>
                          <select
                            className="mt-3 p-2 border border-gray-300 rounded-md w-full"
                            value={newExerciseEntry.time}
                            onChange={(e) =>
                              setNewExerciseEntry({
                                ...newExerciseEntry,
                                time: e.target.value,
                              })
                            }
                          >
                            <option value="0">Select Duration</option>

                            <option value="30">30 mins</option>
                            <option value="60">1 hour</option>
                            <option value="90">1 hour 30 mins</option>
                            <option value="120">2 hours</option>
                            <option value="150">2 hours 30 mins</option>
                            <option value="180">3 hours</option>
                            <option value="210">3 hours 30 mins</option>
                            <option value="240">4 hours</option>
                          </select>
                          <div className="mt-4 bg-white rounded-md pb-4">
                            <h1 className="justify-center text-center font-bold mb-2">
                              {' '}
                              Select Level of Intensity{' '}
                            </h1>
                            <IntensitySelector
                              selectedIntensity={newExerciseEntry.intensity}
                              onChange={(intensity) =>
                                setNewExerciseEntry({ ...newExerciseEntry, intensity })
                              }
                            />
                          </div>
                        </>
                      )}

                      {selectedCategory === 'Bodyweight Exercises' && selectedExerciseType && (
                        <>
                          <input
                            type="number"
                            placeholder="Amount"
                            className="mt-3 p-2 border border-gray-300 rounded-md w-full"
                            value={
                              newExerciseEntry.amount !== undefined ? newExerciseEntry.amount : ''
                            }
                            onChange={(e) =>
                              setNewExerciseEntry({
                                ...newExerciseEntry,
                                amount: e.target.value ? Number(e.target.value) : undefined,
                              })
                            }
                          />
                        </>
                      )}

                      {selectedCategory == 'Strength training' && selectedExerciseType && (
                        <>
                          <input
                            type="text"
                            placeholder="Weight"
                            className="mt-3 p-2 border border-gray-300 rounded-md w-full"
                            value={newExerciseEntry.weight}
                            onChange={(e) =>
                              setNewExerciseEntry({
                                ...newExerciseEntry,
                                weight: e.target.value,
                              })
                            }
                          />
                          <input
                            type="text"
                            placeholder="Reps"
                            className="mt-3 p-2 border border-gray-300 rounded-md w-full"
                            value={newExerciseEntry.reps}
                            onChange={(e) =>
                              setNewExerciseEntry({
                                ...newExerciseEntry,
                                reps: e.target.value,
                              })
                            }
                          />
                          <input
                            type="text"
                            placeholder="Sets"
                            className="mt-3 p-2 border border-gray-300 rounded-md w-full"
                            value={newExerciseEntry.sets}
                            onChange={(e) =>
                              setNewExerciseEntry({
                                ...newExerciseEntry,
                                sets: e.target.value,
                              })
                            }
                          />
                        </>
                      )}

                      {selectedCategory && selectedExerciseType && (
                        <>
                          <input
                            type="text"
                            placeholder="Additional Info"
                            className="mt-3 p-2 border border-gray-300 rounded-md w-full"
                            value={newExerciseEntry.additionalInfo}
                            onChange={(e) =>
                              setNewExerciseEntry({
                                ...newExerciseEntry,
                                additionalInfo: e.target.value,
                              })
                            }
                          />
                          <div className="mt-4 text-center">
                            {/* Input fields for reps and additional info */}
                            <button
                              className="bg-medium-purple-400 rounded-md text-white px-4 py-2 mb-4 pb-rounded hover:bg-medium-purple-600 mt-2"
                              onClick={handleExerciseSubmit}
                            >
                              Log Exercise
                            </button>
                          </div>
                        </>
                      )}
                      <AlertMessage
                        message="Duration is required for Cardio exercises."
                        color="red"
                        show={showDurationAlert}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <AlertMessage
            message="Successfully logged exercise"
            color="green"
            show={showSuccessMessage}
          />

          <div className="relative w-11/12 mx-auto mt-12">
            <div aria-hidden="true" className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-[#1f2937] text-medium-purple-300 rounded px-3 text-2xl font-semibold leading-6 ">
                Recent Logs
              </span>
            </div>
          </div>
          <AlertMessage
            message="Log entry deleted successfully."
            color="red"
            show={showDeleteAlert}
          />
          {isLoading ? (
            <div className="flex items-center mt-2 justify-center">
              <Spinner
                className="h-8 w-8 text-medium-purple-500"
                onPointerEnterCapture={undefined}
                onPointerLeaveCapture={undefined}
              />
            </div>
          ) : exerciseEntries.length > 0 ? (
            <div className="flex-grow mx-auto sm:w-1/2">
              <div className="mt-12 justify-center text-center">
                <div className="results-container ">
                  {exerciseEntries
                    .sort((a, b) => {
                      const dateA = new Date(a.timestamp)
                      const dateB = new Date(b.timestamp)
                      return dateB.getTime() - dateA.getTime()
                    })
                    .map((item) => (
                      <div
                        key={item.id}
                        className="bg-secondary-600 outline min-h-[240px] r outline-medium-purple-300 text-gray-200  mt-2 sm:py-4 p-2 rounded-bl-md rounded-tr-md shadow-md mb-4"
                      >
                        {renderExerciseDetails(item)}
                      </div>
                    ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex justify-center items-center h-full">
              <p className="text-gray-200 text-lg">No exercise logs found</p>
            </div>
          )}
        </div>
      </main>
    </motion.div>
  )
}

export default ExerciseTracker
