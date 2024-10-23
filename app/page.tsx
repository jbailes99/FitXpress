'use client'
import React, { Fragment, useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { Chart as ChartJS, registerables } from 'chart.js'
import { motion, AnimatePresence } from 'framer-motion'
import SignUp from '@/components/SignUp'
import GenderExplanationModal from '@/components/genderModal'
import { getCurrentTokens, getUserDetails } from '@/utils/authService'
import { useIsLoggedIn, useUserDetails, useIsAdmin } from '@/hooks'
import { Panel } from '@/components/panel'
import GaugeChart from 'react-gauge-chart'
import { ClockIcon, ChartBarIcon, CalendarIcon } from '@heroicons/react/24/outline'
import { Button } from '@material-tailwind/react/components/Button'
import { Input } from './theme'
import { Select, Option } from './theme'
import { Card } from '@material-tailwind/react/components/Card'
import { Spinner } from '@material-tailwind/react'
import { Alert } from '@material-tailwind/react'
import { Typography } from '@material-tailwind/react'
import Footer from '@/components/footer'
import { Tooltip } from '@material-tailwind/react'
import { FaQuestionCircle } from 'react-icons/fa' // Importing from react-icons/fa
import Loading from '@/components/Loading'
import Link from 'next/link'

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
  const [dailyExercises, setDailyExercises] = useState<string[]>([])
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)
  const [loader, setLoader] = useState(false)
  const [showAlert, setShowAlert] = useState(false)
  const [alertMessage, setAlertMessage] = useState('')
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

  useEffect(() => {
    if (userDetails) {
      setWeight(userDetails.weight)
      setAge(userDetails.age)
      setGender(userDetails.sex || null)
      setHeight(userDetails.height)
    }
  }, [userDetails])

  const fetchActiveWeeklyPlan = async (username: any) => {
    const storedTokens = getCurrentTokens()

    if (!storedTokens || !storedTokens.accessToken) {
      console.warn('User is not logged in or access token is missing.')
      return
    }

    try {
      const userDetails = await getUserDetails(storedTokens.accessToken)
      const userId = userDetails?.username

      if (!getWeeklyPlanApi || !userId) {
        console.error('API endpoint or userId is not defined.')
        return
      }

      const response = await api.post(getWeeklyPlanApi, { userId })
      const plans = response.data.items

      const activePlan = plans.find((plan: { isActive: any }) => plan.isActive)

      if (activePlan) {
        setWeeklyPlan(activePlan) // Store the active plan in state
        updateDailyExercises(activePlan) // Update daily exercises
      } else {
        console.warn('No active plan found.')
      }
    } catch (error) {
      console.error('Error fetching weekly plan:', error)
    }
  }

  const updateDailyExercises = (plan: any) => {
    const today = new Date().toLocaleString('en-US', { weekday: 'long' })
    const exercisesForToday = plan[today] || []
    setDailyExercises(exercisesForToday)
  }

  useEffect(() => {
    if (isLoggedIn && getWeeklyPlanApi) {
      fetchActiveWeeklyPlan(userDetails.username)
    }
  }, [isLoggedIn, getWeeklyPlanApi])

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

  const lambdaEndpoint =
    'https://szo0py4yf5.execute-api.us-east-1.amazonaws.com/default/saveCalculationResults'

  const handleSave = async () => {
    setLoader(true)
    setShowAlert(false)
    setShowSuccessMessage(false)
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
        weight,
        bodyFatCalc,
        bodyFatMass,
        bodyLeanMass,
        bodyBMI,
        bodyBMR,
      })
      // Display success message or handle response accordingly
      console.log('Response from Lambda:', response.data)
      setShowSuccessMessage(true)
    } catch (error) {
      console.error('Error saving results:', error)
      alert('An error occurred while saving the results.')
      setShowAlert(true)
    }
    setLoader(false)
  }

  const handleNumberInputChange = (value: string, setter: (value: number | undefined) => void) => {
    if (!value) {
      setter(undefined)
    } else {
      setter(Number(value))
    }
  }
  const showAlertMessage = (message: string) => {
    setShowAlert(true)
    setAlertMessage(message)
    setTimeout(() => setShowAlert(false), 3000) // Hide alert after 3 seconds
  }

  const handleGenderInputChange = (
    value: string,
    setter: React.Dispatch<React.SetStateAction<string | null>>
  ) => {
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

  const apiEndpoint = 'https://7c3u65ozgd.execute-api.us-east-1.amazonaws.com/default/calculations'

  const onSubmit = async (e: any) => {
    // send a POST request to apiEndpoint and pass in the weight, height, age, neck measurement, and waist measurement
    // and make sure that the variables arent empty

    e.preventDefault()
    if (weight && gender && height && age && neckMeasurement && waistMeasurement) {
      try {
        console.log('Sending data:', {
          weight,
          height,
          age,
          neckMeasurement,
          waistMeasurement,
          gender,
        })

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
          showAlertMessage('An error occurred')
        }
      }
      setShowResults(true)
    } else {
      showAlertMessage('Error: Fill in all fields to see calculation')
    }
  }
  const currentDay = new Date().toLocaleString('en-US', { weekday: 'long' })

  return (
    <motion.div initial="hidden" animate="visible" variants={fadeInUp}>
      {isLoggedIn && !isAdmin ? (
        <Panel className="text-center mx-4 mt-4 rounded-2xl shadow-2xl  sm:hidden block">
          <p className="text-md md:text-lg lg:text-2xl text-gray-200 ">
            Welcome back, <span className="text-medium-purple-300">{userDetails.nickname}</span>
          </p>
          {weeklyPlan && (
            <div className="mt-6 md:mt-8 p-4 md:p-6">
              <div className="flex items-center mb-4">
                <h1 className="text-xl md:text-2xl font-bold text-gray-100">
                  Today&apos;s Exercises
                </h1>
              </div>
              <ul className="mt-4 space-y-2">
                {dailyExercises.length > 0 ? (
                  dailyExercises.map((exercise, index) => (
                    <li
                      key={index}
                      className="flex items-center bg-medium-purple-500 w-full md:w-3/4 p-3 rounded-md shadow-md sm:mx-0 mx-auto"
                    >
                      <svg
                        className="w-4 h-4 md:w-5 md:h-5 text-green-300 mr-2 md:mr-3"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      <span className="text-xs md:text-sm text-gray-200 font-semibold">
                        {exercise}
                      </span>
                    </li>
                  ))
                ) : (
                  <li className="text-gray-400 text-left">No exercises for today.</li>
                )}
              </ul>
            </div>
          )}
        </Panel>
      ) : null}
      <div className=" flex flex-col justify-center items-center min-h-screen overflow-x-hidden ">
        <div className="w-full lg:grid lg:grid-cols-3 lg:px-12 px-4  lg:space-x-8 lg:space-y-0">
          <div className="col-span-2 ">
            <Card
              shadow={true}
              className={`text-center  sm:mt-16  mt-6 outline outline-medium-purple-500  bg-secondary-400 rounded-xl ${
                showResults ? 'sm:w-full max-w-full' : 'sm:w-full max-w-screen-full'
              }`}
            >
              <div className="flex items-center justify-center rounded-tr-xl rounded-tl-xl h-16 bg-medium-purple-500 text-gray-200">
                <Typography variant="h5" className="sm:text-2xl text-2xl font-bold">
                  Body Composition Calculator
                </Typography>
              </div>
              <div className="my-auto mt-4">
                <Typography variant="h1" color="white" className="text-2xl mt-4 font-bold">
                  Gain comprehensive insight into your body composition
                </Typography>
              </div>
              <div className="py-12">
                <div className="mx-12 ">
                  <div
                    className={`col-span-3 sm:col-span-3 text-center mt-6 ${
                      showResults ? 'hidden' : 'visible'
                    }`}
                  >
                    <form onSubmit={onSubmit}>
                      <div className="space-y-10">
                        <div className="xl:flex xl:space-x-4 xl:space-y-0 space-y-10">
                          <div className="flex-1">
                            <Input
                              label="Age"
                              color="purple"
                              type="number"
                              id="age"
                              className="placeholder-gray-400 placeholder-opacity-50 h-14"
                              value={age}
                              autoComplete="off"
                              onChange={(e: any) => handleNumberInputChange(e.target.value, setAge)}
                              crossOrigin={undefined}
                            />
                          </div>
                          <div className="flex-1 flex-col space-y-7">
                            <div className="">
                              <Select
                                color="purple"
                                label="Select Gender"
                                className="h-14"
                                id="gender"
                                value={gender || ''}
                                name="gender"
                                onChange={(value) =>
                                  handleGenderInputChange(value as string, setGender)
                                }
                              >
                                <Option value="male">Male</Option>
                                <Option value="female">Female</Option>
                              </Select>
                              <div className="mt-4">
                                <span
                                  className="underline text-xs cursor-pointer text-medium-purple-500 hover:text-medium-purple-200  "
                                  onClick={openModal}
                                >
                                  More info
                                </span>

                                <GenderExplanationModal isOpen={isModalOpen} onClose={closeModal} />
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="xl:flex xl:space-x-4 xl:space-y-0 space-y-10">
                          <div className="flex-1 ">
                            <div className="relative w-full">
                              <Input
                                color="purple"
                                label="Weight (lb)"
                                type="number"
                                id="weight"
                                className="placeholder-gray-400 placeholder-opacity-50 h-14 pr-10" // Add padding-right to make space for the icon
                                value={weight}
                                autoComplete="off"
                                onChange={(e: any) =>
                                  handleNumberInputChange(e.target.value, setWeight)
                                }
                                crossOrigin={undefined}
                              />
                              <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                                {isLoggedIn && (
                                  <Tooltip
                                    className="bg-medium-purple-500"
                                    content={
                                      <div className="w-80">
                                        <Typography color="white" className="font-medium">
                                          Weight Changes
                                        </Typography>
                                        <Typography
                                          variant="small"
                                          color="white"
                                          className="font-normal opacity-80"
                                        >
                                          To change your weight, go to profile and weigh in.
                                        </Typography>
                                      </div>
                                    }
                                  >
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      fill="none"
                                      viewBox="0 0 24 24"
                                      stroke="currentColor"
                                      strokeWidth={2}
                                      className="h-5 w-5 cursor-pointer text-medium-purple-500"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z"
                                      />
                                    </svg>
                                  </Tooltip>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex-1 ">
                            <Input
                              color="purple"
                              label="Height"
                              type="text"
                              id="height"
                              placeholder="example...5'11"
                              value={height}
                              autoComplete="off"
                              onKeyDown={onFeetDown}
                              onChange={(e: any) =>
                                handleFeetInputChange(e.target.value, setHeight)
                              }
                              className="placeholder-gray-400 placeholder-opacity-50 h-14"
                              crossOrigin={undefined}
                            />
                          </div>
                        </div>
                        <div className="xl:flex xl:space-x-4 xl:space-y-0 space-y-10">
                          <div className="flex-1">
                            <Input
                              size="lg"
                              color="purple"
                              label="Neck Measurement"
                              type="number"
                              id="neckMeasurement"
                              value={neckMeasurement}
                              className="placeholder-gray-400 placeholder-opacity-50 h-14"
                              placeholder="in inches"
                              autoComplete="off"
                              onChange={(e: any) =>
                                handleNumberInputChange(e.target.value, setNeckMeasurement)
                              }
                              crossOrigin={undefined}
                            />
                          </div>

                          <div className="flex-1 ">
                            <Input
                              label="Waist Measurement"
                              size="lg"
                              color="purple"
                              type="number"
                              id="waistMeasurement"
                              value={waistMeasurement}
                              className="placeholder-gray-400 placeholder-opacity-50 h-14"
                              placeholder="in inches"
                              autoComplete="off"
                              onChange={(e: any) =>
                                handleNumberInputChange(e.target.value, setWaistMeasurement)
                              }
                              crossOrigin={undefined}
                            />
                          </div>
                          {gender == 'female' && (
                            <div className=" flex-1 ">
                              <Input
                                size="lg"
                                color="purple"
                                label="Hip Measurement"
                                type="number"
                                id="waistMeasurement"
                                placeholder="Circumference"
                                className="placeholder-gray-400 placeholder-opacity-50 h-14"
                                value={hipMeasurement}
                                autoComplete="off"
                                onChange={(e: any) =>
                                  handleNumberInputChange(e.target.value, setHipMeasurement)
                                }
                                crossOrigin={undefined}
                              />
                            </div>
                          )}
                        </div>
                      </div>

                      <div>
                        <div className="flex mt-12 h-full justify-center items-center px-4">
                          <Button
                            type="submit"
                            size="lg"
                            variant="gradient"
                            color="purple"
                            className="h-16"
                          >
                            Calculate
                          </Button>
                          <AnimatePresence>
                            {showAlert && (
                              <motion.div
                                initial={{ opacity: 0, y: -50 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -50 }}
                                transition={{ duration: 0.3 }}
                                className="fixed top-4 left-3/4 transform -translate-x-1/2 z-50"
                              >
                                <Alert color="red" className="bg-opacity-75">
                                  {alertMessage}
                                </Alert>
                              </motion.div>
                            )}
                          </AnimatePresence>
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
                        <div className="mt-4 text-black" id="result">
                          <div className="flex items-center justify-center">
                            <div className="bg-blue-100 shadow w-full 2xl:w-3/4 px-2 py-2 rounded-3xl sm:rounded-lg mt-2">
                              <h3 className="text-base font-semibold leading-6 text-gray-800">
                                Body Fat
                              </h3>
                              <div className="mt-2 sm:flex sm:items-start sm:justify-center">
                                <div className="text-md text-gray-800 text-center">
                                  {bodyFatCalc !== null ? (
                                    <>
                                      <p className="text-center">{bodyFatCalc.toFixed(2)}</p>

                                      <div className="flex justify-center items-center text-center">
                                        <div className="">
                                          <GaugeChart
                                            id="gauge-chart1"
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
                          <div className="flex items-center justify-center">
                            <div className="bg-blue-100 shadow rounded-3xl w-full 2xl:w-3/4 sm:rounded-lg px-2 py-2 mt-6 ">
                              <h3 className="text-base font-semibold leading-6 text-gray-900">
                                {' '}
                                BMI{' '}
                              </h3>
                              <div className="mt-2 flex-row items-center justify-center">
                                <h1 className="text-md text-gray-800">
                                  {bodyBMI !== null ? (
                                    <>
                                      <p className="text-center">{bodyBMI.toFixed(2)}</p>
                                      <div className="flex justify-center items-center text-center">
                                        <div className="w-1/4">
                                          <GaugeChart
                                            id="gauge-chart1"
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
                                  className="flex items-center justify-center mt-4 sm:mt-0 w-full 

                        "
                                ></div>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center justify-center">
                            <div className="bg-blue-100 shadow rounded-3xl w-full 2xl:w-3/4 sm:rounded-lg px-2 py-2 mt-6">
                              <h3 className="text-base font-semibold leading-6 text-gray-800">
                                Fat Mass
                              </h3>
                              <div className="mt-2 sm:flex sm:items-start sm:justify-center">
                                <div className="justify-center text-md text-gray-800 text-center flex-1">
                                  {bodyFatMass !== null ? <p>{Math.round(bodyFatMass)} lbs</p> : ''}
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center justify-center">
                            <div className="bg-blue-100 shadow rounded-3xl w-full 2xl:w-3/4 sm:rounded-lg px-2 py-2 mt-6">
                              <h3 className="text-base font-semibold leading-6 text-gray-800">
                                BMR
                              </h3>
                              <div className="mt-2 sm:flex sm:items-start sm:justify-center">
                                <div className="justify-center text-md text-gray-800 text-center flex-1">
                                  {bodyBMR !== null ? (
                                    <p>{Math.round(bodyBMR)} calories/day</p>
                                  ) : (
                                    ''
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center justify-center">
                            <div className="bg-blue-100 shadow rounded-3xl w-full 2xl:w-3/4 sm:rounded-lg px-2 py-2 mt-6">
                              <h3 className="text-base font-semibold leading-6 text-gray-800">
                                Lean Mass
                              </h3>
                              <div className="mt-2 sm:flex sm:items-start sm:justify-center">
                                <div className="justify-center text-md text-gray-800 text-center flex-1">
                                  {bodyLeanMass !== null ? (
                                    <p>{Math.round(bodyLeanMass)} lbs</p>
                                  ) : (
                                    ''
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="flex mt-5 text-sm h-full justify-center items-center">
                            {isLoggedIn && (
                              <button
                                type="submit"
                                onClick={handleSave}
                                className=" bg-red-600 mr-2 text-white font-semibold py-2 px-4 rounded hover:bg-red-700"
                              >
                                Save Results
                              </button>
                            )}
                            <button
                              type="submit"
                              onClick={handleGoBack}
                              className=" bg-blue-600 ml-2 text-white font-semibold py-2 px-4 rounded hover:bg-blue-700"
                            >
                              Calculate Again
                            </button>
                          </div>
                          <div className="flex items-center justify-center">
                            {showSuccessMessage && (
                              <p className="text-green-500 text-sm mt-2">
                                Successfully saved results
                              </p>
                            )}
                            {loader && (
                              <div className="flex items-center mt-2 justify-center">
                                <Spinner
                                  className="h-8 w-8 text-purple-500"
                                  onPointerEnterCapture={undefined}
                                  onPointerLeaveCapture={undefined}
                                />{' '}
                              </div>
                            )}
                            {showAlert && (
                              <Alert color="red">
                                <span>error</span>
                              </Alert>
                            )}
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
              </div>

              {/* <div className='mt-4 text-black' id='result'>
          {bodyFatCalc !== null ? <p>Your Body Fat is: {bodyFatCalc.toFixed(2)}%</p> : ''}
          {bodyFatMass !== null ? <p>Body Fat Mass is: {Math.round(bodyFatMass)} lbs</p> : ''}
          {bodyLeanMass !== null ? <p>Body Lean Mass is: {Math.round(bodyLeanMass)} lbs</p> : ''}
          {bodyBMI !== null ? <p>BMI: {bodyBMI.toFixed(2)}</p> : ''}
        </div> */}
            </Card>
          </div>

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

          <div className="flex flex-col items-center justify-center ">
            {isLoggedIn && !isAdmin && (
              <Panel className="col-span-2 text-center mb-4 md:mb-6 p-4 md:p-6 rounded-2xl shadow-2xl mt-8 md:mt-16 w-full h-full sm:block hidden">
                <p className="text-md md:text-lg lg:text-2xl text-gray-200 ">
                  Welcome back,{' '}
                  <span className="text-medium-purple-300">{userDetails.nickname}</span>
                </p>
                {weeklyPlan && (
                  <div className="mt-6 md:mt-8 p-4 md:p-6">
                    <div className="flex items-center mb-4">
                      <h1 className="text-xl md:text-2xl font-bold text-gray-100">
                        Today&apos;s Exercises
                      </h1>
                    </div>
                    <ul className="mt-4 space-y-2">
                      {dailyExercises.length > 0 ? (
                        dailyExercises.map((exercise, index) => (
                          <li
                            key={index}
                            className="flex items-center bg-medium-purple-500 w-full md:w-3/4 p-3 rounded-md shadow-md sm:mx-0 mx-auto"
                          >
                            <svg
                              className="w-4 h-4 md:w-5 md:h-5 text-green-300 mr-2 md:mr-3"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                            <span className="text-xs md:text-sm text-gray-200 font-semibold">
                              {exercise}
                            </span>
                          </li>
                        ))
                      ) : (
                        <li className="text-gray-400">No exercises for today.</li>
                      )}
                    </ul>
                  </div>
                )}
              </Panel>
            )}

            {!isLoggedIn && !isAdmin && (
              <Panel className="!bg-medium-purple-500 col-span-2 flex flex-col justify-center items-center text-center md:mb-6 p-4 md:p-6 rounded-2xl shadow-2xl mt-8 md:mt-16 w-full h-auto">
                <div className="leading-tight mb-3">
                  <div className="font-bold text-xl md:text-3xl text-white leading-tight">
                    Take the first step.
                  </div>
                  <div className="text-sm md:text-base font-medium text-white/80">
                    Sign up to start your journey!
                  </div>
                </div>
                <div className="text-sm md:text-base text-white font-medium mb-3">
                  Start easily tracking your progress and access personalized fitness and nutrition
                  advice.
                </div>
                <Button
                  onClick={openSignUpModal}
                  className="text-white font-bold bg-secondary-800 hover:bg-secondary-600 rounded-md shadow-md text-lg px-4"
                >
                  Sign up
                </Button>
              </Panel>
            )}

            {isSignUpOpen && <SignUp onClose={() => setSignUpOpen(false)} />}

            {isAdmin && (
              <Panel className="col-span-2 text-center mb-4 md:mb-6 p-4 md:p-6 rounded-2xl shadow-2xl mt-8 md:mt-16 w-full h-auto">
                <p className="text-xs md:text-lg">
                  Administrator:{' '}
                  <span className="text-medium-purple-300">{userDetails.nickname}</span>
                </p>
              </Panel>
            )}

            <Panel className="text-center mb-4 md:mb-6 p-4 mt-10 sm:mt-0 md:p-6 rounded-2xl shadow-2xl w-full h-auto">
              <h1 className="mb-4 text-gray-200 font-bold text-xl sm:text-2xl">
                Unlock insights into your body composition.
              </h1>
              <div className="leading-6 text-left text-sm sm:text-base space-y-2">
                <div className="flex-col flex text-left ">
                  <span className="text-gray-200">
                    <strong className="text-medium-purple-300">BMI (Body Mass Index):</strong>
                  </span>
                  <span className="text-gray-200">
                    Uses your height and weight to indicate body wellness.
                  </span>
                </div>
                <div className="flex-col flex text-left">
                  <span className="text-gray-200">
                    <strong className="text-medium-purple-300">Body Fat Percentage:</strong>
                  </span>
                  <span className="text-gray-200">The proportion of fat to your body weight.</span>
                </div>
                <div className="flex-col flex text-left">
                  <span className="text-gray-200">
                    <strong className="text-medium-purple-300">Lean Mass:</strong>
                  </span>
                  <span className="text-gray-200">
                    Represents the weight of everything in your body except for fat.
                  </span>
                </div>
                <div className="flex-col flex text-left">
                  <span className="text-gray-200">
                    <strong className="text-medium-purple-300">Fat Mass:</strong>
                  </span>
                  <span className="text-gray-200">Indicates the weight of your body fat.</span>
                </div>
                <div className="flex-col flex text-left">
                  <span className="text-gray-200">
                    <strong className="text-medium-purple-300">BMR (Basal Metabolic Rate):</strong>
                  </span>
                  <span className="text-gray-200">
                    Helps you determine your daily caloric needs.
                  </span>
                </div>
              </div>
            </Panel>
          </div>
        </div>

        <div className={showResults ? 'visible' : 'hidden'}>
          <div className="mx-auto max-w-7xl ">
            <div className="mt-4 mb-4 flex items-center justify-center">
              <h2 className="text-2xl mt-4 font-semibold tracking-tight text-gray-300 sm:text-4xl">
                What Your Results May Mean
              </h2>
            </div>
            <div className="grid grid-cols-2 grid-rows-2 gap-8 sm:gap-12">
              <div className="col-span-1 row-span-1">
                <div className="mt-0 sm:mt-6 text-sm ml-4 sm:ml-0 sm:text-lg text-center text-gray-300">
                  <p className="text-medium-purple-500">
                    <strong>BMI (Body Mass Index):</strong>
                  </p>
                  <p className="text-gray-200">
                    A BMI range of 18.5 to 24.9 is considered healthy. The higher the BMI, the
                    greater the risk of developing or experiencing health problems. A BMI of 30 or
                    higher may indicate obesity.
                  </p>
                </div>
              </div>
              <div className="col-span-1 row-span-1">
                <div className="mt-0 sm:mt-6  mr-4 sm:mr-0 text-sm sm:text-lg sm:ml-0 text-center text-gray-300">
                  <p className="text-medium-purple-500">
                    <strong>Body Fat:</strong>
                  </p>
                  <p className="text-gray-200">
                    Body fat percentage is a measure of the amount of body fat compared to total
                    body weight. Healthy body fat percentages vary by age and gender.
                  </p>
                </div>
              </div>
              <div className="col-span-1 row-span-1">
                <div className="mt-0 sm:mt-6 ml-4 text-sm sm:text-lg sm:ml-0 text-center text-gray-300">
                  <p className="text-medium-purple-500">
                    <strong>Fat Mass:</strong>
                  </p>
                  <p className="text-gray-200">
                    Fat mass refers to the total weight of fat in the body. Monitoring fat mass is
                    essential for assessing overall health and fitness levels.
                  </p>
                </div>
              </div>
              <div className="col-span-1 row-span-1">
                <div className="mt-0 sm:mt-6  mr-4 text-sm sm:text-lg sm:mr-0 text-center text-gray-300">
                  <p className="text-medium-purple-500">
                    <strong>Lean Mass:</strong>
                  </p>
                  <p className="text-gray-200">
                    Lean mass is the weight of everything in the body except fat, including muscles,
                    bones, organs, and more. Maintaining a healthy balance of lean mass is crucial
                    for overall well-being.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="w-full flex flex-col items-center justify-center">
          {isLoggedIn && (
            <Card
              className={`mx-4 sm:mx-10 rounded-xl mb-6 sm:mb-4 shadow-2xl mt-6 sm:mt-8 bg-secondary-400 px-6 ${
                !weeklyPlan ? 'sm:w-[94.5%]  mx-2 pb-4  sm:mx-auto' : 'w-[94.5%] '
              }`}
            >
              {weeklyPlan ? (
                <>
                  <h1 className="bg-medium-purple-500 text-gray-100 font-semibold p-3 sm:w-1/2 w-3/4 mx-auto rounded-bl-lg rounded-br-lg text-center mb-4 border-secondary-600 border-b-[2px] border-l-[2px] border-r-[2px]">
                    My Active Weekly Plan:{' '}
                    <span className="text-yellow-400">{weeklyPlan.planName || 'Unnamed Plan'}</span>
                  </h1>
                  <div className=" p-4 mb-4 outline outline-medium-purple-500 rounded-sm">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-2">
                      {[
                        'Monday',
                        'Tuesday',
                        'Wednesday',
                        'Thursday',
                        'Friday',
                        'Saturday',
                        'Sunday',
                      ].map((day) => (
                        <Card
                          key={day}
                          className="border p-2 rounded-md bg-white shadow-sm h-24 sm:h-32 md:h-40 lg:h-48 xl:h-56"
                        >
                          <h4 className="font-medium text-sm sm:text-base">{day}</h4>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {weeklyPlan[day]?.map((exercise, index) => (
                              <span
                                key={index}
                                className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${getColorForExercise(
                                  exercise
                                )} text-gray-700`}
                              >
                                {exercise}
                              </span>
                            )) || <span className="text-sm text-gray-500">No exercises</span>}
                          </div>
                        </Card>
                      ))}
                    </div>
                    <h3 className="text-xs sm:text-sm text-gray-200 font-semibold mt-2 text-center">
                      Created on {weeklyPlan.timestamp}
                    </h3>
                  </div>
                </>
              ) : (
                <>
                  <p className="text-gray-200  font-semibold text-2xl text-center">
                    Don&apos;t have a weekly plan yet?
                  </p>
                  <p className="text-gray-200 text-sm text-center">Go create or make one active.</p>
                </>
              )}
            </Card>
          )}

          <div
            className={`mx-10 rounded-xl mb-12 justify-between ${
              !isLoggedIn ? 'mt-6' : ''
            } hidden sm:block`}
          >
            <div className="sm:p-6 p-0">
              {/* <h1 className="text-4xl font-extrabold text-center text-gray-100 mb-12">
                Explore Our Features
              </h1> */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {isLoggedIn ? (
                  <Link href="/exercise">
                    <div className="bg-secondary-400 p-8 rounded-xl shadow-lg transition-colors duration-300 cursor-pointer hover:bg-secondary-500">
                      <div className="flex justify-center space-x-4 ">
                        <ClockIcon className="h-10 w-10  text-medium-purple-300 mb-4" />
                        <h2 className="text-2xl font-bold  text-gray-100 mb-4">
                          Track Your Exercises
                        </h2>
                      </div>
                      <p className="text-medium-purple-300 font-medium w-3/4 mx-auto">
                        Monitor your workouts and log your exercises to keep track of your progress.
                      </p>
                    </div>
                  </Link>
                ) : (
                  <div className="bg-secondary-400 p-8 rounded-xl shadow-lg transition-colors duration-300">
                    <div className="flex justify-center space-x-4 ">
                      <ClockIcon className="h-10 w-10  text-medium-purple-300 mb-4" />
                      <h2 className="text-2xl font-bold  text-gray-100 mb-4">
                        Track Your Exercises
                      </h2>
                    </div>
                    <p className="text-medium-purple-300 font-medium w-3/4 mx-auto">
                      Monitor your workouts and log your exercises to keep track of your progress.
                    </p>
                  </div>
                )}

                {isLoggedIn ? (
                  <Link href="/results">
                    <div className="bg-secondary-400 p-8 rounded-xl shadow-lg transition-colors duration-300 cursor-pointer hover:bg-secondary-500">
                      <div className="flex justify-center space-x-4 ">
                        <ChartBarIcon className="h-10 w-10  text-medium-purple-300 mb-4" />
                        <h2 className="text-2xl font-bold text-gray-100 mb-4">
                          Monitor Body Metrics
                        </h2>
                      </div>
                      <p className="text-medium-purple-300 font-medium w-3/4 mx-auto">
                        Keep track of your body metrics and weight loss journey with detailed
                        reports and analytics.
                      </p>
                    </div>
                  </Link>
                ) : (
                  <div className="bg-secondary-400 p-8 rounded-xl shadow-lg transition-colors duration-300">
                    <div className="flex justify-center space-x-4 ">
                      <ChartBarIcon className="h-10 w-10  text-medium-purple-300 mb-4" />
                      <h2 className="text-2xl font-bold text-gray-100 mb-4">
                        Monitor Body Metrics
                      </h2>
                    </div>
                    <p className="text-medium-purple-300 font-medium w-3/4 mx-auto">
                      Keep track of your body metrics and weight loss journey with detailed reports
                      and analytics.
                    </p>
                  </div>
                )}

                {isLoggedIn ? (
                  <Link href="/weeklyPlanner">
                    <div className="bg-secondary-400 p-8 rounded-xl shadow-lg transition-colors duration-300 cursor-pointer hover:bg-secondary-500">
                      <div className="flex justify-center space-x-4 ">
                        <CalendarIcon className="h-10 w-10 text-medium-purple-300 mb-4" />
                        <h2 className="text-2xl font-bold text-gray-100 mb-4">
                          Make Weekly Workout Plans
                        </h2>
                      </div>
                      <p className="text-medium-purple-300 font-medium w-3/4 mx-auto">
                        Create and customize your weekly workout plans to stay organized and
                        motivated.
                      </p>
                    </div>
                  </Link>
                ) : (
                  <div className="bg-secondary-400 p-8 rounded-xl shadow-lg transition-colors duration-300">
                    <div className="flex justify-center space-x-4 ">
                      <CalendarIcon className="h-10 w-10 text-medium-purple-300 mb-4" />
                      <h2 className="text-2xl font-bold text-gray-100 mb-4">
                        Make Weekly Workout Plans
                      </h2>
                    </div>
                    <p className="text-medium-purple-300 font-medium w-3/4 mx-auto">
                      Create and customize your weekly workout plans to stay organized and
                      motivated.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default BmiCalculator
