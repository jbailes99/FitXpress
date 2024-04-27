'use client'
import React, { Fragment, useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Dialog, Menu, Transition } from '@headlessui/react'
import {
  ArrowDownCircleIcon,
  ArrowPathIcon,
  ArrowUpCircleIcon,
  Bars3Icon,
  EllipsisHorizontalIcon,
  PlusSmallIcon,
} from '@heroicons/react/20/solid'
import { BellIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { api } from '@/lib/api'
import { getCurrentTokens, getUserDetails } from '@/utils/authService'

import { Button } from '@/components/button'

import { Line } from 'react-chartjs-2'
import { LinearScale, CategoryScale } from 'chart.js'
import { Chart as ChartJS, registerables } from 'chart.js'
import { Chart } from 'react-chartjs-2'
ChartJS.register(...registerables)

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ')
}

export default function Results() {
  const [selectedDataset, setSelectedDataset] = useState<string>('bmi')
  const [results, setResults] = useState<any>([])

  interface ResultItem {
    userId: string
    bodyLeanMass: number
    bodyFatCalc: number
    timestamp: string
    bodyFatMass: number
    // Add more fields as needed
  }
  const [fadeInUp, setFadeInUp] = useState({
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  })

  const lambdaEndpoint = 'https://64dktx24d8.execute-api.us-east-1.amazonaws.com/default/getCalculationResults'

  const deleteEndpoint = 'https://g1v3jlh2g5.execute-api.us-east-1.amazonaws.com/default/deleteCalculationResult'

  const handleDelete = async entryId => {
    try {
      const storedTokens = getCurrentTokens()
      const userDetails = await getUserDetails(storedTokens.accessToken)
      const userId = userDetails.username

      console.log('Deleting item with entryId:', entryId)
      const response = await api.post(deleteEndpoint, { entryId, userId })
      console.log('Response from lambda:', response.data)
      alert('Calculation entry deleted.')
    } catch (error) {
      console.error('Error deleting item:', error)
    }
  }

  useEffect(() => {
    const fetchResults = async () => {
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
    }

    fetchResults()
  }, [])

  // Extracting required data for charts
  let bmiData = results.map((item: any) => ({
    x: new Date(item.timestamp).getTime(),
    y: item.bodyBMI,
  }))

  let fatMassData = results.map((item: any) => ({
    x: new Date(item.timestamp).getTime(),
    y: item.bodyFatMass,
  }))

  let leanMassData = results.map((item: any) => ({
    x: new Date(item.timestamp).getTime(),
    y: item.bodyLeanMass,
  }))

  let bodyFatPercentageData = results.map((item: any) => ({
    x: new Date(item.timestamp).getTime(),
    y: item.bodyFatCalc,
  }))

  // Sort the data arrays by timestamp
  bmiData.sort((a, b) => a.x - b.x)
  fatMassData.sort((a, b) => a.x - b.x)
  leanMassData.sort((a, b) => a.x - b.x)
  bodyFatPercentageData.sort((a, b) => a.x - b.x)

  const uniqueDates = [...new Set(results.map((item: any) => new Date(item.timestamp).getTime()))]
    .sort((a, b) => a - b)
    .map(timestamp => new Date(timestamp).toLocaleDateString())
  // Extracting unique dates for x-axis labels

  const firstEntryChart = {
    labels: uniqueDates,
    datasets: [
      {
        label: 'BMI',
        data: bmiData.map(data => data.y),
        fill: false,
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1,
      },
      {
        label: 'Fat Mass',
        data: fatMassData.map(data => data.y),
        fill: false,
        borderColor: 'rgb(255, 99, 132)',
        tension: 0.1,
      },
      {
        label: 'Lean Mass',
        data: leanMassData.map(data => data.y),
        fill: false,
        borderColor: 'rgb(54, 162, 235)',
        tension: 0.1,
      },
      {
        label: 'Body Fat Percentage',
        data: bodyFatPercentageData.map(data => data.y),
        fill: false,
        borderColor: 'rgb(153, 102, 255)',
        tension: 0.1,
      },
    ],
  }

  const chartOptions = {
    legend: { display: false },
  }

  // Calculate percentage difference
  const calculatePercentageDifference = (firstValue: number, lastValue: number) => {
    console.log(firstValue)
    console.log(lastValue)
    return ((firstValue - lastValue) / Math.abs(lastValue)) * 100
  }

  const bmiPercentageDifference =
    results.length > 0 ? calculatePercentageDifference(results[0].bodyBMI, results[results.length - 1].bodyBMI) : 0

  const fatMassPercentageDifference =
    results.length > 0
      ? calculatePercentageDifference(results[0].bodyFatMass, results[results.length - 1].bodyFatMass)
      : 0

  const leanMassPercentageDifference =
    results.length > 0
      ? calculatePercentageDifference(results[0].bodyLeanMass, results[results.length - 1].bodyLeanMass)
      : 0

  const bodyFatPercentageDifference =
    results.length > 0
      ? calculatePercentageDifference(results[0].bodyFatCalc, results[results.length - 1].bodyFatCalc)
      : 0

  return (
    <motion.div initial='hidden' animate='visible' variants={fadeInUp}>
      <>
        <main>
          <div className=' bg-secondary-400 mx-4 my-4  rounded-xl  relative isolate overflow-hidden '>
            {/* Secondary navigation */}
            <div className='flex justify-center rounded-t-none '>
              <div className='flex bg-gray-800 w-1/16 px-4 justify-center space-x-12 pb-2 rounded-b-xl '>
                <button className='bg-medium-purple-500 hover:bg-medium-purple-700 text-white font-bold py-2 px-4 rounded'>
                  Body Metrics
                </button>
                <button className='bg-medium-purple-500 hover:bg-medium-purple-700 text-white font-bold py-2 px-4 rounded'>
                  Exercises
                </button>
              </div>
            </div>
            <div className='flex justify-center items-center text-center'>
              {/* <div className='flex space-x-24 items-center mt-4'> */}
              <div className='bg-secondary-300 rounded-2xl w-1/2 mr-4 p-12 mb-4'>
                <h3 className='font-bold'>Statistics</h3>
                <div className='font-bold text-2xl text-left mt-2'>
                  <p>BMI Percentage Difference: {bmiPercentageDifference.toFixed(2)}%</p>
                  <p>Fat Mass Percentage Difference: {fatMassPercentageDifference.toFixed(2)}%</p>
                  <p>Lean Mass Percentage Difference: {leanMassPercentageDifference.toFixed(2)}%</p>
                  <p>Body Fat Percentage Difference: {bodyFatPercentageDifference.toFixed(2)}%</p>
                </div>
              </div>

              <div className='bg-secondary-300 mr-12 rounded-2xl w-full'>
                <div>
                  <Button onClick={() => setSelectedDataset('bmi')}>BMI</Button>
                  <Button onClick={() => setSelectedDataset('fatMass')}>Fat Mass</Button>
                  <Button onClick={() => setSelectedDataset('leanMass')}>Lean Mass</Button>
                  <Button onClick={() => setSelectedDataset('bodyFatPercentage')}>Body Fat Percentage</Button>
                </div>
                <Line data={firstEntryChart} options={chartOptions} />
              </div>
            </div>
            {/* </div> */}
          </div>

          <div className='bg-secondary-400 rounded-xl m-4 space-y-16 py-16 xl:space-y-20'>
            {/* Recent activity table */}
            <div>
              <div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
                <h2 className='mx-auto max-w-2xl text-base font-semibold leading-6 text-gray-300 lg:mx-0 lg:max-w-none'>
                  Recent activity
                </h2>
                <div className='results-container'>
                  {results
                    .sort(
                      // @ts-ignore
                      (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
                    ) // Sort by timestamp
                    .map((item, index) => (
                      <div
                        key={index}
                        className='bg-secondary-100 text-white'
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
                        <p style={{ fontSize: '16px', marginBottom: '5px 0' }}>BMI: {item.bodyBMI}</p>
                        <p style={{ fontSize: '16px', margin: '5px 0' }}>Body Lean Mass: {item.bodyLeanMass}</p>
                        <p style={{ fontSize: '16px', margin: '5px 0' }}>Body Fat Calculation: {item.bodyFatCalc}</p>
                        <p style={{ fontSize: '16px', margin: '5px 0' }}>Body Fat Mass: {item.bodyFatMass}</p>
                        <p style={{ fontSize: '16px', margin: '5px 0' }}>entryId: {item.entryId}</p>

                        <Button
                          onClick={e => {
                            e.preventDefault()
                            handleDelete(item.entryId)
                          }}
                          className='bg-red-600 text-gray-200 rounded shadow'
                        >
                          Delete
                        </Button>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        </main>
      </>
    </motion.div>
  )
}
