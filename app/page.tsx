/* eslint-disable react/no-unescaped-entities */
'use client'
import React, { Fragment, useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { Chart as ChartJS, registerables } from 'chart.js'
import { motion } from 'framer-motion'
import SignUp from '@/components/SignUp'
import GenderExplanationModal from '@/components/genderModal'
import { getCurrentTokens, getUserDetails } from '@/utils/authService'
import { useIsLoggedIn, useUserDetails, useIsAdmin } from '@/hooks'
import { Panel } from '@/components/panel'
import { Button } from '@/components/button'
import GaugeChart from 'react-gauge-chart'
import { get } from 'http'
import { ClockIcon, ChartBarIcon, CalendarIcon } from '@heroicons/react/24/outline'

ChartJS.register(...registerables)
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

//ONLY ALLOW BACK SPACE, QUOTES, LEFT AND RIGHT ARROW KEYS
const VALID_KEYS = [8, 9, 37, 39, 222]

const BmiCalculator: React.FC = () => {
  const getWeeklyPlanApi = process.env.NEXT_PUBLIC_GET_WEEKLY_PLAN

  const isLoggedIn = useIsLoggedIn()
  const isAdmin = useIsAdmin()
  const userDetails = useUserDetails()
  const [weight, setWeight] = useState<number | undefined>(undefined)
  const [age, setAge] = useState<number | undefined>(undefined)
  const [neckMeasurement, setNeckMeasurement] = useState<number | undefined>(undefined)
  const [waistMeasurement, setWaistMeasurement] = useState<number | undefined>(undefined)
  const [hipMeasurement, setHipMeasurement] = useState<number | undefined>(undefined)
  const [weeklyPlan, setWeeklyPlan] = useState<WeeklyPlan | null>(null)

  const [gender, setGender] = useState<string | null>(null)
  const [height, setHeight] = useState<string | undefined>(undefined)
  const [bodyFatCalc, setBodyFatCalc] = useState<number | null>(null)
  const [bodyFatMass, setBodyFatMass] = useState<number | null>(null)
  const [bodyLeanMass, setBodyLeanMass] = useState<number | null>(null)
  const [bodyBMI, setBodyBMI] = useState<number | null>(null)
  const [bodyFatBMI, setBodyFatBMI] = useState<number | null>(null)
  const [bodyBMR, setBodyBMR] = useState<number | null>(null)
  const [showResults, setShowResults] = useState(false) // set to false
  const [bmi, setBmi] = useState<number | null>(null)
  const [fadeInUp, setFadeInUp] = useState({
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  })
  const [isSignUpOpen, setSignUpOpen] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false)

  useEffect(() => {
    if (isLoggedIn && userDetails?.username) {
      fetchActiveWeeklyPlan(userDetails.username)
    }
  }, [isLoggedIn, userDetails?.username]) // Re-run when login status or username changes
  const fetchActiveWeeklyPlan = async (username: any) => {
    const storedTokens = getCurrentTokens()

    // Check if the tokens or accessToken exist
    if (!storedTokens || !storedTokens.accessToken) {
      console.warn('User is not logged in or access token is missing.')
      return // Exit the function early
    }

    try {
      const userDetails = await getUserDetails(storedTokens.accessToken)
      const userId = userDetails?.username

      if (!getWeeklyPlanApi || !userId) {
        console.error('API endpoint or userId is not defined.')
        return
      }

      const response = await api.post(getWeeklyPlanApi, { userId })
      const plans = response.data.items // Assuming your response contains a list of plans

      // Find the plan that has isActive: true
      const activePlan = plans.find((plan: { isActive: any }) => plan.isActive)

      if (activePlan) {
        setWeeklyPlan(activePlan) // Store the active plan in state
        console.log(activePlan) // Log the active plan
      } else {
        console.warn('No active plan found.')
      }
    } catch (error) {
      console.error('Error fetching weekly plan:', error)
    }
  }

  useEffect(() => {
    // Only fetch if the API endpoint exists
    if (isLoggedIn && getWeeklyPlanApi) {
      fetchActiveWeeklyPlan(userDetails.username)
    }
  }, [isLoggedIn, getWeeklyPlanApi]) // Add getWeeklyPlanApi to the dependency array if it might change

  const openModal = () => {
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
  }

  const openSignUpModal = () => {
    setSignUpOpen(true)
  }

  const closeSignUpModal = () => {
    setSignUpOpen(false)
  }

  const handleGoBack = () => {
    // Set showResults to false when the "Go Back" button is clicked
    setShowResults(false)
  }

  const lambdaEndpoint = 'https://szo0py4yf5.execute-api.us-east-1.amazonaws.com/default/saveCalculationResults'

  const handleSave = async () => {
    try {
      const storedTokens = getCurrentTokens()

      if (!storedTokens || !storedTokens.accessToken) {
        console.error('Access token is missing for saving results.')
        return
      }

      const userDetails = await getUserDetails(storedTokens.accessToken)
      const userId = userDetails.username

      // Send a POST request to your Lambda f
      const response = await api.post(lambdaEndpoint, {
        userId,
        bodyFatCalc,
        bodyFatMass,
        bodyLeanMass,
        bodyBMI,
        bodyBMR,
      })
      // Display success message or handle response accordingly
      console.log('Response from Lambda:', response.data)
      alert('Results saved successfully!')
    } catch (error) {
      console.error('Error saving results:', error)
      alert('An error occurred while saving the results.')
    }
  }

  const handleNumberInputChange = (value: string, setter: (value: number | undefined) => void) => {
    if (!value) {
      setter(undefined)
    } else {
      setter(Number(value))
    }
  }

  const handleGenderInputChange = (value: string, setter: React.Dispatch<React.SetStateAction<string | null>>) => {
    setter(value || null) // Set to null if value is empty
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

  const getColorForExercise = (exerciseName: string) => {
    const colors = ['bg-red-200', 'bg-blue-200', 'bg-green-200', 'bg-yellow-200', 'bg-purple-200', 'bg-pink-200']
    let hash = 0
    for (let i = 0; i < exerciseName.length; i++) {
      hash = exerciseName.charCodeAt(i) + ((hash << 5) - hash)
    }
    return colors[Math.abs(hash) % colors.length]
  }

  const apiEndpoint = 'https://7c3u65ozgd.execute-api.us-east-1.amazonaws.com/default/calculations'

  const onSubmit = async (e: any) => {
    // send a POST request to apiEndpoint and pass in the weight, height, age, neck measurement, and waist measurement
    // and make sure that the variables arent empty

    e.preventDefault()

    if (weight && gender && height && age && neckMeasurement && waistMeasurement) {
      try {
        console.log('Sending data:', { weight, height, age, neckMeasurement, waistMeasurement, gender })

        const dataToSend: any = {
          weight,
          gender,
          height,
          age,
          neckMeasurement,
          waistMeasurement,
        }

        if (gender === 'female' && hipMeasurement !== undefined) {
          dataToSend.hipMeasurement = hipMeasurement
        }

        const response = await api.post(apiEndpoint, dataToSend)

        const data = response.data

        setBodyBMR(data.bodyBMR)
        setBodyFatCalc(data.bodyFatPercentage)
        setBodyFatMass(data.bodyFatMass)
        setBodyLeanMass(data.bodyLeanMass)
        setBodyBMI(data.bodyBMI)
        setBodyFatBMI(data.BMIFatPercentage)

        console.log('Response from API:', response.data)
      } catch (e: any) {
        if (e.response && e.response.data) {
          alert(e.response.data.error)
        } else {
          console.error(e)
          alert('An error occurred')
        }
      }
      setShowResults(true)
    } else {
      alert('Error: Fill in all fields to see calculation')
    }

    console.log('gender:' + gender)
    //test our values
    console.log(weight)
    console.log(height)
    console.log(age)
    console.log(neckMeasurement)
    console.log(waistMeasurement)
  }

  return (
    <motion.div initial='hidden' animate='visible' variants={fadeInUp}>
      <div className=' flex flex-col justify-center items-center min-h-screen overflow-x-hidden '>
        <div className='lg:grid lg:grid-cols-3 lg:px-12 px-4  space-x-8'>
          <Panel
            className={`text-center mb-6 p-4 md:p-12 mt-16 rounded-xl shadow-2xl col-span-2 ${
              showResults ? 'sm:w-full max-w-full' : 'sm:w-full max-w-screen-full'
            }`}
          >
            <h1 className='sm:text-3xl text-lg sm:mt-0 mt-2 mb-4 text-center text-gray-200 font-bold sm:mb-12'>
              Gain comprehensive insight into your body composition
            </h1>
            <div className='grid grid-cols-3 '>
              <div className={`col-span-3 sm:col-span-3 text-center mt-6 ${showResults ? 'hidden' : 'visible'}`}>
                <h1 className='mb-4 text-3xl font-bold text-gray-200'>Body Calculations</h1>
                <form onSubmit={onSubmit}>
                  <div className='grid grid-cols-2 '>
                    <div className='mb-4'>
                      <label className='block text-gray-400 text-sm font-bold mb-2 cursor-pointer' htmlFor='gender'>
                        Biological Sex
                      </label>
                      <select
                        className='w-3/4 h-3/2 p-2 text-2xl text-center border rounded-md bg-gray-900 text-gray-300 cursor-pointer'
                        id='gender'
                        value={gender || ''} // Ensure this matches the value attribute of <option>
                        name='gender'
                        onChange={e => handleGenderInputChange(e.target.value, setGender)}
                      >
                        <option value='' disabled selected hidden></option>

                        <option value='male'>Male</option>
                        <option value='female'>Female</option>
                      </select>
                      <div>
                        {/* Gender section with underline */}
                        <span
                          className='underline cursor-pointer text-gray-400 justify-left flex-center '
                          onClick={openModal}
                        >
                          More info
                        </span>

                        {/* Modal component */}
                        <GenderExplanationModal isOpen={isModalOpen} onClose={closeModal} />
                      </div>
                    </div>

                    <div className='mb-4 row-start-2 row-end-3 '>
                      <label className='block text-gray-400 text-sm font-bold mb-2' htmlFor='weight'>
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
                      <label className='block text-gray-400 text-sm font-bold mb-2' htmlFor='height'>
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
                      <label className='block text-gray-400 text-sm font-bold mb-2' htmlFor='weight'>
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

                    <div className='mb-4 row-start-3 row-end-3 '>
                      <label className='block text-gray-400 text-sm font-bold mb-2' htmlFor='weight'>
                        Neck Measurement (inches)
                      </label>
                      <input
                        className='w-3/4 h-3/2 p-2 text-2xl border rounded-md bg-gray-900 text-center text-gray-300'
                        type='number'
                        id='neckMeasurement'
                        placeholder='Circumference'
                        value={neckMeasurement}
                        onChange={(e: any) => handleNumberInputChange(e.target.value, setNeckMeasurement)}
                      />
                    </div>

                    <div className='mb-4 row-start-3 row-end-3 '>
                      <label className=' block text-gray-400 text-sm font-bold mb-2' htmlFor='weight'>
                        Waist Measurement (inches)
                      </label>
                      <input
                        className='w-3/4 h-3/2 p-2 text-2xl border rounded-md bg-gray-900 text-center text-gray-300'
                        type='number'
                        id='waistMeasurement'
                        placeholder='Circumference'
                        value={waistMeasurement}
                        onChange={(e: any) => handleNumberInputChange(e.target.value, setWaistMeasurement)}
                      />
                    </div>
                  </div>
                  {gender == 'female' && (
                    <div className='mb-4 row-start-3 row-end-3 '>
                      <label className=' block text-gray-400 text-sm font-bold mb-2' htmlFor='weight'>
                        Hip Measurement (inches)
                      </label>
                      <input
                        className='w-1/2 h-3/2 p-2 text-2xl border rounded-md bg-gray-900 text-center text-gray-300'
                        type='number'
                        id='waistMeasurement'
                        placeholder='Circumference'
                        value={hipMeasurement}
                        onChange={(e: any) => handleNumberInputChange(e.target.value, setHipMeasurement)}
                      />
                    </div>
                  )}

                  <div>
                    <div className='flex mt-16 h-full justify-center text-center items-center '>
                      <div className='bg-secondary-600 hover-animation grid grid-cols-3 p-2 rounded-2xl text-right shadow-sm mt-2 sm:w-full sm:max-w-4xl'>
                        <h1 className='col-span-2 text-left items-center justify-left flex text-gray-400 font-bold text-xl ml-24'>
                          Let's calculate your body metrics!
                        </h1>
                        <button
                          type='submit'
                          className=' bg-medium-purple-500 col-span-1 sm:mb-0 mb-6 sm:mr-6 mr-0 text-gray-200 font-semibold py-4 px-6 text-xl rounded-2xl hover:bg-medium-purple-600'
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
                className={`text-gray-300 font-bold sm:col-span-3 col-span-3 text-2xl ${
                  showResults ? 'visible' : 'hidden'
                }`}
              >
                {showResults && (
                  <>
                    <h1> Your Results </h1>
                    <div className='mt-4 text-black' id='result'>
                      <div className='flex items-center justify-center'>
                        <div className='bg-blue-100 shadow w-full 2xl:w-3/4 px-2 py-2 rounded-3xl sm:rounded-lg mt-2'>
                          <h3 className='text-base font-semibold leading-6 text-gray-800'>Body Fat</h3>
                          <div className='mt-2 sm:flex sm:items-start sm:justify-center'>
                            <div className='text-md text-gray-800 text-center'>
                              {bodyFatCalc !== null ? (
                                <>
                                  <p className='text-center'>{bodyFatCalc.toFixed(2)}</p>

                                  <div className='flex justify-center items-center text-center'>
                                    <div className=''>
                                      <GaugeChart
                                        id='gauge-chart1'
                                        percent={parseFloat(bodyFatCalc.toFixed(2)) / 40} // Normalize bodyBMI to fit within the range of 0 to 100
                                        nrOfLevels={30}
                                        arcsLength={[0.2, 0.6, 0.2]}
                                        colors={['#F5CD19', '#5BE12C', '#EA4228']}
                                        labels={['Low', 'Medium', 'High']}
                                        hideText
                                      />
                                    </div>
                                  </div>
                                </>
                              ) : (
                                ''
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className='flex items-center justify-center'>
                        <div className='bg-blue-100 shadow rounded-3xl w-full 2xl:w-3/4 sm:rounded-lg px-2 py-2 mt-6 '>
                          <h3 className='text-base font-semibold leading-6 text-gray-900'> BMI </h3>
                          <div className='mt-2 flex-row items-center justify-center'>
                            <h1 className='text-md text-gray-800'>
                              {bodyBMI !== null ? (
                                <>
                                  <p className='text-center'>{bodyBMI.toFixed(2)}</p>
                                  <div className='flex justify-center items-center text-center'>
                                    <div className='w-1/4'>
                                      <GaugeChart
                                        id='gauge-chart1'
                                        percent={parseFloat(bodyBMI.toFixed(2)) / 40} // Normalize bodyBMI to fit within the range of 0 to 100
                                        nrOfLevels={30}
                                        arcsLength={[0.2, 0.6, 0.2]}
                                        colors={['#F5CD19', '#5BE12C', '#EA4228']}
                                        labels={['Low', 'Medium', 'High']}
                                        hideText
                                      />
                                    </div>
                                  </div>
                                </>
                              ) : (
                                ''
                              )}
                            </h1>
                            <div
                              className='flex items-center justify-center mt-4 sm:mt-0 w-full 

                        '
                            ></div>
                          </div>
                        </div>
                      </div>

                      <div className='flex items-center justify-center'>
                        <div className='bg-blue-100 shadow rounded-3xl w-full 2xl:w-3/4 sm:rounded-lg px-2 py-2 mt-6'>
                          <h3 className='text-base font-semibold leading-6 text-gray-800'>Fat Mass</h3>
                          <div className='mt-2 sm:flex sm:items-start sm:justify-center'>
                            <div className='justify-center text-md text-gray-800 text-center flex-1'>
                              {bodyFatMass !== null ? <p>{Math.round(bodyFatMass)} lbs</p> : ''}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className='flex items-center justify-center'>
                        <div className='bg-blue-100 shadow rounded-3xl w-full 2xl:w-3/4 sm:rounded-lg px-2 py-2 mt-6'>
                          <h3 className='text-base font-semibold leading-6 text-gray-800'>BMR</h3>
                          <div className='mt-2 sm:flex sm:items-start sm:justify-center'>
                            <div className='justify-center text-md text-gray-800 text-center flex-1'>
                              {bodyBMR !== null ? <p>{Math.round(bodyBMR)} calories/day</p> : ''}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className='flex items-center justify-center'>
                        <div className='bg-blue-100 shadow rounded-3xl w-full 2xl:w-3/4 sm:rounded-lg px-2 py-2 mt-6'>
                          <h3 className='text-base font-semibold leading-6 text-gray-800'>Lean Mass</h3>
                          <div className='mt-2 sm:flex sm:items-start sm:justify-center'>
                            <div className='justify-center text-md text-gray-800 text-center flex-1'>
                              {bodyLeanMass !== null ? <p>{Math.round(bodyLeanMass)} lbs</p> : ''}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className='flex space-x-4 mt-5 text-sm h-full justify-center items-center'>
                        {isLoggedIn && (
                          <button
                            type='submit'
                            onClick={handleSave}
                            className=' bg-red-600 text-white font-semibold py-2 px-4 rounded hover:bg-red-700'
                          >
                            Save Results
                          </button>
                        )}
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
            </div>

            {/* <div className='mt-4 text-black' id='result'>
          {bodyFatCalc !== null ? <p>Your Body Fat is: {bodyFatCalc.toFixed(2)}%</p> : ''}
          {bodyFatMass !== null ? <p>Body Fat Mass is: {Math.round(bodyFatMass)} lbs</p> : ''}
          {bodyLeanMass !== null ? <p>Body Lean Mass is: {Math.round(bodyLeanMass)} lbs</p> : ''}
          {bodyBMI !== null ? <p>BMI: {bodyBMI.toFixed(2)}</p> : ''}
        </div> */}
          </Panel>
          {/* <div className='flex flex-col items-center justify-center '>
            {!isLoggedIn && (
              <div className='flex flex-col items-center justify-center '>
                {!isLoggedIn && !isAdmin && (
                  <Panel className='col-span-2 text-center mb-4 md:mb-6 p-4 md:p-8 rounded-2xl shadow-2xl mt-16 w-full h-full'>
                    {' '}
                    <p className='text-sm md:text-2xl'>
                      Welcome back, <span className='text-medium-purple-300'></span>
                    </p>
                  </Panel>
                )}
              </div>
            )}
          </div> */}

          <div className='flex flex-col items-center justify-center '>
            {isLoggedIn && !isAdmin && (
              <Panel className='col-span-2 text-center mb-4 md:mb-6 p-4 md:p-8 rounded-2xl shadow-2xl mt-16 w-full h-full'>
                {' '}
                <p className='text-sm text-gray-200 md:text-2xl'>
                  Welcome back, <span className='text-medium-purple-300'>{userDetails.nickname}</span>
                </p>
              </Panel>
            )}
            {!isLoggedIn && !isAdmin && (
              <Panel className='!bg-medium-purple-500 col-span-2 flex flex-col justify-center items-center text-center md:mb-6 p-4 md:p-8 rounded-2xl shadow-2xl mt-16 w-full h-full'>
                <div className='leading-tight mb-3'>
                  <div className='font-bold text-lg md:text-3xl text-white leading-tight'>Take the first step.</div>
                  <div className='text-md md:text-base font-medium text-md text-white/80'>
                    Sign up to start your journey!
                  </div>
                </div>

                <div className='text-md md:text-base text-white font-medium mb-3'>
                  Start easily tracking your progress and access personalized fitness and nutrition advice.
                </div>

                {/* <div className='bg-medium-purple-500  text-center p-2 md:p-4 rounded-lg shadow-2xl mt-6'> */}
                <Button
                  onClick={openSignUpModal}
                  rounded
                  className=' text-white font-bold bg-secondary-800 hover:bg-secondary-600 shadow-md text-lg px-4'
                >
                  Sign up
                </Button>
                {/* </div> */}
              </Panel>
            )}
            {isSignUpOpen && <SignUp onClose={() => setSignUpOpen(false)} />}
            {isAdmin && (
              <Panel className='col-span-2 text-center mb-4 md:mb-6 p-4 md:p-8 rounded-2xl shadow-2xl mt-16 w-full h-full'>
                {' '}
                <p className='text-sm md:text-2xl'>
                  Administrator: <span className='text-medium-purple-300'>{userDetails.nickname}</span>
                </p>
              </Panel>
            )}

            <Panel className='text-center mb-4 md:mb-6 p-4 md:p-8 rounded-2xl shadow-2xl  w-full h-full'>
              <h1 className='mb-4 text-gray-200 font-bold text-xl md:text-2xl'>
                Unlock insights into your body composition.
              </h1>
              <div className='leading-6 text-left font-bold  text-gray-400 '>
                <p>
                  <strong className='text-medium-purple-300'>BMI (Body Mass Index):</strong> This standardized measure
                  is based on your weight and height, providing an indication of your overall body fatness.
                </p>
                <p>
                  <strong className='text-medium-purple-300'>Body Fat Percentage:</strong> This measurement reveals the
                  proportion of fat to your total body weight, helping you understand your body's composition more
                  deeply.
                </p>
                <p>
                  <strong className='text-medium-purple-300'>Lean Mass:</strong> Your lean mass represents the weight of
                  everything in your body except for fat, encompassing muscle, bones, and organs. Understanding your
                  lean mass can guide muscle-building efforts and overall body composition goals.
                </p>
                <p>
                  <strong className='text-medium-purple-300'>Fat Mass:</strong> This measurement indicates the weight of
                  your body fat specifically, providing insights into your body fat distribution and overall health.
                </p>
                <p>
                  <strong className='text-medium-purple-300'>BMR (Basal Metabolic Rate):</strong> BMR reflects the
                  energy required to keep your body functioning at a state of rest and is influenced by factors. BMR can
                  help you determine your daily caloric needs and create an effective diet or fitness plan.
                </p>
              </div>
            </Panel>
          </div>
        </div>

        <div className={showResults ? 'visible' : 'hidden'}>
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
        </div>
        <div className='w-full'>
          {isLoggedIn && (
            <Panel className='mx-10 rounded-xl mb-12 shadow-2xl mt-8 justify-between'>
              <div className='mb-6 mt-4 sm:text-5xl text-2xl font-bold text-center text-gray-200'>
                <h1>My Weekly Plan</h1>
              </div>
              <div className='p-4'>
                {weeklyPlan ? (
                  <>
                    <h1 className='bg-medium-purple-500 text-gray-100 font-semibold p-3 rounded-lg text-center mx-auto mb-2'>
                      Current Weekly Plan:{' '}
                      <span className='text-yellow-400'>{weeklyPlan.planName || 'Unnamed Plan'}</span>
                    </h1>

                    <div className='bg-secondary-200 p-4 mb-4 rounded-lg shadow-md'>
                      <div className='grid grid-cols-7 gap-2 w-full'>
                        {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                          <div
                            key={day}
                            className='border p-2 rounded-md bg-white shadow-sm h-24 sm:h-32 md:h-40 lg:h-48 xl:h-56'
                          >
                            <h4 className='font-medium'>{day}</h4>
                            <div className='flex flex-wrap gap-2'>
                              {weeklyPlan[day]?.map((exercise, index) => (
                                <span
                                  key={index}
                                  className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${getColorForExercise(
                                    exercise
                                  )} text-gray-700`}
                                >
                                  {exercise}
                                </span>
                              )) || <span className='text-sm text-gray-500'>No exercises</span>}
                            </div>
                          </div>
                        ))}
                      </div>
                      <h3 className='text-sm text-gray-200 font-semibold mt-2'>Created on {weeklyPlan.timestamp}</h3>
                    </div>
                  </>
                ) : (
                  <p className='text-gray-200 font-semibold text-lg justify-center text-center items-center'>
                    No plans found. Go create a plan or make one active.
                  </p>
                )}
              </div>
            </Panel>
          )}
        </div>

        {!isLoggedIn && (
          <Panel className='mx-10 rounded-xl mb-12 shadow-2xl mt-8 justify-between'>
            <div className='p-6'>
              <h1 className='text-4xl font-extrabold text-center text-gray-100 mb-12'>Explore Our Features</h1>
              <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8'>
                <div className='bg-gray-800 p-8 rounded-xl shadow-lg hover:bg-gray-900 transition-colors duration-300'>
                  <div className='flex justify-center space-x-4 '>
                    <ClockIcon className='h-10 w-10  text-gray-300 mb-4' />
                    <h2 className='text-2xl font-bold  text-gray-100 mb-4'>Track Your Exercises</h2>
                  </div>
                  <p className='text-medium-purple-300 font-medium w-3/4 mx-auto'>
                    Monitor your workouts and log your exercises to keep track of your progress.
                  </p>
                </div>

                <div className='bg-gray-800 p-8 rounded-xl shadow-lg hover:bg-gray-900 transition-colors duration-300'>
                  <div className='flex justify-center space-x-4 '>
                    <ChartBarIcon className='h-10 w-10  text-gray-300 mb-4' />
                    <h2 className='text-2xl font-bold text-gray-100 mb-4'>Monitor Body Metrics</h2>
                  </div>
                  <p className='text-medium-purple-300 font-medium w-3/4 mx-auto'>
                    Keep track of your body metrics and weight loss journey with detailed reports and analytics.
                  </p>
                </div>

                <div className='bg-gray-800 p-8 rounded-xl shadow-lg hover:bg-gray-900 transition-colors duration-300'>
                  <div className='flex justify-center space-x-4 '>
                    <CalendarIcon className='h-10 w-10 text-gray-300 mb-4' />
                    <h2 className='text-2xl font-bold text-gray-100 mb-4'>Make Weekly Workout Plans</h2>
                  </div>
                  <p className='text-medium-purple-300 font-medium w-3/4 mx-auto'>
                    Create and customize your weekly workout plans to stay organized and motivated.
                  </p>
                </div>
              </div>
            </div>
          </Panel>
        )}
      </div>

      <footer className='bg-secondary-800 flex flex-col items-center justify-center  text-center text-gray-300 py-4'>
        <div className='container mx-auto px-4 items-center flex flex-col justify-center text-center'>
          <div className='flex flex-wrap space-x-36 *:justify-between text-center items-center'>
            <div className='w-full md:w-1/3 mb-4 md:mb-0 h-full'>
              <h3 className='text-lg font-bold mb-2'>Contact</h3>
              <div className='flex flex-col items-center'>
                <i className='far fa-envelope mb-2'></i>
                <a href='mailto:contact@jbailes.com' className='text-gray-300 hover:text-gray-100'>
                  contact@jbailes.com
                </a>
              </div>
            </div>
            <div className='w-full md:w-1/3 mb-4 md:mb-0 h-full'>
              <h3 className='text-lg font-bold mb-2'>Follow</h3>
              <div className='flex flex-row  justify-center text-center items-center space-x-8'>
                <a
                  href='https://www.linkedin.com/in/jbailes01/'
                  className='text-gray-300 hover:text-gray-100'
                  target='_blank'
                  rel='noopener noreferrer'
                >
                  <i className='fab fa-linkedin'></i> LinkedIn
                </a>
                <a
                  href='https://jbailes.com'
                  className='text-gray-300 hover:text-gray-100'
                  target='_blank'
                  rel='noopener noreferrer'
                >
                  <i className='fas fa-globe'></i> jbailes.com
                </a>
              </div>
            </div>
          </div>

          <hr className='my-6 border-gray-700' />
          <div className='text-center text-sm'>
            <p>&copy; 2024 FitXpress. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </motion.div>
  )
}

export default BmiCalculator
