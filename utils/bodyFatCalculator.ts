import { parseFeet } from './numberUtils' // Import the parseFeet function

export function calculateBodyFat(waist: number, neck: number, height: string, weight: number): number {
  // Parse the height from feet and inches to total inches using parseFeet
  const totalInches = parseFeet(height)
  //   console.log(totalInches)

  // Navy Method for males (in inches)
  // Formula: 86.010 * log10(waist - neck) - 70.041 * log10(height) + 36.76

  const bodyFatPercentage = 86.01 * Math.log10(waist - neck) - 70.041 * Math.log10(totalInches) + 36.76

  //print all inputs for testing
  console.log(waist)
  console.log(neck)
  console.log(totalInches)
  console.log(weight)
  console.log(bodyFatPercentage)

  // Ensure the result is a positive value
  return bodyFatPercentage >= 0 ? bodyFatPercentage : 0
}
export function calculateBMR(weight: number, height: string, age: number): number {
  const totalInches = parseFeet(height)

  const bodyBMR = 88.362 + 4.799 * weight + 12.397 * Math.log10(totalInches) - 5.677 * age
  return bodyBMR >= 0 ? bodyBMR : 0
}
export function calculateBodyFatMass(
  bodyFatPercentage: number,
  waist: number,
  neck: number,
  height: string,
  weight: number
): number {
  // Parse the height from feet and inches to total inches using parseFeet
  //   console.log(totalInches)

  const bodyFatMass = (weight * bodyFatPercentage) / 100
  // Ensure the result is a positive value
  return bodyFatMass >= 0 ? bodyFatMass : 0
}

export function calculateBodyLeanMass(
  bodyFatMass: number,
  waist: number,
  neck: number,
  height: string,
  weight: number
): number {
  // Parse the height from feet and inches to total inches using parseFeet
  //   console.log(totalInches)

  const bodyLeanMass = weight - bodyFatMass
  // Ensure the result is a positive value
  return bodyLeanMass >= 0 ? bodyLeanMass : 0
}

//make another one for BMI

export function calculateBMI(height: string, weight: number): number {
  // Parse the height from feet and inches to total inches using parseFeet
  const totalInches = parseFeet(height)

  // BMI Formula: weight (lb) / [height (in)]2 x 703
  const bodyBMI = (weight / (totalInches * totalInches)) * 703

  // Ensure the result is a positive value
  return bodyBMI >= 0 ? bodyBMI : 0
}

// make anoher one for BMI method to find body fat percentage for adult males using this equation BFP = 1.20 × BMI + 0.23 × Age − 16.2
export function calculateBodyFatPercentageBMI(bodyBMI: number, age: number): number {
  // BMI Formula: weight (lb) / [height (in)]2 x 703
  const bodyFatPercentageBMI = 1.2 * bodyBMI + 0.23 * age - 16.2

  // Ensure the result is a positive value
  return bodyFatPercentageBMI >= 0 ? bodyFatPercentageBMI : 0
}
