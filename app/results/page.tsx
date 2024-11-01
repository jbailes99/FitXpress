'use client'
import React, { Fragment, useState, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { api } from '@/lib/api'
import { getCurrentTokens, getUserDetails } from '@/utils/authService'
import { Spinner } from '@material-tailwind/react'
import { Alert } from '@material-tailwind/react'
import { Button } from '@/components/button'
import { FaUser, FaChartLine, FaWeight } from 'react-icons/fa'
import {
  GiMuscleUp,
  GiBodySwapping,
  GiBurningPassion,
  GiRunningNinja,
  GiWeightLiftingUp,
  GiBodyBalance,
} from 'react-icons/gi'
import { BsSpeedometer2 } from 'react-icons/bs'
import { FaCalculator } from 'react-icons/fa'
import { IoBody, IoFitness } from 'react-icons/io5'
import { FaTshirt } from 'react-icons/fa'
import { Tooltip } from '@material-tailwind/react'
import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
  ChartOptions,
} from 'chart.js'
import { TbInfoTriangle } from 'react-icons/tb'
import { useRouter } from 'next/navigation'

// Register required Chart.js components including PointElement
ChartJS.register(CategoryScale, LinearScale, LineElement, PointElement, Title, ChartTooltip, Legend)

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ')
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
        <Alert color={color} className="bg-opacity-75 w-1/2 mx-auto mt-2 mb-2">
          {message}
        </Alert>
      </motion.div>
    )}
  </AnimatePresence>
)
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
  const [showDeleteAlert, setShowDeleteAlert] = useState(false)
  const [showSuccessAlert, setShowSuccessAlert] = useState(false)
  const [mostDoneExercise, setMostDoneExercise] = useState<{ type: string; count: number }>({
    type: '',
    count: 0,
  })

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

      setShowDeleteAlert(true)

      // Fetch the updated exercise logs after deletion
      await fetchExerciseLogs()

      setTimeout(() => {
        setShowDeleteAlert(false)
      }, 2000)
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

      setShowSuccessAlert(true)

      setTimeout(() => {
        setShowSuccessAlert(false)
      }, 2000)
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
          font: {
            size: 0, // Adjust this value to change the x-axis title font size
          },
        },
        ticks: {
          font: {
            size: 0, // Adjust this value to change the x-axis tick label font size
          },
        },
      },
      y: {
        title: {
          display: true,
          text: 'Value',
          font: {
            size: 0, // Adjust this value to change the y-axis title font size
          },
        },
        ticks: {
          font: {
            size: 0, // Adjust this value to change the y-axis tick label font size
          },
        },
      },
    },
  }

  const Statistic = ({ title, value, loading }) => {
    return (
      <div>
        <div className="p-4 bg-secondary-600 text-gray-200 rounded-lg shadow-lg">
          <h1 className="text-xl font-semibold mb-2">{title}:</h1>
          {!loading ? (
            <span className={`text-${value === 0 ? 'gray' : value < 0 ? 'green' : 'red'}-500`}>
              {value.toFixed(2)}%
            </span>
          ) : (
            <div className="flex items-center mt-2 justify-center">
              <Spinner
                className="h-8 w-8 text-purple-500"
                onPointerEnterCapture={undefined}
                onPointerLeaveCapture={undefined}
              />
            </div>
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
                      <span className="font-bold">Time:</span> {item.time}
                    </div>
                  </p>
                )}
                {item.intensity && (
                  <p className="text-gray-300 text-base sm:text-lg flex items-center">
                    <div>
                      <span className="font-bold">Intensity:</span>{' '}
                      {item.intensity.charAt(0).toUpperCase() + item.intensity.slice(1)}
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
            </div>
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

  // Function to calculate the most done exercise
  const calculateMostDoneExercise = (entries: ExerciseResultItem[]) => {
    const exerciseCount: { [key: string]: number } = {}

    entries.forEach((entry) => {
      if (entry.exerciseType) {
        exerciseCount[entry.exerciseType] = (exerciseCount[entry.exerciseType] || 0) + 1
      }
    })

    const mostDone = Object.entries(exerciseCount).reduce(
      (prev, current) => (current[1] > prev.count ? { type: current[0], count: current[1] } : prev),
      { type: '', count: 0 }
    )

    return mostDone
  }

  // Update the most done exercise whenever exerciseResults change
  useEffect(() => {
    const mostDone = calculateMostDoneExercise(exerciseResults)
    setMostDoneExercise(mostDone)
  }, [exerciseResults])

  const router = useRouter()

  return (
    <motion.div initial="hidden" animate="visible" variants={fadeInUp}>
      <>
        <main>
          <div className=" bg-secondary-400 pb-10 mx-4 my-4 flex-col rounded-xl  relative isolate overflow-hidden ">
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
            <div className="flex flex-col sm:flex-row justify-center text-center ">
              {/* <div className='flex space-x-24 items-center mt-4'> */}
              <div className=" rounded-2xl sm:w-1/2 w-full  mr-4 p-12 sm:mb-4 ">
                <h3 className="font-bold text-gray-200">Statistics</h3>
                {selectedCategory === 'bodyMetrics' && (
                  <div className="  flex-col space-y-4">
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
                    {/* Most Done Exercise Section */}
                    <div className="p-4 bg-secondary-600 text-gray-200 rounded-lg shadow-md">
                      <h3 className="text-xl font-semibold mb-2">Favorite Exercise</h3>
                      {mostDoneExercise.count > 0 ? (
                        <p className="text-lg text-gray-200">
                          <span className="font-bold text-medium-purple-500">
                            {mostDoneExercise.type.charAt(0).toUpperCase() +
                              mostDoneExercise.type.slice(1)}
                          </span>{' '}
                          has been done the most at a total of {mostDoneExercise.count} times.
                        </p>
                      ) : (
                        <p className="text-lg">
                          <span className="font-bold text-gray-200">Keep recording exercises!</span>
                        </p>
                      )}
                    </div>

                    {/* Weight Lifting Section */}
                    {!exerciseStats.weightLifting.maxWeight ? (
                      <div className="p-4 bg-secondary-600 text-gray-200 rounded-lg shadow-md">
                        <h3 className="text-xl font-semibold mb-2">Weight Lifting</h3>
                        <p className="text-lg">
                          <span className="font-bold text-gray-200">
                            Record weight lifting exercises to display stats!
                          </span>
                        </p>
                      </div>
                    ) : (
                      exerciseStats.weightLifting.maxWeight > 0 && (
                        <div className="p-4 bg-secondary-600 text-gray-200 rounded-lg shadow-md">
                          <h3 className="text-xl font-semibold mb-2">Weight Lifting</h3>
                          <p className="text-lg text-gray-200 ">
                            Max Weight:{' '}
                            <span className="font-bold text-medium-purple-500">
                              {exerciseStats.weightLifting.maxWeight} kg
                            </span>
                          </p>
                        </div>
                      )
                    )}

                    {/* Cardio Section */}
                    {!exerciseStats.cardio.totalTime ? (
                      <div className="p-4 bg-secondary-600 text-gray-200 rounded-lg shadow-md">
                        <h3 className="text-xl font-semibold mb-2">Cardio</h3>
                        <p className="text-lg">
                          <span className="font-bold text-gray-200">
                            Record cardio exercises to display stats!
                          </span>
                        </p>
                      </div>
                    ) : (
                      exerciseStats.cardio.totalTime > 0 && (
                        <div className="p-4 bg-secondary-600 text-gray-200 rounded-lg shadow-md">
                          <h3 className="text-xl font-semibold mb-2">Cardio</h3>
                          <p className="text-lg text-gray-200 ">
                            Total Time:{' '}
                            <span className="font-bold text-medium-purple-500">
                              {exerciseStats.cardio.totalTime} minutes
                            </span>
                          </p>
                        </div>
                      )
                    )}
                  </div>
                )}
              </div>
              <div className="bg-secondary-600 outline outline-medium-purple-500 sm:mr-6 sm:mt-4 mb-4 rounded-2xl w-11/12 mx-auto sm:w-full">
                {selectedCategory === 'bodyMetrics' && (
                  <>
                    <div className="mt-1 sm:space-x-6 space-x-2 space-y-1 pb-2">
                      <div className="sm:hidden">
                        <select
                          className="rounded-xl p-2 text-xs bg-secondary-500 text-white"
                          onChange={(e) => setSelectedDataset(e.target.value as any)}
                          value={selectedDataset}
                        >
                          <option value="bmi">BMI</option>
                          <option value="fatMass">Fat Mass</option>
                          <option value="leanMass">Lean Mass</option>
                          <option value="bodyFatPercentage">Body Fat Percentage</option>
                          <option value="bodyWeight">Body Weight</option>
                        </select>
                      </div>
                      <div className="hidden sm:block">
                        <button
                          className="rounded-xl mt-4 text-white sm:p-2 p-2 sm:px-4 mr-2 sm:text-lg text-xs transition-colors duration-200"
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
                          className="rounded-xl text-white sm:p-2 p-2 sm:px-4 mr-2 sm:text-lg text-xs transition-colors duration-200"
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
                          className="rounded-xl text-white sm:p-2 p-2 sm:px-4 mr-2 sm:text-lg text-xs transition-colors duration-200"
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
                          className="rounded-xl text-white sm:p-2 p-2 sm:px-4 mr-2 sm:text-lg text-xs transition-colors duration-200"
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
                          className="rounded-xl text-white sm:p-2 p-2 sm:px-4 mr-2 sm:text-lg text-xs transition-colors duration-200"
                          style={{ backgroundColor: getColorForDataset('bodyWeight') }}
                          onMouseOver={(e) =>
                            (e.currentTarget.style.backgroundColor = darkenColor(
                              getColorForDataset('bodyWeight')
                            ))
                          }
                          onMouseOut={(e) =>
                            (e.currentTarget.style.backgroundColor =
                              getColorForDataset('bodyWeight'))
                          }
                          onClick={() => setSelectedDataset('bodyWeight')}
                        >
                          Body Weight
                        </button>
                      </div>
                    </div>
                    <Line data={chartData} options={options} />
                  </>
                )}

                {selectedCategory === 'exercises' && (
                  <>
                    <div className="mt-4 space-x-6 pb-2">
                      <button
                        className="rounded-xl sm:text-lg text-xs text-white p-2 px-4 mr-2 transition-colors duration-200"
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
            <div className="rounded-xl m-4 space-y-16 py-6 xl:space-y-20">
              <div>
                <div className="mx-auto ">
                  <div className="relative mt-2 mb-12 w-11/12 mx-auto">
                    <div aria-hidden="true" className="absolute inset-0 flex items-center">
                      <div className="w-full border-t-2 border-gray-200" />
                    </div>
                    <div className="relative flex justify-center">
                      <span className="bg-secondary-400 px-3 text-2xl font-semibold leading-6 text-medium-purple-300">
                        All Activity
                      </span>
                    </div>
                  </div>
                  <AlertMessage
                    message="Successfully deleted result"
                    color="red"
                    show={showSuccessAlert}
                  />
                  <AlertMessage
                    message="Successfully deleted log"
                    color="red"
                    show={showDeleteAlert}
                  />
                  {!loading ? (
                    <div className="sm:w-1/2 w-full mx-auto">
                      {selectedCategory === 'bodyMetrics' &&
                        results
                          .sort(
                            (a: ResultItem, b: ResultItem) =>
                              new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
                          )
                          .map((item, index) => (
                            <div
                              key={index}
                              className="bg-secondary-600 outline outline-medium-purple-300 text-gray-200 rounded-bl-md rounded-tr-md shadow-md sm:py-4 p-2 mb-5"
                            >
                              <div className="w-3/4 mx-auto">
                                <div className="flex items-center space-x-3 justify-center mb-4">
                                  <FaUser className="text-gray-200" />
                                  <h2 className="text-gray-300 text-base sm:text-lg">
                                    <span className="font-semibold text-white">{item.userId}</span>{' '}
                                    at{' '}
                                    <span className="font-semibold text-white">
                                      {item.timestamp}
                                    </span>
                                  </h2>
                                </div>
                                <div className="space-y-3 sm:space-y-2 border-t border-gray-700 pt-4">
                                  <p className="text-gray-300 text-base sm:text-lg flex items-center">
                                    <BsSpeedometer2 className="mr-2 text-gray-200" />
                                    <div>
                                      <span className="font-bold">BMI:</span>{' '}
                                      {Math.round(item.bodyBMI)}
                                    </div>
                                  </p>
                                  <p className="text-gray-300 text-base sm:text-lg flex items-center">
                                    <GiBodySwapping className="mr-2 text-gray-200" />
                                    <div>
                                      <span className="font-bold">Body Lean Mass:</span>{' '}
                                      {Math.round(item.bodyLeanMass)}
                                    </div>
                                  </p>
                                  <p className="text-gray-300 text-base sm:text-lg flex items-center">
                                    <GiBodySwapping className="mr-2 text-gray-200" />
                                    <div>
                                      <span className="font-bold">Body Fat Mass: </span>{' '}
                                      {Math.round(item.bodyFatMass)}
                                    </div>
                                  </p>
                                  <p className="text-gray-300 text-base sm:text-lg flex items-center">
                                    <GiBurningPassion className="mr-2 text-gray-200" />
                                    <div>
                                      <span className="font-bold">Body Fat Calculation: </span>{' '}
                                      {Math.round(item.bodyFatCalc)}
                                    </div>
                                  </p>
                                  <p className="text-gray-300 text-base sm:text-lg flex items-center">
                                    <FaWeight className="mr-2 text-gray-200" />
                                    <div>
                                      <span className="font-bold">Weight:</span>{' '}
                                      {Math.round(item.weight)}
                                    </div>
                                  </p>
                                </div>
                              </div>

                              <div className="flex justify-center">
                                <Button
                                  onClick={() => handleDelete(item.entryId)}
                                  className="bg-red-600 text-gray-200 rounded shadow mt-4"
                                >
                                  Delete
                                </Button>
                              </div>
                            </div>
                          ))}
                      {selectedCategory === 'exercises' && (
                        <div className="results-container ">
                          {exerciseResults.length === 0 ? ( // Check if there are no exercise results
                            <div className="text-gray-200 text-center p-4">
                              <p className="text-gray-200">
                                Go to Exercise Hub to record an exercise.
                              </p>
                              <Button
                                onClick={() => {
                                  // Navigate to Exercise Hub
                                  router.push('/exercise') // Updated to link to /exercises
                                }}
                                className="mt-2 bg-medium-purple-500 text-white rounded px-4 py-2"
                              >
                                Go to Exercise Hub
                              </Button>
                            </div>
                          ) : (
                            exerciseResults.map((item) => (
                              <div
                                key={item.id}
                                className="bg-secondary-600 outline outline-medium-purple-300 text-gray-200 rounded-bl-md rounded-tr-md shadow-md sm:py-4 p-2 mb-5"
                              >
                                <div className="w-3/4 mx-auto">{renderExerciseDetails(item)}</div>
                                <div className="flex justify-center">
                                  <Button
                                    onClick={() => {
                                      handleDeleteLogs(item.entryId)
                                    }}
                                    className="bg-red-600 text-gray-200 rounded shadow mt-4"
                                  >
                                    Delete
                                  </Button>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      )}
                      {selectedCategory === 'bodyMetrics' &&
                        results.length === 0 && ( // Check if there are no calculation results
                          <div className="text-gray-200 text-center p-4">
                            <p className="text-gray-200">No calculation results to display.</p>
                            <Button
                              onClick={() => {
                                // Navigate to Metrics Recording Page
                                router.push('/') // Update this path as necessary
                              }}
                              className="mt-2 bg-medium-purple-500 text-white rounded px-4 py-2"
                            >
                              Go make a calculation
                            </Button>
                          </div>
                        )}
                    </div>
                  ) : (
                    <div className="flex items-center mt-2 justify-center">
                      <Spinner
                        className="h-8 w-8 text-purple-500"
                        onPointerEnterCapture={undefined}
                        onPointerLeaveCapture={undefined}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
      </>
    </motion.div>
  )
}
