import React, { useState, useEffect } from 'react'
import { addDays, format, set, startOfWeek } from 'date-fns'
import { api } from '@/lib/api' // Import your API utility function
import { StarIcon } from '@heroicons/react/24/solid'
import { components } from 'react-select'
import { Spinner } from '@material-tailwind/react'
import Select from 'react-select'
import { getCurrentTokens, getUserDetails } from '@/utils/authService'
import { useIsLoggedIn, useUserDetails, useIsAdmin } from '@/hooks'
import { motion } from 'framer-motion'
import { Alert } from '@material-tailwind/react'

interface WeeklyPlan {
  planName: string
  isActive: any
  entryId: string
  userId: string
  Monday: string[]
  Tuesday: string[]
  Wednesday: string[]
  Thursday: string[]
  Friday: string[]
  Saturday: string[]
  Sunday: string[]
  timestamp: string
}

const CalendarView = () => {
  const getWeeklyPlanApi = process.env.NEXT_PUBLIC_GET_WEEKLY_PLAN
  const getCategoriesApi = process.env.NEXT_PUBLIC_GET_CATEGORIES
  const getExerciseTypesApi = process.env.NEXT_PUBLIC_GET_EXERCISES
  const deleteWeeklyPlanApi = process.env.NEXT_PUBLIC_DELETE_WEEKLY_PLAN
  const makeWeeklyPlanActiveApi = process.env.NEXT_PUBLIC_MAKE_PLAN_ACTIVE
  const [isLoading, setIsLoading] = useState(false)
  const [planName, setPlanName] = useState('')
  const [isDeleting, setIsDeleting] = useState(false) // New state for deleting status
  const [deleteMessage, setDeleteMessage] = useState('') // New state for delete message
  const [showDeleteAlert, setShowDeleteAlert] = useState(false) // State to control alert visibility
  const [activePlan, setActivePlan] = useState<string | null>(null)
  const [weeklyPlans, setWeeklyPlans] = useState<WeeklyPlan[]>([])
  const userDetails = useUserDetails()
  const [currentDayIndex, setCurrentDayIndex] = useState(0) // Index for the current day (0 = Monday)
  const [weekStart, setWeekStart] = useState<Date>(startOfWeek(new Date(), { weekStartsOn: 1 }))
  const [selectedExercises, setSelectedExercises] = useState<{ [key: string]: string[] }>({})
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [categories, setCategories] = useState<string[]>([])
  const [exerciseTypes, setExerciseTypes] = useState<{ value: string; label: string }[]>([])
  const [isSaving, setIsSaving] = useState(false) // New state for saving status
  const [successMessage, setSuccessMessage] = useState('') // New state for success message

  const daysOfWeek = Array.from({ length: 7 }).map((_, index) => addDays(weekStart, index))

  const getRandomColor = () => {
    const colors = [
      'bg-red-200',
      'bg-blue-200',
      'bg-green-200',
      'bg-yellow-200',
      'bg-purple-200',
      'bg-pink-200',
    ]
    return colors[Math.floor(Math.random() * colors.length)]
  }

  const handleDeletePlan = async (entryId) => {
    if (!deleteWeeklyPlanApi) {
      alert('error')
      return
    }

    setIsDeleting(true)
    setDeleteMessage('')
    try {
      const storedTokens = getCurrentTokens()
      const userDetails = await getUserDetails(storedTokens.accessToken)
      const userId = userDetails.username

      console.log('Deleting item with entryId:', entryId)
      const response = await api.post(deleteWeeklyPlanApi, { entryId, userId })
      console.log('Response from lambda:', response.data)
      setDeleteMessage('Log entry deleted successfully')
      setShowDeleteAlert(true)
      setTimeout(() => {
        setShowDeleteAlert(false)
      }, 3000) // Hide alert after 3 seconds
      fetchWeeklyPlans()
    } catch (error) {
      console.error('Error deleting item:', error)
      alert('an error ocured while deleting')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleActivatePlan = async (entryId) => {
    if (!makeWeeklyPlanActiveApi) {
      alert('error')
      return
    }
    try {
      const storedTokens = getCurrentTokens()
      const userDetails = await getUserDetails(storedTokens.accessToken)
      const userId = userDetails.username

      const response = await api.post(makeWeeklyPlanActiveApi, { entryId, userId })
      console.log('Response from lambda:', response.data)
      alert('Plan active.')
      setActivePlan(entryId)
      fetchWeeklyPlans()
    } catch (error) {
      console.error('Error deleting item:', error)
    }
  }

  const fetchWeeklyPlans = async () => {
    setIsLoading(true)
    // Get the stored tokens
    const storedTokens = getCurrentTokens()

    // Check if the tokens or access token exist before proceeding
    if (!storedTokens || !storedTokens.accessToken) {
      console.warn('Access token is missing. User might not be logged in.')
      return // Exit early if no access token is found
    }

    try {
      // Fetch user details
      const userDetails = await getUserDetails(storedTokens.accessToken)
      const userId = userDetails?.username

      // Check if API endpoint and userId are defined
      if (!getWeeklyPlanApi || !userId) {
        console.error('API endpoint or user ID is not defined.')
        return
      }

      // Make the API call
      const response = await api.post(getWeeklyPlanApi, { userId })
      const data: { items: WeeklyPlan[] } = response.data // Ensure data is structured correctly

      // Sort and store the plans
      setWeeklyPlans(
        data.items.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      )
    } catch (error) {
      console.error('Error fetching weekly plans:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchWeeklyPlans()
  }, [getWeeklyPlanApi]) // Add dependencies if necessary

  useEffect(() => {
    if (!getCategoriesApi) {
      console.error('API endpoint is not defined')
      return
    }
    // Fetch exercise categories
    const fetchExerciseCategories = async () => {
      try {
        const response = await api.get(getCategoriesApi) // Assuming api.get returns the JSON response
        const { data } = response // Extract categories from the response
        const categories = data.categories
        setCategories(categories)
      } catch (error) {
        console.error('Error fetching exercise categories:', error)
      }
    }

    fetchExerciseCategories()
  }, [])
  useEffect(() => {
    if (selectedCategory) {
      if (!getExerciseTypesApi) {
        console.error('API endpoint is not defined')
        return
      }

      const fetchExerciseTypes = async () => {
        try {
          const response = await api.get<{ types: string[] }>(getExerciseTypesApi, {
            params: { category: selectedCategory },
          })

          // Transform the string array to the required format with uppercase first letter
          const exerciseTypes = response.data.types.map((type) => ({
            value: type,
            label: type.charAt(0).toUpperCase() + type.slice(1), // Ensure first letter is uppercase
          }))

          setExerciseTypes(exerciseTypes)
        } catch (error) {
          console.error('Error fetching exercise types:', error)
        }
      }

      fetchExerciseTypes()
    } else {
      setExerciseTypes([])
    }
  }, [selectedCategory])

  const CustomMultiValueRemove = () => {
    return null // Render nothing to hide the 'X'
  }
  const SelectedValue = (props) => {
    return (
      <components.MultiValue {...props}>
        <div className="Select-value" title={props.data.label}>
          <span className="Select-value-label">{props.data.label}</span>
        </div>
      </components.MultiValue>
    )
  }

  const handleExerciseChange = (selectedOptions: any) => {
    const selected = selectedOptions ? selectedOptions.map((opt: any) => opt.value) : []
    const currentDay = format(daysOfWeek[currentDayIndex], 'EEEE')

    setSelectedExercises((prev) => {
      const currentExercises = prev[currentDay] || []

      // Create a new set of exercises based on selected
      const newExercises = selected.reduce(
        (acc: string[], exercise: string) => {
          // Check if the exercise is already in the list
          if (!acc.includes(exercise)) {
            acc.push(exercise) // Add if not present
          }
          return acc
        },
        [...currentExercises]
      )

      // Remove deselected exercises
      selected.forEach((exercise) => {
        if (!selected.includes(exercise)) {
          const index = newExercises.indexOf(exercise)
          if (index > -1) {
            newExercises.splice(index, 1) // Remove if present
          }
        }
      })

      return {
        ...prev,
        [currentDay]: newExercises,
      }
    })
  }

  const navigateDay = (direction: 'prev' | 'next') => {
    setCurrentDayIndex((prev) => (direction === 'next' ? (prev + 1) % 7 : (prev - 1 + 7) % 7))
  }

  const getColorForExercise = (exerciseName: string) => {
    const colors = [
      'bg-red-200',
      'bg-blue-200',
      'bg-green-200',
      'bg-yellow-200',
      'bg-purple-200',
      'bg-pink-200',
    ]
    let hash = 0
    for (let i = 0; i < exerciseName.length; i++) {
      hash = exerciseName.charCodeAt(i) + ((hash << 5) - hash)
    }
    return colors[Math.abs(hash) % colors.length]
  }

  // Function to handle saving the weekly plan to the backend
  const handleSaveWeeklyPlan = async () => {
    setIsSaving(true) // Set loading state to true
    setSuccessMessage('') // Reset success message

    const storedTokens = getCurrentTokens()
    const userDetails = await getUserDetails(storedTokens.accessToken)
    const userId = userDetails.username

    // Prepare the payload for the API
    const payload = {
      userId,
      planName,
      Monday: selectedExercises.Monday || [],
      Tuesday: selectedExercises.Tuesday || [],
      Wednesday: selectedExercises.Wednesday || [],
      Thursday: selectedExercises.Thursday || [],
      Friday: selectedExercises.Friday || [],
      Saturday: selectedExercises.Saturday || [],
      Sunday: selectedExercises.Sunday || [],
    }

    try {
      const response = await fetch(
        'https://qyrqacyntg.execute-api.us-east-1.amazonaws.com/default/saveWeeklyPlans',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        }
      )

      if (response.ok) {
        await fetchWeeklyPlans()

        setSuccessMessage('Weekly plan saved successfully')

        setTimeout(() => {
          setSuccessMessage('') // Set success message
        }, 3000)

        // reset
        setSelectedExercises({
          Monday: [],
          Tuesday: [],
          Wednesday: [],
          Thursday: [],
          Friday: [],
          Saturday: [],
          Sunday: [],
        })

        //reset
        setSelectedCategory('')
        setExerciseTypes([])
        setPlanName('')
      } else {
        alert('Failed to save weekly plan')
      }
    } catch (error) {
      console.error('Error saving weekly plan:', error)
      alert('An error occurred while saving the plan.')
    } finally {
      setIsSaving(false) // Reset loading state
    }
  }

  const renderCurrentDay = () => {
    const currentDay = format(daysOfWeek[currentDayIndex], 'EEEE')
    return (
      <div className="day-card p-4 sm:p-6 bg-gray-50 rounded-lg text-center w-full max-w-md mx-auto">
        <h2 className="text-xl sm:text-2xl text-medium-purple-500 font-bold mb-2">{currentDay}</h2>

        <div className="mt-4">
          <label className="text-sm font-medium text-secondary-400 ">
            Select Workout Category:
          </label>
          <select
            className="p-2 border text-secondary-400 border-gray-300 rounded-md w-full mt-2 text-base"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="">Select a Category</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        {selectedCategory && (
          <div className="mt-4">
            <label className="block text-sm font-medium text-secondary-400 mb-2">
              Select Exercise Type:
            </label>
            <Select
              options={exerciseTypes}
              isMulti
              value={exerciseTypes.filter((type) =>
                selectedExercises[currentDay]?.includes(type.value)
              )}
              onChange={handleExerciseChange}
              isClearable={false} // Disable the clear button
              placeholder="Select Exercises"
              className="w-full text-base text-secondary-400"
              components={{
                MultiValue: SelectedValue,
                MultiValueRemove: CustomMultiValueRemove, // Use the custom remove component
              }}
            />
          </div>
        )}

        {/* Navigation Arrows */}
        <div className="mt-6 flex justify-between">
          <button
            onClick={() => navigateDay('prev')}
            className="bg-gray-300 text-gray-700 p-2 rounded-lg hover:bg-gray-400 text-sm sm:text-base"
          >
            ← Prev
          </button>
          <button
            onClick={() => navigateDay('next')}
            className="bg-gray-300 text-gray-700 p-2 rounded-lg hover:bg-gray-400 text-sm sm:text-base"
          >
            Next →
          </button>
        </div>
      </div>
    )
  }

  const renderWeeklyOverview = () => {
    return (
      <div className="mt-8  p-6  rounded-xl">
        <h3 className="text-xl text-gray-200 font-semibold mb-4">Plan Overview</h3>
        <div className="grid grid-cols-1  sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-2">
          {daysOfWeek.map((day, index) => {
            const dayName = format(day, 'EEEE')
            return (
              <div
                key={index}
                className="border-0 p-4 rounded-md text-secondary-400 bg-white shadow-sm sm:min-h-[240px]"
              >
                <h4 className="font-medium">{dayName}</h4>
                <div className="flex flex-wrap gap-2 mt-2">
                  {selectedExercises[dayName]?.length ? (
                    selectedExercises[dayName].map((exercise, i) => (
                      <span
                        key={i}
                        className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${getColorForExercise(
                          exercise
                        )} text-gray-700`}
                      >
                        {exercise.charAt(0).toUpperCase() + exercise.slice(1)}{' '}
                        <button
                          onClick={() => handleRemoveExercise(dayName, exercise)}
                          className="ml-2 text-lg  text-red-500"
                          title="Remove exercise"
                        >
                          &times;
                        </button>
                      </span>
                    ))
                  ) : (
                    <span className="text-sm text-gray-500">No exercises</span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  const handleRemoveExercise = (day: string, exercise: string) => {
    setSelectedExercises((prev) => {
      const currentExercises = prev[day] || []
      return {
        ...prev,
        [day]: currentExercises.filter((ex) => ex !== exercise),
      }
    })
  }

  return (
    <div className="calendar-view">
      <div className="bg-secondary-400 sm:outline sm:outline-medium-purple-500 rounded-lg">
        <div className="bg-medium-purple-500 rounded-tl-md rounded-tr-md text-gray-200 text-2xl p-3">
          Create a Weekly Plan
        </div>
        <div className="p-4 sm:p-6 w-full sm:w-3/4 md:w-1/2 mx-auto mt-4 rounded-lg">
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-200 mb-4">
            What do you want to call this plan?
          </h2>
          <div className="flex flex-col">
            <input
              type="text"
              id="planName"
              value={planName}
              onChange={(e) => setPlanName(e.target.value)}
              placeholder="Enter a name for your workout plan"
              className="p-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 text-secondary-400 focus:ring-medium-purple-500 text-base"
            />
          </div>
        </div>

        <div className="p-4 sm:p-6">
          <div className="flex justify-center">{renderCurrentDay()}</div>
          {renderWeeklyOverview()}
        </div>
        <div className="sm:px-4 sm:pt-3 py-4 px-2 bg-secondary-400 rounded-t-xl inline-block sm:w-4.5 ">
          <button
            onClick={handleSaveWeeklyPlan}
            className="bg-medium-purple-500 text-white sm:p-3 rounded-lg hover:bg-medium-purple-600 w-full p-1 sm:w-auto sm:text-base text-xs"
            disabled={isSaving} // Disable button while saving
          >
            {isSaving ? (
              <Spinner
                className="h-8 w-8 text-purple-500"
                onPointerEnterCapture={undefined}
                onPointerLeaveCapture={undefined}
              />
            ) : (
              'Save Weekly Plan'
            )}
          </button>
          {successMessage && (
            <p className="text-green-500 mt-2">{successMessage}</p> // Show success message
          )}
        </div>
      </div>

      <div className="relative mt-12">
        <div aria-hidden="true" className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-[#1f2937] px-3 text-2xl font-semibold leading-6 text-medium-purple-300">
            Your Plans
          </span>
        </div>
      </div>
      {showDeleteAlert && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }} // Start slightly smaller
          animate={{ opacity: 1, scale: 1 }} // Animate to full size
          exit={{ opacity: 0, scale: 0.9 }} // Fade out and shrink
          transition={{ duration: 0.5 }} // Duration for smoother transition
          className="mx-auto w-1/2 transform -translate-x-1/2 z-50"
        >
          <Alert color="red" className="text-center bg-opacity-75">
            {deleteMessage}
          </Alert>
        </motion.div>
      )}

      <div className="p-4">
        {isLoading ? (
          <div className="flex items-center mt-2 justify-center">
            <Spinner
              className="h-8 w-8 text-purple-500"
              onPointerEnterCapture={undefined}
              onPointerLeaveCapture={undefined}
            />{' '}
          </div>
        ) : weeklyPlans.length === 0 ? (
          <p className="text-gray-200">You do not have any plans yet.</p>
        ) : (
          weeklyPlans.map((plan) => (
            <div key={plan.entryId} className="bg-gray-100 p-4 mb-4 rounded-lg shadow-md">
              <h3 className="text-xl text-secondary-400 font-semibold mb-2">
                {plan.planName || 'Unnamed Plan'}
              </h3>
              <p className="text-sm text-gray-500 mb-2">{plan.timestamp}</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 text-secondary-400 md:grid-cols-3 lg:grid-cols-7 gap-2">
                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(
                  (day) => (
                    <div key={day} className="border p-2 rounded-md bg-white shadow-sm">
                      <h4 className="font-medium">{day}</h4>
                      <div className="flex flex-wrap gap-2">
                        {plan[day]?.map((exercise, index) => (
                          <span
                            key={index}
                            className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${getColorForExercise(
                              exercise
                            )} text-gray-700`}
                          >
                            {exercise.charAt(0).toUpperCase() + exercise.slice(1)}{' '}
                          </span>
                        )) || <span className="text-sm text-gray-500">No exercises</span>}
                      </div>
                    </div>
                  )
                )}
              </div>
              <div className="mt-4 flex flex-col sm:flex-row justify-center space-y-2 sm:space-y-0 sm:space-x-4">
                <button
                  onClick={() => handleActivatePlan(plan.entryId)}
                  className={`px-4 py-2 rounded-lg w-full sm:w-auto ${
                    plan.isActive
                      ? 'bg-green-500 text-white'
                      : 'bg-indigo-600 text-white hover:bg-indigo-700'
                  }`}
                  disabled={plan.isActive}
                >
                  {plan.isActive ? (
                    <span className="flex items-center justify-center">
                      <StarIcon className="w-6 h-6 mr-2 text-yellow-300" />
                      Active
                    </span>
                  ) : (
                    'Make Active'
                  )}
                </button>
                <button
                  onClick={() => handleDeletePlan(plan.entryId)}
                  className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 w-full sm:w-auto"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default CalendarView
