import React, { useState, useEffect } from 'react'
import { addDays, format, startOfWeek } from 'date-fns'
import { api } from '@/lib/api' // Import your API utility function

import Select from 'react-select'
import { getCurrentTokens, getUserDetails } from '@/utils/authService'
import { useIsLoggedIn, useUserDetails, useIsAdmin } from '@/hooks'

interface WeeklyPlan {
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

  const [activePlan, setActivePlan] = useState<string | null>(null)
  const [weeklyPlans, setWeeklyPlans] = useState<WeeklyPlan[]>([])
  const userDetails = useUserDetails()
  const [currentDayIndex, setCurrentDayIndex] = useState(0) // Index for the current day (0 = Monday)
  const [weekStart, setWeekStart] = useState<Date>(startOfWeek(new Date(), { weekStartsOn: 1 }))
  const [selectedExercises, setSelectedExercises] = useState<{ [key: string]: string[] }>({})
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [categories, setCategories] = useState<string[]>([])
  const [exerciseTypes, setExerciseTypes] = useState<{ value: string; label: string }[]>([])

  const daysOfWeek = Array.from({ length: 7 }).map((_, index) => addDays(weekStart, index))

  const getRandomColor = () => {
    const colors = ['bg-red-200', 'bg-blue-200', 'bg-green-200', 'bg-yellow-200', 'bg-purple-200', 'bg-pink-200']
    return colors[Math.floor(Math.random() * colors.length)]
  }

  const handleDeletePlan = async entryId => {
    if (!deleteWeeklyPlanApi) {
      alert('error')
      return
    }
    try {
      const storedTokens = getCurrentTokens()
      const userDetails = await getUserDetails(storedTokens.accessToken)
      const userId = userDetails.username

      console.log('Deleting item with entryId:', entryId)
      const response = await api.post(deleteWeeklyPlanApi, { entryId, userId })
      console.log('Response from lambda:', response.data)
      alert('Log entry deleted.')
      fetchWeeklyPlans()
    } catch (error) {
      console.error('Error deleting item:', error)
    }
  }

  const handleActivatePlan = async entryId => {
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
    const storedTokens = getCurrentTokens()
    const userDetails = await getUserDetails(storedTokens.accessToken)
    const userId = userDetails.username

    if (!getWeeklyPlanApi || !userId) {
      console.error('API endpoint or user ID is not defined')
      return
    }

    try {
      const response = await api.post(getWeeklyPlanApi, { userId })
      const data: { items: WeeklyPlan[] } = response.data // Ensure data is structured correctly
      setWeeklyPlans(data.items.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()))
    } catch (error) {
      console.error('Error fetching weekly plans:', error)
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

          // Transform the string array to the required format
          const exerciseTypes = response.data.types.map(type => ({
            value: type,
            label: type,
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

  const handleExerciseChange = (selectedOptions: any) => {
    const selected = selectedOptions ? selectedOptions.map((opt: any) => opt.value) : []
    const currentDay = format(daysOfWeek[currentDayIndex], 'EEEE')
    setSelectedExercises(prev => ({
      ...prev,
      [currentDay]: selected,
    }))
  }

  const navigateDay = (direction: 'prev' | 'next') => {
    setCurrentDayIndex(prev => (direction === 'next' ? (prev + 1) % 7 : (prev - 1 + 7) % 7))
  }

  // Function to handle saving the weekly plan to the backend
  const handleSaveWeeklyPlan = async () => {
    const storedTokens = getCurrentTokens()
    const userDetails = await getUserDetails(storedTokens.accessToken)
    const userId = userDetails.username
    // Prepare the payload for the API
    const payload = {
      userId,
      Monday: selectedExercises.Monday || [],
      Tuesday: selectedExercises.Tuesday || [],
      Wednesday: selectedExercises.Wednesday || [],
      Thursday: selectedExercises.Thursday || [],
      Friday: selectedExercises.Friday || [],
      Saturday: selectedExercises.Saturday || [],
      Sunday: selectedExercises.Sunday || [],
    }

    try {
      const response = await fetch('https://qyrqacyntg.execute-api.us-east-1.amazonaws.com/default/saveWeeklyPlans', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (response.ok) {
        alert('Weekly plan saved successfully!')
        await fetchWeeklyPlans()
      } else {
        alert('Failed to save weekly plan')
      }
    } catch (error) {
      console.error('Error saving weekly plan:', error)
      alert('An error occurred while saving the plan.')
    }
  }

  const renderCurrentDay = () => {
    const currentDay = format(daysOfWeek[currentDayIndex], 'EEEE')
    return (
      <div className='day-card p-6 bg-gray-50 rounded-lg text-center'>
        <h2 className='text-xl font-bold mb-2'>{currentDay}</h2>
        <p className='text-sm text-gray-600'>{format(daysOfWeek[currentDayIndex], 'MM/dd/yyyy')}</p>

        {/* Category Selector */}
        <div className='mt-4'>
          <label className='text-sm font-medium'>Select Workout Category:</label>
          <select
            className='p-2 border border-gray-300 rounded-md w-full mt-2'
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
          >
            <option value=''>Select a Category</option>
            {categories.map(category => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        {/* Exercise Type Selector */}
        {selectedCategory && (
          <div className='mt-4'>
            <label className='block text-sm font-medium mb-2'>Select Exercise Type:</label>
            <Select
              options={exerciseTypes}
              isMulti
              value={exerciseTypes.filter(type => selectedExercises[currentDay]?.includes(type.value))}
              onChange={handleExerciseChange}
              placeholder='Select Exercises'
              className='w-full'
            />
          </div>
        )}

        {/* Navigation Arrows */}
        <div className='mt-6 flex justify-between'>
          <button
            onClick={() => navigateDay('prev')}
            className='bg-gray-300 text-gray-700 p-2 rounded-lg hover:bg-gray-400'
          >
            ← Previous
          </button>
          <button
            onClick={() => navigateDay('next')}
            className='bg-gray-300 text-gray-700 p-2 rounded-lg hover:bg-gray-400'
          >
            Next →
          </button>
        </div>
      </div>
    )
  }

  const renderWeeklyOverview = () => {
    return (
      <div className='mt-8'>
        <h3 className='text-xl font-semibold mb-4'>Weekly Plan</h3>
        <div className='grid grid-cols-7 gap-2 border-t border-l'>
          {daysOfWeek.map((day, index) => {
            const dayName = format(day, 'EEEE')
            return (
              <div key={index} className='day-overview p-4 bg-gray-50 rounded-lg'>
                <h4 className='text-lg font-bold mb-2'>{dayName}</h4>
                <ul className='list-disc pl-4 text-left'>
                  {selectedExercises[dayName]?.length ? (
                    selectedExercises[dayName].map((exercise, i) => (
                      <li
                        key={i}
                        className={`inline-block px-3 py-1 rounded-full text-sm text-gray-700 ${getRandomColor()}`}
                      >
                        {exercise}
                      </li>
                    ))
                  ) : (
                    <li className='text-sm text-gray-500'>No exercises</li>
                  )}
                </ul>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div className='calendar-view'>
      <div className='flex justify-center'>{renderCurrentDay()}</div>
      {renderWeeklyOverview()}
      <button onClick={handleSaveWeeklyPlan} className='bg-blue-500 mt-6 text-white p-3 rounded-lg hover:bg-blue-600'>
        Save Weekly Plan
      </button>
      <div className='p-4'>
        <h1 className='bg-blue-500 mt-6 text-white p-3 rounded-lg w-1/2 mx-auto mb-2'>Your Plans</h1>
        {weeklyPlans.length === 0 ? (
          <p>No weekly plans available.</p>
        ) : (
          weeklyPlans.map(plan => (
            <div key={plan.entryId} className='bg-gray-100 p-4 mb-4 rounded-lg shadow-md'>
              <h3 className='text-xl font-semibold mb-2'>{plan.timestamp}</h3>
              <div className='grid grid-cols-7 gap-2'>
                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                  <div key={day} className='border p-2 rounded-md bg-white shadow-sm'>
                    <h4 className='font-medium'>{day}</h4>
                    <ul className='list-disc list-inside text-sm'>
                      {plan[day]?.map((exercise, index) => <li key={index}>{exercise}</li>) || <li>No exercises</li>}
                    </ul>
                  </div>
                ))}
              </div>
              <div className='mt-4 flex justify-between'>
                <button
                  onClick={() => handleActivatePlan(plan.entryId)}
                  className={`px-4 py-2 rounded-lg ${
                    plan.isActive ? 'bg-green-500 text-white' : 'bg-blue-500 text-white hover:bg-blue-600'
                  }`}
                  disabled={plan.isActive}
                >
                  {plan.isActive ? 'Active' : 'Make Active'}
                </button>
                <button
                  onClick={() => handleDeletePlan(plan.entryId)}
                  className='bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600'
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
