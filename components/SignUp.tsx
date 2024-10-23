// SignUp.tsx

import React, { Fragment, useState, useEffect } from 'react'
import { signUp } from '@/utils/authService'
import SuccessfulSignUpModal from '@/components/SuccessfulSignUp'
import SignIn from './SignInModal'
import {
  Button,
  Dialog as MTDialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Input,
  Select,
  Option,
} from '@material-tailwind/react'

interface SignUpProps {
  onClose: () => void
}

const apiEndpoint = 'https://lz9iflahdk.execute-api.us-east-1.amazonaws.com/default/authService'

const SignUp: React.FC<SignUpProps> = ({ onClose }) => {
  const [credentials, setCredentials] = useState<{
    sex: string
    nickname: string
    username: string
    password: string
    email: string
    weight: string
    age: string
  }>({ nickname: '', username: '', password: '', email: '', sex: '', weight: '', age: '' })
  const [open, setOpen] = useState(true)
  const [signUpSuccess, setSignUpSuccess] = useState(false)
  const [isSignInModal, setIsSignInModal] = useState(false)
  const [error, setError] = useState<string | null>(null) // Explicitly type error state
  const [passwordRequirements, setPasswordRequirements] = useState({
    hasNumber: false,
    hasSpecialChar: false,
    hasUppercase: false,
    hasLowercase: false,
  })
  const [isSignInOpen, setIsSignInOpen] = useState(false)

  useEffect(() => {
    const checkPasswordRequirements = (password: string) => {
      setPasswordRequirements({
        hasNumber: /\d/.test(password),
        hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
        hasUppercase: /[A-Z]/.test(password),
        hasLowercase: /[a-z]/.test(password),
      })
    }

    if (credentials.password) {
      checkPasswordRequirements(credentials.password)
    } else {
      setPasswordRequirements({
        hasNumber: false,
        hasSpecialChar: false,
        hasUppercase: false,
        hasLowercase: false,
      })
    }
  }, [credentials.password])

  const unmetRequirements = Object.entries(passwordRequirements)
    .filter(([_, isMet]) => !isMet)
    .map(([requirement]) => requirement)

  const allRequirementsMet = Object.values(passwordRequirements).every(Boolean)

  const handleSubmit = async () => {
    try {
      // Call signUp function from authService
      await signUp(
        credentials.username,
        credentials.password,
        credentials.email,
        credentials.nickname,
        credentials.sex,
        credentials.age,
        credentials.weight
      )
      console.log('Sign-up successful')
      onClose()
    } catch (error) {
      console.error('Sign-up error:', error)

      // Check if the error is a Cognito user already exists error
      if (error.code === 'UsernameExistsException') {
        // Show a specific error message for duplicate username
        setError('Username already exists. Please choose a different one.')
      } else {
        // Show a generic error message for other errors
        setError('Sign-up failed. Please try again.')
      }
    }
  }

  const handleSignUpClose = () => {
    onClose()
    setOpen(false)
  }

  const handleSignInClose = () => {
    onClose()
    setIsSignInModal(false)
  }

  const handleSignInOpen = () => {
    setIsSignInModal(true)
    handleSignUpClose()
  }

  const handleSignInClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsSignInOpen(true)
    setOpen(false)
  }

  return (
    <>
      <MTDialog
        size="xs"
        open={open}
        handler={handleSignUpClose}
        className="bg-secondary-500 outline outline-medium-purple-500/70  bg-opacity-90"
      >
        <DialogHeader className="text-center text-gray-300 flex justify-center items-center">
          Sign Up
        </DialogHeader>
        <DialogBody className="overflow-y-auto flex-col justify-center items-center ">
          {/* Nickname input */}
          <div className="mb-4 w-3/4 mx-auto">
            <Input
              crossOrigin={undefined}
              type="text"
              label="Nickname"
              onChange={(e) => setCredentials({ ...credentials, nickname: e.target.value })}
              value={credentials.nickname}
              className=" text-medium-purple-500"
            />
          </div>

          {/* Username input */}
          <div className="mb-4 w-3/4 mx-auto">
            <Input
              crossOrigin={undefined}
              type="text"
              label="Username"
              onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
              value={credentials.username}
              className=" text-medium-purple-500"
            />
          </div>

          {/* Password input */}
          <div className="mb-4 w-3/4 mx-auto">
            <Input
              crossOrigin={undefined}
              type="password"
              label="Password"
              onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
              value={credentials.password}
              className=" text-medium-purple-500"
            />
            {credentials.password && (
              <div className="text-left text-sm mt-2">
                <p className="text-center text-sm text-gray-200 font-bold">
                  Password requirements:
                </p>
                <ul className="list-disc list-inside">
                  <li
                    className={passwordRequirements.hasNumber ? 'text-green-500' : 'text-red-200'}
                  >
                    Contains at least 1 number
                  </li>
                  <li
                    className={
                      passwordRequirements.hasSpecialChar ? 'text-green-500' : 'text-red-200'
                    }
                  >
                    Contains at least 1 special character
                  </li>
                  <li
                    className={
                      passwordRequirements.hasUppercase ? 'text-green-500' : 'text-red-200'
                    }
                  >
                    Contains at least 1 uppercase letter
                  </li>
                  <li
                    className={
                      passwordRequirements.hasLowercase ? 'text-green-500' : 'text-red-200'
                    }
                  >
                    Contains at least 1 lowercase letter
                  </li>
                </ul>
              </div>
            )}
          </div>

          {/* Email input */}
          <div className="mb-4 w-3/4 mx-auto">
            <Input
              crossOrigin={undefined}
              type="email"
              label="Email"
              onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
              value={credentials.email}
              className=" text-medium-purple-500"
            />
          </div>

          {/* Sex select */}
          <div className="mb-4 w-3/4 mx-auto">
            <Select
              label="Sex"
              onChange={(value) => setCredentials({ ...credentials, sex: value as string })}
              value={credentials.sex}
              className="text-medium-purple-500"
            >
              <Option value="male">Male</Option>
              <Option value="female">Female</Option>
            </Select>
          </div>

          {/* Age select */}
          <div className="mb-4 w-3/4 mx-auto">
            <Select
              label="Age"
              onChange={(value) => setCredentials({ ...credentials, age: value as string })}
              value={credentials.age}
              className="text-medium-purple-500"
            >
              {Array.from({ length: 100 - 16 + 1 }, (_, index) => 16 + index).map((age) => (
                <Option key={age} value={age.toString()}>
                  {age}
                </Option>
              ))}
            </Select>
          </div>

          {/* Weight input */}
          <div className="mb-4 w-3/4 mx-auto">
            <Input
              crossOrigin={undefined}
              type="text"
              label="Weight"
              onChange={(e) => setCredentials({ ...credentials, weight: e.target.value })}
              value={credentials.weight}
              className=" text-medium-purple-500"
            />
          </div>
        </DialogBody>
        <DialogFooter className="flex flex-col items-center">
          <Button
            onClick={handleSubmit}
            disabled={!allRequirementsMet}
            className="bg-medium-purple-300 text-white w-1/2 mx-auto "
          >
            Sign Up
          </Button>
          {!allRequirementsMet && credentials.password && (
            <p className="text-red-500 text-center mt-2 text-sm">
              Please meet all password requirements before signing up.
            </p>
          )}
          {error && <div className="text-red-500 text-center mt-2 font-bold text-sm">{error}</div>}
          <p className="text-sm text-gray-300 mt-2">
            Already have an account?{' '}
            <span className="text-medium-purple-300 cursor-pointer" onClick={handleSignInClick}>
              Sign in
            </span>
          </p>
        </DialogFooter>
      </MTDialog>
      <SuccessfulSignUpModal open={signUpSuccess} onClose={() => setSignUpSuccess(false)} />
      {isSignInOpen && (
        <SignIn
          onClose={() => setIsSignInOpen(false)}
          onSignUpClick={() => {
            setIsSignInOpen(false)
            setOpen(true)
          }}
        />
      )}
    </>
  )
}

export default SignUp
