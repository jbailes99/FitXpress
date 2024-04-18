'use client'
import React from 'react'
import { motion } from 'framer-motion'

const Info = () => {
  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  }

  return (
    <motion.div
      initial='hidden'
      animate='visible'
      variants={fadeInUp}
      className='bg-gradient-to-b from-gray-700 to-gray-500  shadow  min-h-screen flex items-start justify-center'
    >
      <div className='flex items-center justify-center px-4 py-8 sm:p-6'>
        <div className='items-center justify-center mt-2 max-w-4xl text-sm text-white'>
          <div className='mt-6 flex flex-col gap-x-12 gap-y-20 lg:flex-row'>
            <div className='lg:w-1/2 lg:max-w-screen-xl lg:flex-auto'>
              <h1 className='text-6xl font-extrabold text-white mb-4'>Welcome to Nutrition Hub</h1>
              <p className='text-lg text-white'>
                Welcome to our Nutrition Hub - where we guide you towards a healthier and happier lifestyle. Discover
                nutrition tips, information, and practices for mindful well-being.
              </p>
              <div className='mt-24'>
                <section className='mt-8'>
                  <h2 className='text-3xl font-semibold text-white mb-2'>Nutrition Tips</h2>
                  <p className='text-lg text-white'>
                    Explore a diverse array of nutrition tips to nourish your body with essential nutrients. From
                    delicious recipes to nutritional insights, we are here to support your journey to better eating
                    habits.
                  </p>
                </section>

                <section className='mt-8'>
                  <h2 className='text-3xl font-semibold text-white mb-2'>Exercise Recommendations</h2>
                  <p className='text-lg text-white'>
                    Energize your body with our personalized exercise recommendations. Whether you are a beginner or an
                    avid fitness enthusiast, find workout routines, fitness challenges, and tips to keep you motivated.
                  </p>
                </section>

                <section className='mt-8'>
                  <h2 className='text-3xl font-semibold text-white mb-2'>Mindfulness and Wellness</h2>
                  <p className='text-lg text-white'>
                    Achieve balance in body and mind through mindfulness practices and holistic wellness approaches.
                    Explore stress management techniques and embrace a well-rounded lifestyle for lasting well-being.
                  </p>
                </section>

                <section className='mt-8'>
                  <h2 className='text-3xl font-semibold text-white mb-2'>Recipes and Meal Plans</h2>
                  <p className='text-lg text-white'>
                    Delight your taste buds with our collection of wholesome recipes and well-balanced meal plans.
                    Discover culinary inspiration for a healthier and more enjoyable eating experience.
                  </p>
                </section>

                {/* Add more creative and engaging sections as needed */}
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default Info
