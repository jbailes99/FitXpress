'use client'

import { motion } from 'framer-motion'
import React, { useState } from 'react'
import CalendarView from '@/components/calendarView' // Adjust the import based on your project structure

const WeeklyPlanner: React.FC = () => {
  const [fadeInUp, setFadeInUp] = useState({
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  })
  return (
    <motion.div initial="hidden" animate="visible" variants={fadeInUp}>
      <>
        <main>
          <div className=" mx-4 my-4  rounded-xl  relative isolate overflow-hidden ">
            <div>
              <div className="flex flex-col justify-center items-center mb-4 "></div>
              <div className="flex flex-col justify-center items-center">
                <div className=" rounded-xl p-4 font-bold text-center w-11/12 mb-4">
                  <CalendarView />
                </div>
              </div>
            </div>
          </div>
        </main>
      </>
    </motion.div>
  )
}

export default WeeklyPlanner
