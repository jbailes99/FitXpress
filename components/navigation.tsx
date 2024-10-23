'use client'

import React, { Fragment, useEffect, useState } from 'react'
import cn from 'classnames'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Disclosure, Menu, Transition } from '@headlessui/react'
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'

import { useIsLoggedIn, useUserDetails, useIsAdmin } from '@/hooks'
import { signOut } from '@/utils/authService'
import { Navbar, Typography } from '@/components'
import SignIn from './SignInModal'
import SignUp from './SignUp'
import style from './navigation.module.css'
import { Button } from '@material-tailwind/react'

const NAV_ITEMS = [
  {
    key: 'home',
    name: 'Home',
    href: '/',
  },
  {
    key: 'exercise',
    name: 'Exercise Hub',
    href: '/exercise',
    requireAuth: true,
  },
  {
    key: 'results',
    name: 'My Results',
    href: '/results',
    requireAuth: true,
  },
  {
    key: 'weeklyPlanner',
    name: 'Planner',
    href: '/weeklyPlanner',
    requireAuth: true,
  },
  {
    key: 'admin',
    name: 'Admin Panel',
    href: '/admin',
    requireAdmin: true,
  },
]

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ')
}
export default function Navigation() {
  const isLoggedIn = useIsLoggedIn()
  const userDetails = useUserDetails()
  const isAdmin = useIsAdmin()
  const [isSignInOpen, setSignInOpen] = useState(false)
  const [isSignUpOpen, setSignUpOpen] = useState(false)
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const handleSignInClick = (clickEvent: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    clickEvent.preventDefault()
    setSignInOpen(!isSignInOpen)
  }
  const handleSignUpClick = (clickEvent: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    clickEvent.preventDefault()
    setSignUpOpen(!isSignUpOpen)
  }

  // const handleSignIn = async () => {
  //   console.log('test sign in')
  //   try {
  //     const response: any = await authService.signIn(username, password)
  //     console.log('test got', response)

  //     if (response.AuthenticationResult && response.AuthenticationResuslt.AccessToken) {
  //       const newAccessToken: string | undefined = response.AuthenticationResult.AccessToken
  //       console.log('test access token', newAccessToken)
  //       const userDetails = await authService.getUserDetails(newAccessToken)
  //       console.log('test', userDetails)
  //       setIsLoggedIn(true)

  //       // After successful sign-in, set the authentication status and accessToken
  //       setAccessToken(newAccessToken || null)
  //       setSignInOpen(false)
  //     } else {
  //       // Handle the case where response is not as expected
  //       console.log('Unexpected response structure after sign-in:', response)
  //       // Additional error handling or logging if needed
  //     }
  //   } catch (error) {
  //     console.error('Sign-in error:', error)
  //     // Handle sign-in error
  //   }
  // }

  const handleSignOut = async () => {
    try {
      await signOut()
      // setIsLoggedIn(false)

      // After successful sign-out, set the authentication status and clear accessToken
      setAccessToken(null)
      // Additional logic, such as redirecting the user
    } catch (error) {
      console.error('Sign-out error:', error)
      // Handle sign-out error
    }
  }

  const pathname = usePathname()
  const currentPage = React.useMemo(
    () => NAV_ITEMS.find((item) => item.href.startsWith(pathname || ''))?.key ?? 'home',
    [pathname]
  )

  return (
    <Navbar className="sticky top-0 z-10 h-auto max-w-full rounded-none border-b border-white/10 bg-secondary-800 px-4 py-3  shadow-none backdrop-blur">
      <div className="flex items-center justify-between h-full px-6 md:h-16">
        <Typography as="a" href="#" className={`${style.brand}`}>
          FitXpress
        </Typography>

        {/* Mobile menu button */}
        <div className="flex md:hidden">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="text-gray-400 hover:text-white focus:outline-none"
          >
            {isMenuOpen ? <XMarkIcon className="h-6 w-6" /> : <Bars3Icon className="h-6 w-6" />}
          </button>
        </div>

        {/* Desktop menu */}
        <div className="hidden md:flex items-center flex-1 h-full *:font-medium">
          {NAV_ITEMS.map(
            (item) =>
              (!item.requireAuth || isLoggedIn) &&
              (!item.requireAdmin || (isLoggedIn && isAdmin)) && (
                <Link
                  className={cn('flex items-center px-4 transition-all', {
                    'bg-medium-purple-500/90 text-white rounded-full h-2/3':
                      item.key === currentPage,
                    'text-gray-400 hover:bg-gray-900/30 hover:text-gray-300':
                      item.key !== currentPage,
                  })}
                  key={item.name}
                  href={item.href}
                  aria-current={item.key === currentPage ? 'page' : undefined}
                >
                  {item.name}
                </Link>
              )
          )}
        </div>

        {/* User menu (desktop) */}
        <div className="hidden md:flex items-center">
          {!isLoggedIn && (
            <div className="flex items-center space-x-1">
              <Button
                className="rounded-full text-white bg-transparent hover:bg-transparent"
                size="lg"
                onClick={() => setSignInOpen(true)}
              >
                Login
              </Button>
              <Button
                className="bg-medium-purple-500 hover:bg-medium-purple-700 rounded-full"
                size="lg"
                onClick={() => setSignUpOpen(true)}
              >
                Sign Up
              </Button>
            </div>
          )}
          {isLoggedIn && (
            <Menu as="div" className="justify-end ml-3">
              <div>
                <Menu.Button className="flex text-medium-purple-300 items-center">
                  <div className="font-semibold hidden sm:block">{userDetails.username}</div>

                  <span className="ml-1" />
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-6 h-6"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="m19.5 8.25-7.5 7.5-7.5-7.5"
                    />
                  </svg>
                </Menu.Button>
              </div>
              <Transition
                as={Fragment}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
              >
                <Menu.Items className="absolute z-10 mt-2 w-40 origin-top-right right-2 rounded-md bg-white py-1  shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                  <Menu.Item>
                    {({ active }) => (
                      <a
                        href="/profile"
                        className={classNames(
                          active ? 'bg-gray-100' : '',
                          'block px-4 py-2 text-sm text-gray-700'
                        )}
                      >
                        Your Profile
                      </a>
                    )}
                  </Menu.Item>
                  {/* <Menu.Item>
                  {({ active }) => (
                    <a
                      href='#'
                      className={classNames(active ? 'bg-gray-100' : '', 'block px-4 py-2 text-sm text-gray-700')}
                    >
                      Settings
                    </a>
                  )}
                </Menu.Item> */}
                  <Menu.Item>
                    {({ active }) => (
                      <a
                        href="#"
                        onClick={isLoggedIn ? handleSignOut : handleSignInClick}
                        className={classNames(
                          active ? 'bg-gray-100' : '',
                          'block px-4 py-2 text-sm text-gray-700'
                        )}
                      >
                        {isLoggedIn ? 'Sign Out' : 'Sign In'}
                      </a>
                    )}
                  </Menu.Item>
                </Menu.Items>
              </Transition>
            </Menu>
          )}
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {NAV_ITEMS.map(
              (item) =>
                (isLoggedIn || item.key !== 'home') && // Add this condition
                (!item.requireAuth || isLoggedIn) &&
                (!item.requireAdmin || (isLoggedIn && isAdmin)) && (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn('block px-3 py-2 rounded-md text-base font-medium', {
                      'bg-medium-purple-500/90 text-white': item.key === currentPage,
                      'text-gray-400 hover:bg-gray-900/30 hover:text-gray-300':
                        item.key !== currentPage,
                    })}
                    aria-current={item.key === currentPage ? 'page' : undefined}
                  >
                    {item.name}
                  </Link>
                )
            )}
          </div>
          <div className="pt-4 pb-3 border-t border-gray-700">
            {!isLoggedIn ? (
              <div className="flex items-center px-5">
                <Button
                  className="w-full text-white bg-transparent hover:bg-transparent border border-gray-400"
                  size="lg"
                  onClick={() => setSignInOpen(true)}
                >
                  Login
                </Button>
                <Button
                  className="w-full ml-2 bg-medium-purple-500 hover:bg-medium-purple-700"
                  size="lg"
                  onClick={() => setSignUpOpen(true)}
                >
                  Sign Up
                </Button>
              </div>
            ) : (
              <div className="px-2 space-y-1">
                <Link
                  href="/profile"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-400 hover:text-white hover:bg-gray-700"
                >
                  Your Profile
                </Link>
                <a
                  href="#"
                  onClick={handleSignOut}
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-400 hover:text-white hover:bg-gray-700"
                >
                  Sign Out
                </a>
              </div>
            )}
          </div>
        </div>
      )}

      {isSignInOpen && (
        <SignIn
          onClose={() => setSignInOpen(false)}
          // onSubmit={() => { }}
          onSignUpClick={() => setSignUpOpen(true)}
        />
      )}
      {isSignUpOpen && <SignUp onClose={() => setSignUpOpen(false)} />}
    </Navbar>
  )
}
