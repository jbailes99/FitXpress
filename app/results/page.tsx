'use client'
import React, { Fragment, useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { api } from '@/lib/api'
import { getCurrentTokens, getUserDetails } from '@/utils/authService'
import { Spinner } from '@material-tailwind/react'
import { Alert } from '@material-tailwind/react'
import { Button } from '@/components/button'

import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
} from 'chart.js'

// Register required Chart.js components including PointElement
ChartJS.register(CategoryScale, LinearScale, LineElement, PointElement, Title, Tooltip, Legend)

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ')
}

export default function Results() {
  const [selectedCategory, setSelectedCategory] = useState('bodyMetrics')
  const [loading, setLoading] = useState(true)
  const [selectedDataset, setSelectedDataset] = useState<
    'bmi' | 'fatMass' | 'leanMass' | 'bodyFatPercentage' | 'bodyWeight'
  >('bmi')
  const [selectedExerciseDataset, setSelectedExerciseDataset] =
    useState<'weightLifting'>('weightLifting')
  const [results, setResults] = useState<any[]>([])
  const [exerciseResults, setExerciseResults] = useState<any[]>([])
  const [exerciseStats, setExerciseStats] = useState({
    weightLifting: { maxWeight: 0 },
    cardio: { totalDistance: 0, totalTime: 0 },
  })
  const [loader, setLoader] = useState(false)
  const [showAlert, setShowAlert] = useState(false)
  const [alertMessage, setAlertMessage] = useState('')

  interface ExerciseResultItem {
    id: number
    type: string
    amount?: number
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
  interface ResultItem {
    userId: string
    bodyLeanMass: number
    bodyFatCalc: number
    timestamp: string
    bodyFatMass: number
    weight: number
    // Add more fields as needed
  }
  const [fadeInUp, setFadeInUp] = useState({
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  })

  const lambdaEndpoint =
    'https://64dktx24d8.execute-api.us-east-1.amazonaws.com/default/getCalculationResults'

  const deleteEndpoint =
    'https://g1v3jlh2g5.execute-api.us-east-1.amazonaws.com/default/deleteCalculationResult'

  const exerciseDeleteEndpoint =
    'https://d4wil5bz64.execute-api.us-east-1.amazonaws.com/default/deleteExerciseLog'
  const handleDeleteLogs = async (entryId) => {
    setLoader(true)
    try {
      const storedTokens = getCurrentTokens()
      const userDetails = await getUserDetails(storedTokens.accessToken)
      const userId = userDetails.username

      console.log('Deleting item with entryId:', entryId)
      const response = await api.post(exerciseDeleteEndpoint, { entryId, userId })
      console.log('Response from lambda:', response.data)
      alert('Exercise log deleted.')
      fetchExerciseLogs()
    } catch (error) {
      console.error('Error deleting item:', error)
    }
    setLoader(false)
  }

  const handleDelete = async (entryId) => {
    setLoader(true)
    try {
      const storedTokens = getCurrentTokens()
      const userDetails = await getUserDetails(storedTokens.accessToken)
      const userId = userDetails.username

      console.log('Deleting item with entryId:', entryId)
      const response = await api.post(deleteEndpoint, { entryId, userId })
      console.log('Response from lambda:', response.data)
      alert('Calculation entry deleted.')
      fetchResults()
    } catch (error) {
      console.error('Error deleting item:', error)
    }
    setLoader(false)
  }
  const fetchResults = async () => {
    setLoading(true)
    try {
      const storedTokens = getCurrentTokens()

      if (!storedTokens || !storedTokens.accessToken) {
        console.error('Access token is missing for saving results.')
        return
      }

      const userDetails = await getUserDetails(storedTokens.accessToken)
      const userId = userDetails.username

      const response = await api.post(lambdaEndpoint, { userId })

      // Access the data from the response
      const responseData = response.data.items
      // Sort the results by timestamp
      setResults(responseData)

      // Process and use responseData as needed
      console.log('Fetched data:', responseData)
    } catch (error) {
      console.error('Error fetching results:', error)
    }
    setLoading(false)
  }
  useEffect(() => {
    fetchResults()
  }, [])

  const fetchExerciseLogs = async () => {
    setLoader(true)
    const storedTokens = getCurrentTokens()
    const userDetails = await getUserDetails(storedTokens.accessToken)
    const userId = userDetails.username

    try {
      // Fetch exercise logs
      const response = await api.post(
        'https://dqb2sp9hpk.execute-api.us-east-1.amazonaws.com/default/getExerciseLogs',
        { userId }
      )
      const responseData = response.data.items
      // Update exerciseEntries state with the fetched data
      setExerciseResults(responseData)
      const stats = calculateExerciseStats(responseData)
      setExerciseStats(stats) // Make sure you have a state for exerciseStats
    } catch (error) {
      console.error('Error fetching exercise logs:', error)
    }
    setLoader(false)
  }
  useEffect(() => {
    fetchExerciseLogs()
  }, [])

  const calculateExerciseStats = (entries: ExerciseResultItem[]) => {
    const stats = {
      weightLifting: { maxWeight: 0 },
      cardio: { totalDistance: 0, totalTime: 0 },
    }

    entries.forEach((entry) => {
      // Handle Strength training
      if (entry.exerciseCategory === 'Strength training') {
        if (entry.weight) {
          const weight = parseFloat(entry.weight) // Convert to number if it's a string
          stats.weightLifting.maxWeight = Math.max(stats.weightLifting.maxWeight, weight)
        }
      }

      // Handle Cardio
      if (entry.exerciseCategory === 'Cardio') {
        if (entry.distance) {
          const distance = parseFloat(entry.distance) // Convert to number if it's a string
          stats.cardio.totalDistance += distance
        }
        if (entry.time) {
          const time = parseFloat(entry.time) // Convert to number if it's a string
          stats.cardio.totalTime += time
        }
      }
    })

    return stats
  }

  const processExerciseData = (exerciseResults: ExerciseResultItem[]) => {
    const sortedData = exerciseResults
      .map((item) => ({
        timestamp: new Date(item.timestamp).toISOString().split('T')[0],
        weight: item.weight ? parseFloat(item.weight) : 0, // Ensure weight is a number
      }))
      .sort((a, b) => a.timestamp.localeCompare(b.timestamp))

    return {
      weightData: sortedData.map((item) => ({
        x: item.timestamp,
        y: item.weight,
      })),
    }
  }

  const { weightData } = processExerciseData(exerciseResults)

  const exerciseDataset = {
    weightLifting: weightData,
  }[selectedExerciseDataset]

  const exerciseChartData = {
    labels: exerciseDataset.map((data) => data.x),
    datasets: [
      {
        label: 'Weight Lifting Progression',
        data: exerciseDataset.map((data) => data.y),
        fill: false,
        borderColor: 'rgb(75, 192, 192)', // You can customize this color
        tension: 0.1,
      },
    ],
  }

  const processData = (data: any[]) => {
    const sortedData = data
      .map((item) => ({
        timestamp: new Date(item.timestamp).getTime(), // Convert to milliseconds
        bodyBMI: item.bodyBMI,
        bodyFatMass: item.bodyFatMass,
        bodyLeanMass: item.bodyLeanMass,
        bodyFatCalc: item.bodyFatCalc,
        weight: item.weight,
      }))
      .sort((a, b) => a.timestamp - b.timestamp) // Sort by timestamp

    return {
      bmiData: sortedData.map((item) => ({
        x: new Date(item.timestamp).toISOString().split('T')[0], // Convert back to date string
        y: item.bodyBMI,
      })),
      fatMassData: sortedData.map((item) => ({
        x: new Date(item.timestamp).toISOString().split('T')[0],
        y: item.bodyFatMass,
      })),
      leanMassData: sortedData.map((item) => ({
        x: new Date(item.timestamp).toISOString().split('T')[0],
        y: item.bodyLeanMass,
      })),
      bodyFatPercentageData: sortedData.map((item) => ({
        x: new Date(item.timestamp).toISOString().split('T')[0],
        y: item.bodyFatCalc,
      })),
      bodyWeightData: sortedData.map((item) => ({
        x: new Date(item.timestamp).toISOString().split('T')[0],
        y: item.weight,
      })),
    }
  }

  const { bmiData, fatMassData, leanMassData, bodyFatPercentageData, bodyWeightData } =
    processData(results)

  const dataset = {
    bmi: bmiData,
    fatMass: fatMassData,
    leanMass: leanMassData,
    bodyFatPercentage: bodyFatPercentageData,
    bodyWeight: bodyWeightData,
  }[selectedDataset]

  const getColorForDataset = (dataset: string) => {
    switch (dataset) {
      case 'bmi':
        return 'rgb(75, 192, 192)'
      case 'fatMass':
        return 'rgb(255, 99, 132)'
      case 'bodyWeight':
        return 'rgb(256, 99, 132)'
      case 'leanMass':
        return 'rgb(54, 162, 235)'
      case 'bodyFatPercentage':
        return 'rgb(153, 102, 255)'
      case 'weightLifting':
        return 'rgb(75, 192, 192)'
      case 'cardio':
        return 'rgb(255, 159, 64)' // Orange for cardio
      default:
        return 'rgb(0, 0, 0)' // Fallback color
    }
  }

  const chartData = {
    labels: dataset.map((data) => data.x),
    datasets: [
      {
        label: selectedDataset.replace(/([A-Z])/g, ' $1').trim(), // Capitalize dataset label
        data: dataset.map((data) => data.y),
        fill: false,
        borderColor: getColorForDataset(selectedDataset),
        tension: 0.1,
      },
    ],
  }

  const options: Partial<ChartOptions<'line'>> = {
    plugins: {
      legend: {
        display: false, // Hide the legend
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Time',
        },
      },
      y: {
        title: {
          display: true,
          text: 'Value',
        },
      },
    },
  }

  const Statistic = ({ title, value, loading }) => {
    return (
      <div>
        <div className="p-4 bg-gray-800 text-gray-200 rounded-lg shadow-md">
          <h1 className="text-xl font-semibold mb-2">{title}:</h1>
          {!loading ? (
            <span className={`text-${value < 0 ? 'green' : 'red'}-500`}>{value.toFixed(2)}%</span>
          ) : (
            <span className="text-white/50">Loading</span>
          )}
        </div>
      </div>
    )
  }

  const renderExerciseDetails = (item: ExerciseResultItem) => {
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
            <div className="flex">
              <div>
                <p style={{ fontSize: '16px', margin: '5px 0' }}>
                  <strong>{item.timestamp}</strong>
                </p>

                <p style={{ fontSize: '16px', margin: '5px 0' }}>
                  Exercise Type: {item.exerciseType}
                </p>
                {item.intensity && (
                  <p style={{ fontSize: '16px', margin: '5px 0' }}>Intensity: {item.intensity}</p>
                )}
                <p style={{ fontSize: '16px', margin: '5px 0' }}>Time: {item.time}</p>
                {item.distance && (
                  <p style={{ fontSize: '16px', margin: '5px 0' }}>Distance: {item.distance}</p>
                )}
                {item.additionalInfo && (
                  <p style={{ fontSize: '16px', margin: '5px 0' }}>
                    Additional Info: {item.additionalInfo}
                  </p>
                )}
              </div>
              <div className="justify-center items-center flex ml-36 px-4 text">
                <p className="font-bold text-xl text-medium-purple-300" style={{ margin: '5px 0' }}>
                  {caloriesBurned} calories burned
                </p>
              </div>
            </div>
          </>
        )
      case 'Strength training':
        return (
          <>
            <p style={{ fontSize: '16px', margin: '5px 0' }}>
              <strong>{item.timestamp}</strong>
            </p>
            <p style={{ fontSize: '16px', margin: '5px 0' }}>Exercise Type: {item.exerciseType}</p>

            {item.weight && (
              <p style={{ fontSize: '16px', margin: '5px 0' }}>Weight: {item.weight}</p>
            )}
            {item.reps && <p style={{ fontSize: '16px', margin: '5px 0' }}>Reps: {item.reps}</p>}
            {item.sets && <p style={{ fontSize: '16px', margin: '5px 0' }}>Sets: {item.sets}</p>}
            {item.additionalInfo && (
              <p style={{ fontSize: '16px', margin: '5px 0' }}>Comments: {item.additionalInfo}</p>
            )}
          </>
        )
      case 'Bodyweight Exercises':
        return (
          <>
            <div className="text-white">
              <p style={{ fontSize: '16px', margin: '5px 0' }}>{item.timestamp}</p>

              <p style={{ fontSize: '16px', margin: '5px 0' }}>
                Exercise Type: {item.exerciseType}
              </p>

              {item.amount && (
                <p style={{ fontSize: '16px', margin: '5px 0' }}>Reps: {item.amount}</p>
              )}
              {item.additionalInfo && (
                <p style={{ fontSize: '16px', margin: '5px 0' }}>Comments: {item.additionalInfo}</p>
              )}
            </div>
          </>
        )
      default:
        return (
          <>
            <p style={{ fontSize: '16px', margin: '5px 0' }}>
              <strong>{item.timestamp}</strong>
            </p>
            <p style={{ fontSize: '16px', margin: '5px 0' }}>Exercise Type: {item.exerciseType}</p>
            <p className="text-red-200" style={{ fontSize: '16px', margin: '5px 0' }}>
              <strong>No statistics provided</strong>
            </p>
            {item.additionalInfo && (
              <p style={{ fontSize: '16px', margin: '5px 0' }}>
                Additional Info: {item.additionalInfo}
              </p>
            )}
          </>
        )
    }
  }

  // Calculate percentage difference

  const calculatePercentageDifference = (firstValue: number, lastValue: number) => {
    console.log(firstValue)
    console.log(lastValue)
    return ((firstValue - lastValue) / Math.abs(lastValue)) * 100
  }

  const bmiPercentageDifference =
    results.length > 0
      ? calculatePercentageDifference(results[0].bodyBMI, results[results.length - 1].bodyBMI)
      : 0

  const fatMassPercentageDifference =
    results.length > 0
      ? calculatePercentageDifference(
          results[0].bodyFatMass,
          results[results.length - 1].bodyFatMass
        )
      : 0

  const leanMassPercentageDifference =
    results.length > 0
      ? calculatePercentageDifference(
          results[0].bodyLeanMass,
          results[results.length - 1].bodyLeanMass
        )
      : 0

  const bodyFatPercentageDifference =
    results.length > 0
      ? calculatePercentageDifference(
          results[0].bodyFatCalc,
          results[results.length - 1].bodyFatCalc
        )
      : 0

  const darkenColor = (rgbColor: string) => {
    const rgb = rgbColor.match(/\d+/g)
    if (rgb && rgb.length === 3) {
      const [r, g, b] = rgb.map(Number)
      return `rgb(${Math.max(0, r - 30)}, ${Math.max(0, g - 30)}, ${Math.max(0, b - 30)})` // Darken by subtracting 30
    }
    return rgbColor
  }

  return (
    <motion.div initial="hidden" animate="visible" variants={fadeInUp}>
      <>
        <main>
          <div className=" bg-secondary-400 mx-4 my-4  rounded-xl  relative isolate overflow-hidden ">
            {/* Secondary navigation */}
            <div className="flex justify-center rounded-t-none ">
              <div className="flex bg-[#1f2937] w-1/16 px-4 justify-center space-x-12 pb-2 rounded-b-xl ">
                <button
                  className={`bg-medium-purple-500 hover:bg-medium-purple-700 text-white font-bold py-2 px-4 rounded ${
                    selectedCategory === 'bodyMetrics' ? 'bg-opacity-100' : 'bg-opacity-50'
                  }`}
                  onClick={() => setSelectedCategory('bodyMetrics')}
                >
                  Body Metrics
                </button>
                <button
                  className={`bg-medium-purple-500 hover:bg-medium-purple-700 text-white font-bold py-2 px-4 rounded ${
                    selectedCategory === 'exercises' ? 'bg-opacity-100' : 'bg-opacity-50'
                  }`}
                  onClick={() => setSelectedCategory('exercises')}
                >
                  Exercises
                </button>
              </div>
            </div>
            <div className="flex justify-center text-center ml-6 ">
              {/* <div className='flex space-x-24 items-center mt-4'> */}
              <div className=" rounded-2xl w-1/2  mr-4 p-12 mb-4 ">
                <h3 className="font-bold text-gray-200">Statistics</h3>
                {selectedCategory === 'bodyMetrics' && (
                  <div className="flex  flex-col space-y-4">
                    {true ? (
                      <>
                        <Statistic
                          loading={loading}
                          title="BMI change"
                          value={bmiPercentageDifference}
                        />
                        <Statistic
                          loading={loading}
                          title="Fat Mass change"
                          value={fatMassPercentageDifference}
                        />
                        <Statistic
                          loading={loading}
                          title="Lean Mass change"
                          value={leanMassPercentageDifference}
                        />
                        <Statistic
                          loading={loading}
                          title="Body Fat Change"
                          value={bodyFatPercentageDifference}
                        />
                      </>
                    ) : (
                      <div className="p-4 bg-gray-800 text-red-300 rounded-lg shadow-md">
                        <h1 className="text-xl font-semibold">
                          Keep recording more metric data to display stats!
                        </h1>
                      </div>
                    )}
                  </div>
                )}

                {selectedCategory === 'exercises' && (
                  <div className="flex-row space-y-4">
                    {/* Weight Lifting Section */}
                    {!exerciseStats.weightLifting.maxWeight ? (
                      <div className="p-4 bg-gray-800 text-gray-200 rounded-lg shadow-md">
                        <h3 className="text-xl font-semibold mb-2">Weight Lifting</h3>
                        <p className="text-lg">
                          <span className="font-bold">
                            Record weight lifting exercises to display stats!
                          </span>
                        </p>
                      </div>
                    ) : (
                      exerciseStats.weightLifting.maxWeight > 0 && (
                        <div className="p-4 bg-gray-800 text-gray-200 rounded-lg shadow-md">
                          <h3 className="text-xl font-semibold mb-2">Weight Lifting</h3>
                          <p className="text-lg">
                            Max Weight:{' '}
                            <span className="font-bold">
                              {exerciseStats.weightLifting.maxWeight} kg
                            </span>
                          </p>
                        </div>
                      )
                    )}

                    {/* Cardio Section */}
                    {(exerciseStats.cardio.totalDistance > 0 ||
                      exerciseStats.cardio.totalTime > 0) && (
                      <div className="p-4 bg-gray-800 text-gray-200 rounded-lg shadow-md">
                        <h3 className="text-xl font-semibold mb-2">Cardio</h3>

                        <p className="text-lg">
                          Total Time:{' '}
                          <span className="font-bold">
                            {exerciseStats.cardio.totalTime} minutes
                          </span>
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div className="bg-secondary-300 mr-6 mt-4 mb-4 rounded-2xl w-full">
                {selectedCategory === 'bodyMetrics' && (
                  <>
                    <div className="mt-4 space-x-6 pb-2 ">
                      <button
                        className="rounded-xl p-2  px-4  mr-2 transition-colors duration-200"
                        style={{ backgroundColor: getColorForDataset('bmi') }}
                        onMouseOver={(e) =>
                          (e.currentTarget.style.backgroundColor = darkenColor(
                            getColorForDataset('bmi')
                          ))
                        }
                        onMouseOut={(e) =>
                          (e.currentTarget.style.backgroundColor = getColorForDataset('bmi'))
                        }
                        onClick={() => setSelectedDataset('bmi')}
                      >
                        BMI
                      </button>
                      <button
                        className="rounded-xl p-2 mr-2 px-4 transition-colors duration-200"
                        style={{ backgroundColor: getColorForDataset('fatMass') }}
                        onMouseOver={(e) =>
                          (e.currentTarget.style.backgroundColor = darkenColor(
                            getColorForDataset('fatMass')
                          ))
                        }
                        onMouseOut={(e) =>
                          (e.currentTarget.style.backgroundColor = getColorForDataset('fatMass'))
                        }
                        onClick={() => setSelectedDataset('fatMass')}
                      >
                        Fat Mass
                      </button>
                      <button
                        className="rounded-xl p-2  px-4  mr-2 transition-colors duration-200"
                        style={{ backgroundColor: getColorForDataset('leanMass') }}
                        onMouseOver={(e) =>
                          (e.currentTarget.style.backgroundColor = darkenColor(
                            getColorForDataset('leanMass')
                          ))
                        }
                        onMouseOut={(e) =>
                          (e.currentTarget.style.backgroundColor = getColorForDataset('leanMass'))
                        }
                        onClick={() => setSelectedDataset('leanMass')}
                      >
                        Lean Mass
                      </button>
                      <button
                        className="rounded-xl p-2  px-4  transition-colors duration-200"
                        style={{ backgroundColor: getColorForDataset('bodyFatPercentage') }}
                        onMouseOver={(e) =>
                          (e.currentTarget.style.backgroundColor = darkenColor(
                            getColorForDataset('bodyFatPercentage')
                          ))
                        }
                        onMouseOut={(e) =>
                          (e.currentTarget.style.backgroundColor =
                            getColorForDataset('bodyFatPercentage'))
                        }
                        onClick={() => setSelectedDataset('bodyFatPercentage')}
                      >
                        Body Fat Percentage
                      </button>
                      <button
                        className="rounded-xl p-2  px-4  transition-colors duration-200"
                        style={{ backgroundColor: getColorForDataset('bodyWeight') }}
                        onMouseOver={(e) =>
                          (e.currentTarget.style.backgroundColor = darkenColor(
                            getColorForDataset('bodyWeight')
                          ))
                        }
                        onMouseOut={(e) =>
                          (e.currentTarget.style.backgroundColor = getColorForDataset('bodyWeight'))
                        }
                        onClick={() => setSelectedDataset('bodyWeight')}
                      >
                        Body Weight
                      </button>
                    </div>
                    <Line data={chartData} options={options} />
                  </>
                )}

                {selectedCategory === 'exercises' && (
                  <>
                    <div className="mt-4 space-x-6 pb-2">
                      <button
                        className="rounded-xl p-2 px-4 mr-2 transition-colors duration-200"
                        style={{ backgroundColor: getColorForDataset('weightLifting') }}
                        onMouseOver={(e) =>
                          (e.currentTarget.style.backgroundColor = darkenColor(
                            getColorForDataset('weightLifting')
                          ))
                        }
                        onMouseOut={(e) =>
                          (e.currentTarget.style.backgroundColor =
                            getColorForDataset('weightLifting'))
                        }
                        onClick={() => setSelectedExerciseDataset('weightLifting')}
                      >
                        Weight Lifting
                      </button>
                      {/* <button
                        className='rounded-xl p-2 px-4 mr-2 transition-colors duration-200'
                        style={{ backgroundColor: getColorForDataset('cardio') }}
                        onMouseOver={e =>
                          (e.currentTarget.style.backgroundColor = darkenColor(getColorForDataset('cardio')))
                        }
                        onMouseOut={e => (e.currentTarget.style.backgroundColor = getColorForDataset('cardio'))}
                        onClick={() => setSelectedExerciseDataset('cardio')}
                      >
                        Cardio
                      </button> */}
                    </div>

                    {/* Render the exercise chart based on the selected dataset */}
                    {selectedExerciseDataset === 'weightLifting' && (
                      <Line data={exerciseChartData} options={options} />
                    )}
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="bg-secondary-400 rounded-xl m-4 space-y-16 py-16 xl:space-y-20">
            <div>
              <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <h2 className="mx-auto max-w-2xl text-base font-semibold leading-6 text-gray-300 lg:mx-0 lg:max-w-none">
                  Recent activity
                </h2>
                {!loading ? (
                  <div className="results-container">
                    {selectedCategory === 'bodyMetrics' &&
                      results
                        .sort(
                          (a: ResultItem, b: ResultItem) =>
                            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
                        )
                        .map((item, index) => (
                          <div
                            key={index}
                            className="bg-secondary-100 text-white"
                            style={{
                              borderRadius: '8px',
                              boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
                              padding: '20px',
                              marginBottom: '20px',
                            }}
                          >
                            <p style={{ fontSize: '16px', margin: '5px 0' }}>
                              <strong>{item.timestamp}</strong>
                            </p>
                            <h2 style={{ fontSize: '18px', marginBottom: '10px' }}>
                              <strong>{item.userId}</strong>
                            </h2>
                            <p style={{ fontSize: '16px', marginBottom: '5px 0' }}>
                              BMI: {item.bodyBMI}
                            </p>
                            <p style={{ fontSize: '16px', margin: '5px 0' }}>
                              Body Lean Mass: {item.bodyLeanMass}
                            </p>
                            <p style={{ fontSize: '16px', margin: '5px 0' }}>
                              Body Fat Calculation: {item.bodyFatCalc}
                            </p>
                            <p style={{ fontSize: '16px', margin: '5px 0' }}>
                              Body Fat Mass: {item.bodyFatMass}
                            </p>
                            <p style={{ fontSize: '16px', margin: '5px 0' }}>
                              entryId: {item.entryId}
                            </p>
                            <p style={{ fontSize: '16px', margin: '5px 0' }}>
                              Weight: {item.weight}
                            </p>

                            <Button
                              onClick={() => {
                                handleDelete(item.entryId)
                              }}
                              className="bg-red-600 text-gray-200 rounded shadow"
                            >
                              Delete
                            </Button>
                          </div>
                        ))}
                    {selectedCategory === 'exercises' && (
                      <div className="results-container">
                        {exerciseResults.map((item) => (
                          <div
                            key={item.id}
                            className="bg-secondary-100 text-white"
                            style={{
                              borderRadius: '8px',
                              boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
                              padding: '20px',
                              marginBottom: '20px',
                            }}
                          >
                            {renderExerciseDetails(item)}
                            <Button
                              onClick={() => {
                                handleDeleteLogs(item.entryId)
                              }}
                              className="bg-red-600 text-gray-200 rounded shadow"
                            >
                              Delete
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-white/50 mx-auto text-2xl">loading...</div>
                )}
              </div>
            </div>
          </div>
        </main>
      </>
    </motion.div>
  )
}
