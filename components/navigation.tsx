'use client'

import React, { Fragment, useEffect, useState } from 'react'
import cn from 'classnames'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Disclosure, Menu, Transition } from '@headlessui/react'
import { Bars3Icon, BellIcon, XMarkIcon, UserCircleIcon } from '@heroicons/react/24/outline'

import { useIsLoggedIn, useUserDetails, useIsAdmin } from '@/hooks'
import { signOut } from '@/utils/authService'
import { Button } from '@/components/button'

import SignIn from './SignInModal'
import SignUp from './SignUp'
import style from './navigation.module.css'

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
  // {
  //   key: 'info',
  //   name: 'More Info',
  //   href: '/info',
  // },
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
    () => NAV_ITEMS.find(item => item.href.startsWith(pathname || ''))?.key ?? 'home',
    [pathname]
  )

  return (
    <nav className='w-full flex h-16 bg-secondary-800'>
      <div className='flex flex-1 items-center h-full px-6'>
        <div className={style.brand}>FitXpress</div>
        <div className='flex items-center flex-1 h-full *:font-medium'>
          {NAV_ITEMS.map(
            item =>
              // Check if the item does not require authentication or if the user is logged in
              (!item.requireAuth || isLoggedIn) &&
              // Check if the item does not require admin or if the user is an admin
              (!item.requireAdmin || (isLoggedIn && isAdmin)) && (
                <Link
                  className={cn('flex items-center h-full px-4 transition-all', {
                    'bg-gray-900/70 text-white': item.key === currentPage,
                    'text-gray-400 hover:bg-gray-900/30 hover:text-gray-300': item.key !== currentPage,
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

        {!isLoggedIn && (
          <div className='flex items-center space-x-1'>
            <Button onClick={() => setSignInOpen(true)}>Login</Button>
            <Button
              className='bg-medium-purple-500 hover:bg-medium-purple-700'
              shadow
              rounded
              onClick={() => setSignUpOpen(true)}
            >
              Sign Up
            </Button>
          </div>
        )}

        {isLoggedIn && (
          <Menu as='div' className='justify-end ml-3'>
            <div>
              <Menu.Button className='flex text-medium-purple-300 items-center'>
                <div className='font-semibold'>{userDetails.username}</div>

                <span className='ml-1' />
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  fill='none'
                  viewBox='0 0 24 24'
                  strokeWidth={1.5}
                  stroke='currentColor'
                  className='w-6 h-6'
                >
                  <path strokeLinecap='round' strokeLinejoin='round' d='m19.5 8.25-7.5 7.5-7.5-7.5' />
                </svg>
              </Menu.Button>
            </div>
            <Transition
              as={Fragment}
              enter='transition ease-out duration-100'
              enterFrom='transform opacity-0 scale-95'
              enterTo='transform opacity-100 scale-100'
              leave='transition ease-in duration-75'
              leaveFrom='transform opacity-100 scale-100'
              leaveTo='transform opacity-0 scale-95'
            >
              <Menu.Items className='absolute z-10 mt-2 w-40 origin-top-right right-2 rounded-md bg-white py-1  shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none'>
                <Menu.Item>
                  {({ active }) => (
                    <a
                      href='/profile'
                      className={classNames(active ? 'bg-gray-100' : '', 'block px-4 py-2 text-sm text-gray-700')}
                    >
                      Your Profile
                    </a>
                  )}
                </Menu.Item>
                <Menu.Item>
                  {({ active }) => (
                    <a
                      href='#'
                      className={classNames(active ? 'bg-gray-100' : '', 'block px-4 py-2 text-sm text-gray-700')}
                    >
                      Settings
                    </a>
                  )}
                </Menu.Item>
                <Menu.Item>
                  {({ active }) => (
                    <a
                      href='#'
                      onClick={isLoggedIn ? handleSignOut : handleSignInClick}
                      className={classNames(active ? 'bg-gray-100' : '', 'block px-4 py-2 text-sm text-gray-700')}
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
      {isSignInOpen && (
        <SignIn
          onClose={() => setSignInOpen(false)}
          // onSubmit={() => { }}
          onSignUpClick={() => setSignUpOpen(true)}
        />
      )}
      {isSignUpOpen && (
        <SignUp
          onClose={() => setSignUpOpen(false)}
          onSubmit={() => {}} // Provide an empty function if not needed
          onSignUpClick={() => setSignUpOpen(true)}
        />
      )}
    </nav>
  )
}
