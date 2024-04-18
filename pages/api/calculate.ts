// api/bodyFatCalculator.ts

import { NextApiRequest, NextApiResponse } from 'next'
import {
  calculateBodyFat,
  calculateBodyFatMass,
  calculateBodyLeanMass,
  calculateBMI,
  calculateBodyFatPercentageBMI,
  calculateBMR,
} from '@/utils/bodyFatCalculator'

const bodyFatCalculatorHandler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') {
    return res.status(405).end()
  }

  const { age, waistMeasurement, neckMeasurement, height, weight } = req.body

  // Validate input data
  if (!age || !waistMeasurement || !neckMeasurement || !height || !weight) {
    res.status(400).json({ error: 'Please provide all required fields.' })
    return
  }

  // Perform body fat calculation (using a separate function, replace with your calculation logic)
  const bodyFatPercentage = calculateBodyFat(waistMeasurement, neckMeasurement, height, weight)
  const bodyFatMass = calculateBodyFatMass(bodyFatPercentage, waistMeasurement, neckMeasurement, height, weight)
  const bodyLeanMass = calculateBodyLeanMass(bodyFatMass, waistMeasurement, neckMeasurement, height, weight)
  const bodyBMI = calculateBMI(height, weight)
  const BMIFatPercentage = calculateBodyFatPercentageBMI(bodyBMI, age)
  const bodyBMR = calculateBMR(height, weight, age)

  res.json({
    bodyFatPercentage,
    bodyFatMass,
    bodyLeanMass,
    bodyBMI,
    BMIFatPercentage,
    bodyBMR,
  })
}
export default bodyFatCalculatorHandler
