'use client'
import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { api } from '@/lib/api' // Import your API utility function
import CalendarView from '@/components/calendarView'
import { getCurrentTokens, getUserDetails } from '@/utils/authService'
import { FaRunning, FaWalking, FaBiking, FaHeart } from 'react-icons/fa'
import IntensitySelector from '@/components/intensitySelector' // Import the IntensitySelector component
import { redirect } from 'next/dist/server/api-utils'

type ExerciseEntry = {
  id: number
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

const ExerciseTracker = () => {
  const [exerciseEntries, setExerciseEntries] = useState<ExerciseEntry[]>([])
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

  const handleDateChange = (newDate: Date) => {
    setSelectedDate(newDate)
  }

  const categoryUrl = 'https://69f40ajyj9.execute-api.us-east-1.amazonaws.com/default/getExerciseCategory'
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
  const exerciseTypeUrl = 'https://w8pu4zj2ol.execute-api.us-east-1.amazonaws.com/default/getExerciseType'

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

  useEffect(() => {
    const fetchExerciseLogs = async () => {
      const storedTokens = getCurrentTokens()
      const userDetails = await getUserDetails(storedTokens.accessToken)
      const userId = userDetails.username

      try {
        // Fetch exercise logs from your API
        const response = await api.post(
          'https://dqb2sp9hpk.execute-api.us-east-1.amazonaws.com/default/getExerciseLogs',
          { userId }
        )
        const responseData = response.data.items
        // Update exerciseEntries state with the fetched data
        setExerciseEntries(responseData)
      } catch (error) {
        console.error('Error fetching exercise logs:', error)
      }
    }

    // Call the fetchExerciseLogs function when the component mounts or when the dependencies change
    fetchExerciseLogs()
  }, []) // Empty dependency array means this effect runs only once, similar to componentDidMount

  const handleExerciseSubmit = async () => {
    const storedTokens = getCurrentTokens()

    if (!storedTokens || !storedTokens.accessToken) {
      console.error('Access token is missing for saving results.')
      return
    }

    const userDetails = await getUserDetails(storedTokens.accessToken)
    const userId = userDetails.username

    const exerciseData = {
      userId,
      exerciseCategory: selectedCategory,
      exerciseType: selectedExerciseType,
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
      await api.post('https://7f1kwk0so2.execute-api.us-east-1.amazonaws.com/default/saveExerciseLog', exerciseData)
      setExerciseEntries(prevEntries => [
        ...prevEntries,
        { ...newExerciseEntry, id: prevEntries.length + 1 } as ExerciseEntry,
      ])
      setNewExerciseEntry({ type: '', reps: '', sets: '', additionalInfo: '' })
      setSelectedExerciseType('')
    } catch (error) {
      console.error('Error logging exercise:', error)
    }
  }

  const renderExerciseDetails = (item: ExerciseEntry) => {
    const calculateCaloriesBurned = (intensity, time) => {
      const CALORIES_PER_MINUTE = {
        low: 3.5,
        medium: 7,
        high: 10,
        extreme: 12.5,
      }
      const caloriesPerMinute = CALORIES_PER_MINUTE[intensity.toLowerCase()] || 0
      return caloriesPerMinute * time
    }

    let caloriesBurned: number | null = null
    if (item.intensity && item.time) {
      caloriesBurned = calculateCaloriesBurned(item.intensity, item.time)
    }

    switch (item.exerciseCategory) {
      case 'Cardio':
        return (
          <>
            <p style={{ fontSize: '16px', margin: '5px 0' }}>{item.timestamp}</p>

            <p style={{ fontSize: '16px', margin: '5px 0' }}>Exercise Type: {item.exerciseType}</p>
            {item.intensity && <p style={{ fontSize: '16px', margin: '5px 0' }}>Intensity: {item.intensity}</p>}
            <p style={{ fontSize: '16px', margin: '5px 0' }}>Time: {item.time}</p>
            {item.distance && <p style={{ fontSize: '16px', margin: '5px 0' }}>Distance: {item.distance}</p>}
            {item.additionalInfo && (
              <p style={{ fontSize: '16px', margin: '5px 0' }}>Additional Info: {item.additionalInfo}</p>
            )}

            <p style={{ fontSize: '24px', color: 'red', margin: '5px 0' }}>{caloriesBurned} calories burned</p>
          </>
        )
      case 'Strength training':
        return (
          <>
            <p style={{ fontSize: '16px', margin: '5px 0' }}>{item.timestamp}</p>

            <p style={{ fontSize: '16px', margin: '5px 0' }}>Exercise Type: {item.exerciseType}</p>

            {item.weight && <p style={{ fontSize: '16px', margin: '5px 0' }}>Weight: {item.weight}</p>}
            {item.reps && <p style={{ fontSize: '16px', margin: '5px 0' }}>Reps: {item.reps}</p>}
            {item.sets && <p style={{ fontSize: '16px', margin: '5px 0' }}>Sets: {item.sets}</p>}
            {item.additionalInfo && (
              <p style={{ fontSize: '16px', margin: '5px 0' }}>Comments: {item.additionalInfo}</p>
            )}
          </>
        )
      default:
        return (
          <>
            <p style={{ fontSize: '16px', margin: '5px 0' }}>{item.timestamp}</p>

            <p style={{ fontSize: '16px', margin: '5px 0' }}>Exercise Type: {item.type}</p>
            {item.additionalInfo && (
              <p style={{ fontSize: '16px', margin: '5px 0' }}>Additional Info: {item.additionalInfo}</p>
            )}
          </>
        )
    }
  }

  return (
    <motion.div
      initial='hidden'
      animate='visible'
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 },
      }}
    >
      <div>
        <div className='flex flex-col justify-center items-center mb-4 '>
          <div className='bg-secondary-400 p-12 rounded-xl mt-6 w-3/4 min-h-[60vh]'>
            <h1 className='text-6xl font-extrabold text-white mb-4 text-center '>Exercise Tracker</h1>
            <div className='flex'>
              <div className='mt-12 text-black text-center justify-center items-center flex-grow w-1/2'>
                <h1 className='text-center text-white text-xl font-bold mb-2'>Log an exercise</h1>
                {/* Workout category dropdown */}
                <div className='flex justify-center text-center '>
                  <div className='w-3/4'>
                    <select
                      className='mt-1 p-2 border border-gray-300 rounded-md w-full text-center'
                      value={selectedCategory}
                      onChange={e => setSelectedCategory(e.target.value)}
                    >
                      <option value='' disabled>
                        Select a Workout Category
                      </option>
                      {categories.map(category => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>

                    {/* Exercise type dropdown */}
                    {selectedCategory && exerciseTypes.length > 0 && (
                      <select
                        className='mt-1 p-2 border border-gray-300 rounded-md w-full'
                        value={selectedExerciseType}
                        onChange={e => setSelectedExerciseType(e.target.value)}
                      >
                        <option value='' disabled>
                          Select an Exercise Type
                        </option>
                        {exerciseTypes.map(type => (
                          <option key={type} value={type}>
                            {type}
                          </option>
                        ))}
                      </select>
                    )}

                    {selectedCategory === 'Strength training' && selectedExerciseType && (
                      <input
                        type='text'
                        placeholder='Weight'
                        className='mt-3 p-2 border border-gray-300 rounded-md w-full'
                        value={newExerciseEntry.weight}
                        onChange={e =>
                          setNewExerciseEntry({
                            ...newExerciseEntry,
                            weight: e.target.value,
                          })
                        }
                      />
                    )}
                    {selectedCategory === 'Cardio' && selectedExerciseType && (
                      <>
                        <select
                          className='mt-3 p-2 border border-gray-300 rounded-md w-full'
                          value={newExerciseEntry.time}
                          onChange={e =>
                            setNewExerciseEntry({
                              ...newExerciseEntry,
                              time: e.target.value,
                            })
                          }
                        >
                          <option value='0'>Select Duration</option>

                          <option value='30'>30 mins</option>
                          <option value='60'>1 hour</option>
                          <option value='90'>1 hour 30 mins</option>
                          <option value='120'>2 hours</option>
                          <option value='150'>2 hours 30 mins</option>
                          <option value='180'>3 hours</option>
                          <option value='210'>3 hours 30 mins</option>
                          <option value='240'>4 hours</option>
                        </select>
                        <div className='mt-4 bg-white rounded-md pb-4'>
                          <h1 className='justify-center text-center font-bold mb-2'> Select Level of Intensity </h1>
                          <IntensitySelector
                            selectedIntensity={newExerciseEntry.intensity}
                            onChange={intensity => setNewExerciseEntry({ ...newExerciseEntry, intensity })}
                          />
                        </div>
                      </>
                    )}

                    {selectedCategory == 'Strength training' && selectedExerciseType && (
                      <>
                        <input
                          type='text'
                          placeholder='Reps'
                          className='mt-3 p-2 border border-gray-300 rounded-md w-full'
                          value={newExerciseEntry.reps}
                          onChange={e =>
                            setNewExerciseEntry({
                              ...newExerciseEntry,
                              reps: e.target.value,
                            })
                          }
                        />
                        <input
                          type='text'
                          placeholder='Sets'
                          className='mt-3 p-2 border border-gray-300 rounded-md w-full'
                          value={newExerciseEntry.sets}
                          onChange={e =>
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
                          type='text'
                          placeholder='Additional Info'
                          className='mt-3 p-2 border border-gray-300 rounded-md w-full'
                          value={newExerciseEntry.additionalInfo}
                          onChange={e =>
                            setNewExerciseEntry({
                              ...newExerciseEntry,
                              additionalInfo: e.target.value,
                            })
                          }
                        />
                        <div className='mt-4 text-center'>
                          {/* Input fields for reps and additional info */}
                          <button
                            className='bg-medium-purple-400 rounded-md text-white px-4 py-2 pb-rounded hover:bg-medium-purple-600 mt-2'
                            onClick={handleExerciseSubmit}
                          >
                            Log Exercise
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {exerciseEntries.length > 0 && (
                <div className='flex-grow w-1/2'>
                  <div className='mt-12 justify-center text-center'>
                    <h1 className='font-bold text-xl text-white'>Recent logs</h1>
                    <div className='results-container'>
                      {exerciseEntries.map(item => (
                        <div key={item.id} className='bg-secondary-600 mt-2 p-4 rounded-md mb-4'>
                          {renderExerciseDetails(item)}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div>
        <div className='flex flex-col justify-center items-center'>
          <div className='bg-secondary-400 rounded-xl p-4 font-bold text-center w-3/4 mb-4'>
            <h1 className='text-3xl'>Weekly Planner</h1>
            <CalendarView selectedDate={selectedDate} onDateChange={handleDateChange} />
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default ExerciseTracker
