'use client'
import React from 'react'
import { useState, useEffect } from 'react'
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

  const apiEndpoint =
    'https://rh9j7m9y9j.execute-api.us-east-1.amazonaws.com/default/saveExerciseType'

  const handleExerciseSubmit = async (e: any) => {
    e.preventDefault()

    if (exerciseType && exerciseCategory) {
      try {
        await api.post(apiEndpoint, {
          exerciseType,
          exerciseCategory,
        })

        fetchExerciseList()

        alert('Exercise saved successfully!')
      } catch (error) {
        console.error('Error saving exercise type:', error)
        alert('An error occurred while saving the exercise type.')
      }
    }

    setExerciseType('')
    setExerciseCategory('')
  }

  const fetchEndpoint =
    'https://bgcthf8l4l.execute-api.us-east-1.amazonaws.com/default/getAllExerciseTypes'
  const fetchExerciseList = async () => {
    try {
      const response = await api.get(fetchEndpoint)
      const exercises = Array.isArray(response.data.exercises) ? response.data.exercises : []
      setExerciseList(exercises)
    } catch (error) {
      console.error('Error fetching exercise list:', error)
      setExerciseList([])
    }
  }

  useEffect(() => {
    fetchExerciseList()
  }, [])

  const groupedExercises = exerciseList.reduce((acc, exercise) => {
    if (!acc[exercise.exerciseCategory]) {
      acc[exercise.exerciseCategory] = []
    }
    acc[exercise.exerciseCategory].push(exercise)
    return acc
  }, {} as Record<string, Exercise[]>)

  return (
    <div className="flex flex-col items-center min-h-screen  p-6">
      <Panel className="max-w-4xl w-full p-8 justify-center items-center bg-white rounded-xl shadow-lg">
        <h1 className="text-4xl font-bold mb-8 text-center text-white">Admin Panel</h1>
        <div className="mb-8">
          <h2 className="text-2xl text-white font-semibold mb-4">Add Exercise Type</h2>
          <form onSubmit={handleExerciseSubmit} className="space-y-4">
            <div className="flex flex-col">
              <label htmlFor="exerciseType" className="text-sm text-white font-medium ">
                Exercise Type:
              </label>
              <input
                type="text"
                id="exerciseType"
                value={exerciseType}
                onChange={(e) => setExerciseType(e.target.value)}
                className="mt-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                placeholder="Enter exercise type"
                required
              />
            </div>
            <div className="flex flex-col">
              <label htmlFor="exerciseCategory" className="text-sm text-white font-medium ">
                Exercise Category:
              </label>
              <input
                type="text"
                id="exerciseCategory"
                value={exerciseCategory}
                onChange={(e) => setExerciseCategory(e.target.value)}
                className="mt-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                placeholder="Enter exercise category"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Add Exercise Type
            </button>
          </form>
        </div>
        <div>
          <h2 className="text-2xl text-white font-semibold mb-4">Current List of Exercises</h2>
          {Object.keys(groupedExercises).length > 0 ? (
            Object.keys(groupedExercises).map((category, index) => (
              <div key={index} className="mb-6">
                <h3 className="text-xl font-semibold mb-2 text-medium-purple-500">{category}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {groupedExercises[category].map((exercise, index) => (
                    <div key={index} className="p-4 bg-white rounded-lg shadow">
                      <p className="text-lg font-medium  text-medium-purple-300">
                        {exercise.exerciseType}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))
          ) : (
            <p>No exercises available</p>
          )}
        </div>
      </Panel>
    </div>
  )
}

export default AdminPanel
