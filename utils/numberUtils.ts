// parseFeet takes a string in the format of feet'inches" and returns the total number of inches
export function parseFeet(feet: string): number {
  const [feetString, inchesString] = feet.split("'")
  const inches = parseInt(feetString) * 12 + parseInt(inchesString.replace('"', ''))
  return inches
}
