import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Navigation from '@/components/navigation'
import { ThemeProvider } from './theme'
import { StoreProvider } from './store-provider'
import './globals.css'
import React from 'react'
import Footer from '@/components/footer'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'FitXpress',
  description: 'FitXpress',
}
const theme = {
  input: {
    defaultProps: {
      autoComplete: 'off',
    },
    styles: {
      base: {
        input: {
          color: 'text-white',
          height: '3rem', // Increased height
        },
        label: {
          color: ' peer-focus:text-medium-purple-400',
        },
      },
    },
  },
  select: {
    defaultProps: {
      labelProps: {},
    },
    styles: {
      base: {
        //   color: 'text-medium-purple-400',
        select: {
          color: 'text-white',
        },
        //   //   menu: {
        //   //     color: 'text-black',
        //   //   },
        //   //   // active: {
        //   //   //   color: 'text-medium-purple-400',
        //   //   // },
        //   //   label: {
        //   //     color: '!text-green-500',
        //   //   },
      },
    },
  },

  button: {
    styles: {
      variants: {
        filled: {
          purple: {
            hover: 'hover:shadow-xsm hover:shadow-purple-500/40',
          },
        },
      },
    },
  },
}
function AppWrapper({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider value={theme}>
      <Navigation />
      {children}
    </ThemeProvider>
  )
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font*/}
        <link
          href="https://fonts.googleapis.com/css2?family=family=Roboto:ital,wght@0,100;0,300;0,400;0,500;0,700;0,900;1,100;1,300;1,400;1,500;1,700;1,900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={`${inter.className} flex flex-col min-h-screen`}>
        <StoreProvider>
          <AppWrapper>
            <main className="flex-grow">{children}</main>
          </AppWrapper>
          <Footer />
        </StoreProvider>
      </body>
    </html>
  )
}
