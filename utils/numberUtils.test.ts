import { parseFeet } from './numberUtils'

describe('parseFeet', () => {
  it('should parse feet and inches', () => {
    expect(parseFeet('5\'10"')).toEqual(70)
    expect(parseFeet('1‘10"')).toEqual(22)
  })
})
