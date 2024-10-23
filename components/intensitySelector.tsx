import React from 'react'
import { motion } from 'framer-motion'
import { FaRunning, FaWalking, FaBiking, FaHeart, FaBolt } from 'react-icons/fa'

const intensityLevels = [
  { value: 'low', icon: <FaWalking />, label: 'Low' },
  { value: 'medium', icon: <FaBiking />, label: 'Medium' },
  { value: 'high', icon: <FaRunning />, label: 'High' },
  { value: 'extreme', icon: <FaBolt />, label: 'Extreme' },
]

const IntensitySelector = ({ selectedIntensity, onChange }) => {
  return (
    <div className="intensity-selector">
      {intensityLevels.map((level) => (
        <motion.div
          key={level.value}
          className={`intensity-option ${selectedIntensity === level.value ? 'selected' : ''}`}
          onClick={() => onChange(level.value)}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          {level.icon}
          <span className="label">{level.label}</span>
        </motion.div>
      ))}
    </div>
  )
}

export default IntensitySelector
