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
  {
    key: 'info',
    name: 'More Info',
    href: '/info',
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
          // onSubmit={() => { }}
          onSignUpClick={() => setSignUpOpen(true)}
        />
      )}
    </nav>
  )

  return (
    <>
      <Disclosure as='nav' className='bg-gray-800 '>
        {({ open }) => (
          <>
            <div className='h-16 mx-auto max-w-7xl px-2 sm:px-6 sm:py-2 py-0 lg:px-8'>
              <div className='flex h-full items-center'>
                <div className='flex-1 items-center justify-center sm:items-stretch sm:justify-center'>
                  <div className='sm:ml-10 sm:block'>
                    <div className='flex justify-between items-center'>
                      <div className='flex items-center'>
                        <div className='flex justify-start items-center text-3xl font-bold text-gray-300'>
                          bodymetrics
                        </div>
                      </div>
                      <div className='flex justify-center items-center space-x-1 sm:space-x-10'>
                        {NAV_ITEMS.map(item => (
                          <Link
                            key={item.name}
                            href={item.href}
                            className={cn(
                              item.key === currentPage
                                ? 'bg-gray-900 text-white'
                                : 'text-gray-300 hover:bg-gray-700 hover:text-white',
                              'rounded-md px-3 py-2 text-md font-medium'
                            )}
                            aria-current={item.key === currentPage ? 'page' : undefined}
                          >
                            {item.name}
                          </Link>
                        ))}
                      </div>
                      <div></div>
                    </div>
                  </div>
                </div>
                <Menu as='div' className='justify-end ml-3'>
                  <div>
                    <Menu.Button className='relative flex rounded-full bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-white  focus:ring-offset-gray-800'>
                      <span className='absolute -inset-1.5' />
                      <span className='sr-only'>Open user menu</span>
                      <span className='inline-block h-10 w-10 overflow-hidden rounded-full bg-gray-600'>
                        <svg className='h-full w-full text-gray-300' fill='currentColor' viewBox='0 0 24 24'>
                          <path d='M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z' />
                        </svg>
                      </span>{' '}
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
                    <Menu.Items className='absolute z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none'>
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

                      <Menu.Item>
                        {({ active }) => (
                          <a
                            href='#'
                            onClick={handleSignOut}
                            className={classNames(active ? 'bg-gray-100' : '', 'block px-4 py-2 text-sm text-gray-700')}
                          >
                            Sign Out{' '}
                          </a>
                        )}
                      </Menu.Item>
                    </Menu.Items>
                  </Transition>
                </Menu>
                {!isLoggedIn && <button className='h-full bg-red-500'>test</button>}
              </div>
            </div>

            <Disclosure.Panel className='sm:hidden'>
              <div className='space-y-1 px-2 pb-3 pt-2'>
                {NAV_ITEMS.map(item => (
                  <Disclosure.Button
                    key={item.name}
                    as='a'
                    href={item.href}
                    className={cn(
                      item.key === currentPage // Corrected this line
                        ? 'bg-gray-900 text-white'
                        : 'text-gray-300 hover:bg-gray-700 hover:text-white',
                      'block rounded-md px-3 py-2 text-base font-medium'
                    )}
                    aria-current={item.key === currentPage ? 'page' : undefined}
                  >
                    {item.name}
                  </Disclosure.Button>
                ))}
              </div>
            </Disclosure.Panel>
          </>
        )}
      </Disclosure>
      {isSignInOpen && (
        <SignIn
          onClose={() => setSignInOpen(false)}
          // onSubmit={() => { }}
          onSignUpClick={() => setIsSignUpOpen(true)}
        />
      )}
    </>
  )
}
