'use client'
import React, { useState, useEffect } from 'react'
import { Panel } from '@/components/panel'
import { api } from '@/lib/api'

interface Exercise {
  exerciseType: string
  exerciseCategory: string
}

const AdminPanel = () => {
  const [exerciseType, setExerciseType] = useState('')
  const [exerciseCategory, setExerciseCategory] = useState('')
  const [exerciseList, setExerciseList] = useState<Exercise[]>([])

  const apiEndpoint = 'https://rh9j7m9y9j.execute-api.us-east-1.amazonaws.com/default/saveExerciseType'

  const handleExerciseSubmit = async (e: any) => {
    e.preventDefault()

    if (exerciseType && exerciseCategory) {
      try {
        const response = await api.post(apiEndpoint, {
          exerciseType,
          exerciseCategory,
        })

        setExerciseList(response.data)
        console.log(exerciseList)

        alert('Exercise saved successfully!')
      } catch (error) {
        console.error('Error saving exercise type:', error)
        alert('An error occurred while saving the exercise type.')
      }
    }

    // Add logic to submit exercise type to the database
    console.log('Exercise type submitted:', exerciseType)
    // Add the new exercise type to the list
    // Clear input field after submission
    setExerciseType('')
    setExerciseCategory('')
  }

  const fetchEndpoint = 'https://yvxqyykabg.execute-api.us-east-1.amazonaws.com/default/getExerciseType'
  const fetchExerciseList = async () => {
    try {
      const response = await api.get(fetchEndpoint)
      // Assuming the response contains the list of exercises under the key "items"
      setExerciseList(response.data.items)
    } catch (error) {
      console.error('Error fetching exercise list:', error)
      // Handle error
    }
  }

  useEffect(() => {
    // Fetch the list of exercises when the component mounts
    fetchExerciseList()
  }, [])

  return (
    <div className='flex justify-center items-center h-screen'>
      <Panel className='max-w-lg mx-auto text-secondary-500 p-6 h-1/2 shadow-md bg-white rounded-3xl justify-content items-center text-center'>
        <h1 className='text-3xl  font-semibold mb-14'>Welcome to the Admin Panel</h1>
        <div>
          <h2 className='text-xl font-semibold mb-2'>Add Exercise Type</h2>
          <form onSubmit={handleExerciseSubmit}>
            <div className='mb-4'>
              <label htmlFor='exerciseType' className='block text-sm font-medium text-gray-700'>
                Exercise Type:
              </label>
              <input
                type='text'
                id='exerciseType'
                value={exerciseType}
                onChange={e => setExerciseType(e.target.value)}
                className='mt-1 p-2 border rounded-md w-full focus:outline-none focus:border-blue-500'
                placeholder='Enter exercise type'
                required
              />
            </div>
            <div className='mb-4'>
              <label htmlFor='exerciseType' className='block text-sm font-medium text-gray-700'>
                Exercise Category:
              </label>
              <input
                type='text'
                id='exerciseType'
                value={exerciseCategory}
                onChange={e => setExerciseCategory(e.target.value)}
                className='mt-1 p-2 border rounded-md w-full focus:outline-none focus:border-blue-500'
                placeholder='Enter exercise type'
                required
              />
            </div>
            <button
              type='submit'
              className='bg-medium-purple-500 text-black py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:bg-blue-600'
            >
              Add Exercise Type
            </button>
          </form>
        </div>
        <div>
          <h2 className='text-xl text-black font-semibold mt-8 mb-2'>Current List of Exercises:</h2>
          <ul>
            {exerciseList.map((exercise, index) => (
              <li key={index}>
                <li key={index}>
                  {exercise.exerciseType} - {exercise.exerciseCategory}
                </li>
              </li>
            ))}
          </ul>
        </div>
      </Panel>
    </div>
  )
}

export default AdminPanel
