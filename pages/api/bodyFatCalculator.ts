// api/bodyFatCalculator.ts

import { NextApiRequest, NextApiResponse } from 'next'
import { calculateBodyFat } from '../../utils/bodyFatCalculator'

const bodyFatCalculatorHandler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'POST') {
    const { gender, age, waistCircumference, neckCircumference, height, weight } = req.body

    // Validate input data
    if (!age || !waistCircumference || !neckCircumference || !height || !weight) {
      res.status(400).json({ error: 'Please provide all required fields.' })
      return
    }

    const heightRegex = /^\d{1,}'\d{1,}"$/ // Valid format: 5'9, 5'8, 4'9, 6'2
    if (!height.match(heightRegex)) {
      res.status(400).json({ error: "Invalid height format. Use a format like: 5'9, 5'10, 5'11" })
      return
    }

    // Perform body fat calculation (using a separate function, replace with your calculation logic)
    const bodyFatPercentage = calculateBodyFat(waistCircumference, neckCircumference, height, weight)

    res.status(200).json({ bodyFatPercentage })
  } else {
    res.status(405).json({ error: 'Method Not Allowed' })
  }
}

export default bodyFatCalculatorHandler
