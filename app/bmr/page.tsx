/* eslint-disable react/no-unescaped-entities */
'use client'
import React, { Fragment, useState } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { api } from '@/lib/api'
import { FaArrowDown } from 'react-icons/fa'
import { Line } from 'react-chartjs-2'
import { LinearScale, CategoryScale } from 'chart.js'
import { Chart as ChartJS, registerables } from 'chart.js'
import { Chart } from 'react-chartjs-2'
import { CheckIcon } from '@heroicons/react/24/outline'
import { motion } from 'framer-motion'
import Link from 'next/link'
import SignUp from '@/components/SignUp'
import GenderExplanationModal from '@/components/genderModal'
import { Panel } from '@/components/panel'
ChartJS.register(...registerables)

//ONLY ALLOW BACK SPACE, QUOTES, LEFT AND RIGHT ARROW KEYS
const VALID_KEYS = [8, 9, 37, 39, 222]

const chartData = {
  labels: ['Label 1', 'Label 2', 'Label 3'],
  datasets: [
    {
      label: 'My Dataset',
      data: [10, 20, 15],
    },
  ],
}

const chartOptions = {
  scales: {
    x: {
      type: 'category',
    },
    y: {
      beginAtZero: true,
    },
  },
}

const BmiCalculator: React.FC = () => {
  const [weight, setWeight] = useState<number | undefined>(undefined)
  const [age, setAge] = useState<number | undefined>(undefined)
  const [neckMeasurement, setNeckMeasurement] = useState<number | undefined>(undefined)
  const [waistMeasurement, setWaistMeasurement] = useState<number | undefined>(undefined)
  const [height, setHeight] = useState<string | undefined>(undefined)
  const [bodyFatCalc, setBodyFatCalc] = useState<number | null>(null)
  const [bodyFatMass, setBodyFatMass] = useState<number | null>(null)
  const [bodyBMR, setBodyBMR] = useState<number | null>(null)
  const [bodyLeanMass, setBodyLeanMass] = useState<number | null>(null)
  const [bodyBMI, setBodyBMI] = useState<number | null>(null)
  const [bodyFatBMI, setBodyFatBMI] = useState<number | null>(null)
  const [showResults, setShowResults] = useState(false) // set to false
  const [showMoreInfo, setShowMoreInfo] = useState(false) // set to false
  const [bmi, setBmi] = useState<number | null>(null)
  const [open, setOpen] = useState(true)
  const [isSignUpOpen, setIsSignUpOpen] = useState(false)
  const [fadeInUp, setFadeInUp] = useState({
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  })
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false)
  const openModal = () => {
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
  }
  const bmiRanges = [
    { label: 'Underweight', min: 15, max: 18.5 },
    { label: 'Normal Weight', min: 18.6, max: 24.9 },
    { label: 'Overweight', min: 25, max: 29.9 },
    { label: 'Obese', min: 30, max: 50 },
  ]

  const handleGoBack = () => {
    // Set showResults to false when the "Go Back" button is clicked
    setShowResults(false)
  }

  const bmiData = {
    labels: bmiRanges.map(range => range.label),
    datasets: [
      {
        data: bmiRanges.map(range => (range.min + range.max) / 2),
        borderColor: 'rgba(75,192,192,1)',
        borderWidth: 2,
        pointBackgroundColor: 'rgba(75,192,192,1)',
        pointRadius: 6,
      },
      {
        data: [bmi || bodyBMI],
        borderColor: 'rgba(255, 0, 0, 1)',
        borderWidth: 2,
        pointBackgroundColor: 'rgba(255, 0, 0, 1)',
        pointRadius: 8,
      },
    ],
  }

  const options = {
    scales: {
      y: {
        min: 15,
        max: 50, // Adjust the maximum value as needed
        title: {
          display: true,
          text: 'BMI',
        },
      },
    },
  }

  const openSignUpModal = () => {
    setIsSignUpOpen(true)
  }

  const handleNumberInputChange = (value: string, setter: (value: number | undefined) => void) => {
    if (!value) {
      setter(undefined)
    } else {
      setter(Number(value))
    }
  }

  const handleFeetInputChange = (value: string, setter: (value: string | undefined) => void) => {
    if (!value) {
      setter(undefined)
    } else {
      setter(value)
    }
  }

  const onFeetDown = (e: any) => {
    // check if input key is a number or quote
    if ((e.keyCode < 48 || e.keyCode > 57) && !VALID_KEYS.includes(e.keyCode)) {
      e.preventDefault()
    }
  }

  const apiEndpoint = 'https://lm6vr3st47.execute-api.us-east-1.amazonaws.com/default/c'

  const onSubmit = async (e: any) => {
    // send a POST request to apiEndpoint and pass in the weight, height, age, neck measurement, and waist measurement
    // and make sure that the variables arent empty

    e.preventDefault()

    if (weight && height && age && neckMeasurement && waistMeasurement) {
      try {
        console.log('Sending data:', { weight, height, age, neckMeasurement, waistMeasurement })

        const response = await api.post(apiEndpoint, {
          weight,
          height,
          age,
          neckMeasurement,
          waistMeasurement,
        })
        const data = response.data
        setBodyBMR(data.bodyBMR)

        console.log('Response from API:', response.data)
      } catch (e: any) {
        if (e.response && e.response.data) {
          alert(e.response.data.error)
        } else {
          console.error(e)
          alert('An error occurred')
        }
      }
    }

    setShowResults(true)

    //test our values
    // console.log(weight)
    // console.log(height)
    // console.log(age)
    // console.log(neckMeasurement)
    // console.log(waistMeasurement)
  }

  function handleGenderChange(value: string): void {
    throw new Error('Function not implemented.')
  }

  return (
    <motion.div initial='hidden' animate='visible' variants={fadeInUp}>
      <Panel className='flex flex-col justify-center items-center min-h-screen overflow-x-hidden '>
        <h1 className='text-2xl font-bold tracking-tight text-gray-300 sm:text-6xl mb-14'>FitXpress</h1>

        <div
          className={`bg-gray-800 text-center mb-6 p-4 md:p-12 rounded-3xl shadow-2xl mt-2 ${
            showResults ? 'sm:w-3/4 max-w-3/4' : 'sm:w-3/4 max-w-screen-full'
          }`}
        >
          <h1 className='sm:text-3xl text-lg sm:mt-0 mt-2 mb-4 text-center text-gray-300 font-bold sm:mb-12'>
            Gain comprehensive insight into your body composition
          </h1>
          <div className='grid grid-cols-3 '>
            <div className={`col-span-3 sm:col-span-2 text-center mt-6 ${showResults ? 'hidden' : 'visible'}`}>
              <h1 className='mb-4 text-3xl font-bold text-gray-300'>BMR: Basal Metabolic Rate</h1>
              <form onSubmit={onSubmit}>
                <div className='grid grid-cols-2 '>
                  <div className='mb-4'>
                    <label className='block text-gray-300 text-sm font-bold mb-2 cursor-pointer' htmlFor='gender'>
                      Gender
                    </label>
                    <select
                      className='w-3/4 h-3/2 p-2 text-2xl text-center border rounded-md bg-gray-900 text-gray-300 cursor-pointer'
                      id='gender'
                      name='gender'
                      onChange={e => handleGenderChange(e.target.value)}
                    >
                      <option value='' disabled selected hidden></option>

                      <option value='male'>Male</option>
                      <option value='female'>Female</option>
                    </select>
                    <div>
                      {/* Gender section with underline */}
                      <span
                        className='underline cursor-pointer text-gray-400 justify-left flex ml-16'
                        onClick={openModal}
                      >
                        Why only two genders?
                      </span>

                      {/* Modal component */}
                      <GenderExplanationModal isOpen={isModalOpen} onClose={closeModal} />
                    </div>
                  </div>

                  <div className='mb-4 row-start-2 row-end-3 '>
                    <label className='block text-gray-300 text-sm font-bold mb-2' htmlFor='weight'>
                      Weight (lb)
                    </label>
                    <input
                      className='w-3/4 h-3/2 p-2 text-2xl border rounded-md bg-gray-900 text-center text-gray-300 focus:outline-none focus:shadow-outline'
                      type='number'
                      inputMode='numeric'
                      pattern='/d*'
                      id='weight'
                      placeholder='Enter your weight'
                      value={weight}
                      onChange={(e: any) => handleNumberInputChange(e.target.value, setWeight)}
                    />
                  </div>

                  <div className='mb-4 row-start-2 row-end-3 '>
                    <label className='block text-gray-300 text-sm font-bold mb-2' htmlFor='height'>
                      Height (feet ' inches ")
                    </label>
                    <input
                      className='w-3/4 h-3/2 p-2 text-2xl border rounded-md bg-gray-900 text-center text-gray-300'
                      type='text'
                      id='height'
                      placeholder='Enter your height'
                      value={height}
                      onKeyDown={onFeetDown}
                      onChange={(e: any) => handleFeetInputChange(e.target.value, setHeight)}
                    />
                  </div>

                  <div className='mb-4 row-start-1 row-end-2 '>
                    <label className='block text-gray-300 text-sm font-bold mb-2' htmlFor='weight'>
                      Age
                    </label>
                    <input
                      className='w-3/4 h-3/2 p-2 text-2xl border rounded-md bg-gray-900 text-center text-gray-300'
                      type='number'
                      id='age'
                      placeholder='Enter your age'
                      value={age}
                      onChange={(e: any) => handleNumberInputChange(e.target.value, setAge)}
                    />
                  </div>
                </div>
                <div>
                  <div className='flex mt-16 h-full justify-center text-center items-center '>
                    <div className='bg-gray-500 hover-animation grid grid-cols-3 p-2 rounded-2xl text-right shadow-2xl mt-2 sm:w-full sm:max-w-4xl'>
                      <h1 className='col-span-2 text-left items-center justify-left flex text-gray-900 font-bold text-xl ml-24'>
                        Let's calculate your body metrics!
                      </h1>
                      <button
                        type='submit'
                        className=' bg-gray-200 col-span-1 sm:mb-0 mb-6 sm:mr-6 mr-0 text-gray-900 font-semibold py-4 px-6 text-xl rounded-2xl hover:bg-gray-300'
                      >
                        Calculate
                      </button>
                      {/* Add the ::before pseudo-element for the animation */}
                      <div className='before-hover-animation__before'></div>
                    </div>
                  </div>
                </div>
              </form>
            </div>

            <div
              className={`text-gray-300 font-bold sm:col-span-2 col-span-3 text-2xl ${
                showResults ? 'visible' : 'hidden'
              }`}
            >
              {showResults && (
                <>
                  <h1> Your Results </h1>
                  <div className='mt-4 text-black' id='result'>
                    <div className='flex items-center justify-center'>
                      <div className='bg-blue-100 shadow w-full 2xl:w-3/4 px-2 py-2 rounded-3xl sm:rounded-lg mt-2'>
                        <h3 className='text-base font-semibold leading-6 text-gray-800'>BMR </h3>
                        <div className='mt-2 sm:flex sm:items-start sm:justify-center'>
                          <div className='text-md text-gray-800 text-center'>
                            {bodyBMR !== null ? <p>{bodyBMR.toFixed(4)}%</p> : ''}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className='flex space-x-4 mt-5 text-sm h-full justify-center items-center'>
                      <button
                        type='submit'
                        className=' bg-red-600 text-white font-semibold py-2 px-4 rounded hover:bg-red-700'
                      >
                        Save Results
                      </button>
                      <button
                        type='submit'
                        onClick={handleGoBack}
                        className=' bg-blue-600 text-white font-semibold py-2 px-4 rounded hover:bg-blue-700'
                      >
                        Calculate Again
                      </button>
                    </div>
                    {/* {bodyFatCalc !== null ? <p>Your Body Fat is: {bodyFatCalc.toFixed(2)}%</p> : ''}
              {bodyFatMass !== null ? <p>Body Fat Mass is: {Math.round(bodyFatMass)} lbs</p> : ''}
              {bodyLeanMass !== null ? <p>Body Lean Mass is: {Math.round(bodyLeanMass)} lbs</p> : ''}
              {bodyBMI !== null ? <p>BMI: {bodyBMI.toFixed(2)}</p> : ''} */}
                  </div>
                </>
              )}
            </div>
            <div className='col-span-3 sm:col-span-1'>
              <div className='bg-gray-600 text-center mb-4 md:mb-6 p-4 md:p-8 rounded-2xl shadow-2xl mt-2'>
                <h1 className='mb-4 text-gray-300 font-bold text-xl md:text-2xl'>About BMR</h1>
                <div className='leading-6 text-left text-gray-300'>
                  BMR helps you understand your calories needs and goals regardless of if youre dieting. At a baseline,
                  knowing your BMR provides a caloric goal your body needs to perform basic functions. For example, a
                  BMR of 1,500 means you need to consume at least 1,500 calories to help your body work efficiently.
                  This knowledge is important if you plan to gain, lose or remain the same weight.
                </div>
                <div className='bg-gray-800 text-center p-4 md:p-6 rounded-lg shadow-2xl mt-4 md:mt-6'>
                  <h1 className='font-bold mb-2 text-lg md:text-xl'>Take the first step.</h1>
                  <p className='text-sm md:text-base'>
                    Sign up to start your journey! Track your progress and access personalized fitness and nutrition
                    advice.
                  </p>
                  <div className='bg-gray-300 text-center p-2 md:p-4 rounded-lg shadow-2xl mt-2'>
                    <button
                      type='button'
                      onClick={openSignUpModal}
                      className='text-gray-800 font-bold text-sm md:text-2xl'
                    >
                      Sign up
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* <div className='mt-4 text-black' id='result'>
          {bodyFatCalc !== null ? <p>Your Body Fat is: {bodyFatCalc.toFixed(2)}%</p> : ''}
          {bodyFatMass !== null ? <p>Body Fat Mass is: {Math.round(bodyFatMass)} lbs</p> : ''}
          {bodyLeanMass !== null ? <p>Body Lean Mass is: {Math.round(bodyLeanMass)} lbs</p> : ''}
          {bodyBMI !== null ? <p>BMI: {bodyBMI.toFixed(2)}</p> : ''}
        </div> */}
        </div>
        {/* <div className={showResults ? 'visible' : 'hidden'}>
          <div className='mx-auto max-w-7xl '>
            <div className='mt-4 mb-4 flex items-center justify-center'>
              <h2 className='text-2xl font-semibold tracking-tight text-gray-300 sm:text-4xl'>
                What Your Results May Mean
              </h2>
            </div>
            <div className='grid grid-cols-2 grid-rows-2 gap-8 sm:gap-12'>
              <div className='col-span-1 row-span-1'>
                <div className='mt-0 sm:mt-6 text-sm ml-4 sm:ml-0 sm:text-lg text-center text-gray-300'>
                  <p>
                    <strong>BMI (Body Mass Index):</strong>
                  </p>
                  <p>
                    A BMI range of 18.5 to 24.9 is considered healthy. The higher the BMI, the greater the risk of
                    developing or experiencing health problems. A BMI of 30 or higher may indicate obesity.
                  </p>
                </div>
              </div>
              <div className='col-span-1 row-span-1'>
                <div className='mt-0 sm:mt-6  mr-4 sm:mr-0 text-sm sm:text-lg sm:ml-0 text-center text-gray-300'>
                  <p>
                    <strong>Body Fat:</strong>
                  </p>
                  <p>
                    Body fat percentage is a measure of the amount of body fat compared to total body weight. Healthy
                    body fat percentages vary by age and gender.
                  </p>
                </div>
              </div>
              <div className='col-span-1 row-span-1'>
                <div className='mt-0 sm:mt-6 ml-4 text-sm sm:text-lg sm:ml-0 text-center text-gray-300'>
                  <p>
                    <strong>Fat Mass:</strong>
                  </p>
                  <p>
                    Fat mass refers to the total weight of fat in the body. Monitoring fat mass is essential for
                    assessing overall health and fitness levels.
                  </p>
                </div>
              </div>
              <div className='col-span-1 row-span-1'>
                <div className='mt-0 sm:mt-6  mr-4 text-sm sm:text-lg sm:mr-0 text-center text-gray-300'>
                  <p>
                    <strong>Lean Mass:</strong>
                  </p>
                  <p>
                    Lean mass is the weight of everything in the body except fat, including muscles, bones, organs, and
                    more. Maintaining a healthy balance of lean mass is crucial for overall well-being.
                  </p>
                </div>
              </div>
              <div className='col-span-2 sm:text-md text-md sm:ml-0 sm:mr-0 ml-4 mr-4 text-center mt-4 text-gray-300 '>
                <strong>
                  To learn more about the calculations used, look{' '}
                  <a href='/info' className='text-blue-500'>
                    here
                  </a>
                  .
                </strong>
              </div>
            </div>
          </div>
        </div> */}
        <div className='mb-4 mt-12 sm:text-6xl text-2xl font-bold text-gray-300'>
          <h1>More Calculators</h1>
        </div>
        <div className='flex grid-cols-2 text-white justify-center items-center text-center gap-24'>
          <div className='bg-gray-500 col-span-1 text-center mb-4 md:mb-6 p-4 md:p-8 rounded-2xl shadow-2xl mt-2 sm:max-w-lg sm:w-full'>
            <h1 className='mb-4 text-gray-300 font-bold text-xl md:text-2xl'>BMR calculator</h1>

            <div className='bg-gray-800 text-center p-4 md:p-6 rounded-lg shadow-2xl mt-4 md:mt-6'>
              {/* <h1 className='font-bold mb-2 text-lg md:text-xl'>Take the first step.</h1> */}
              <p className='text-sm md:text-base'>
                Your Basal Metabolic Rate (BMR) is the number of calories you burn as your body performs basic (basal)
                life-sustaining function. Commonly also termed as Resting Metabolic Rate (RMR), which is the calories
                burned if you stayed in bed all day.{' '}
              </p>
              <a type='button' href='/bmr' className='text-gray-800 font-bold w-3/4 text-sm md:text-2xl'>
                <button className='bg-gray-300 text-center w-full max-w-2xl p-2 md:p-4 rounded-lg shadow-2xl mt-2'>
                  Calculate
                </button>
              </a>
            </div>
          </div>
          <div className='bg-gray-500 col-span-1 text-center mb-4 md:mb-6 p-4 md:p-8 rounded-2xl shadow-2xl mt-2 sm:max-w-lg sm:w-full'>
            <h1 className='mb-4 text-gray-300 font-bold text-xl md:text-2xl'>Body Fat & BMI Calculator</h1>

            <div className='bg-gray-800 text-center p-4 md:p-6 rounded-lg shadow-2xl mt-4 md:mt-6'>
              {/* <h1 className='font-bold mb-2 text-lg md:text-xl'>Take the first step.</h1> */}
              <p className='text-sm md:text-base'>
                Body fat percentage is a key indicator of good health. A high body fat percentage may put you at a
                higher risk of lifestyle diseases. Males are advised to maintain their body fat level at 15% or lower,
                while females are advised to maintain their body fat level at 25% or lower.{' '}
              </p>
              <a type='button' href='/' className='text-gray-800 font-bold w-3/4 text-sm md:text-2xl'>
                <button className='bg-gray-300 text-center w-full max-w-2xl p-2 md:p-4 rounded-lg shadow-2xl mt-2'>
                  Calculate
                </button>
              </a>
            </div>
          </div>
        </div>

        <div>
          <div className='relative mt-12 '>
            <div className='absolute inset-0 flex items-center' aria-hidden='true'>
              <div className='w-full border-t border-gray-500' />
            </div>
          </div>
          {/* <h1 className='text-2xl text-center text-black font-bold mt-6 mb-4'>More Info</h1> */}
          <div className='mt-4 flex  '>
            <div className='lg:w-1/2 lg:max-w-screen-lg  lg:flex-auto'>
              <span className='text-sm text-center flex mt-2 mb-2 text-gray-300'>
                Created by Jacob Bailes <br />
                contact@jbailes.com
              </span>
            </div>
          </div>
        </div>
      </Panel>
    </motion.div>
  )
}

export default BmiCalculator
