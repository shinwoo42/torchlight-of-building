export type ValueRange = { min: number; max: number }

const interpolateValue = (range: ValueRange, percentage: number): number => {
  if (percentage < 0 || percentage > 100) {
    throw new Error(`Percentage must be 0-100, got ${percentage}`)
  }
  const value = range.min + (range.max - range.min) * (percentage / 100)
  return Math.round(value)
}

/**
 * Crafts a single affix string by interpolating value ranges from the craftableAffix format
 *
 * @param affix - The gear affix with craftableAffix property
 * @param percentage - Value from 0-100 representing crafting quality
 * @returns The final affix string with interpolated values
 *
 * @example
 * craft({ craftableAffix: "+(17-24)% Speed" }, 0)   // "+17% Speed"
 * craft({ craftableAffix: "+(17-24)% Speed" }, 50)  // "+21% Speed"
 * craft({ craftableAffix: "+(17-24)% Speed" }, 100) // "+24% Speed"
 */
export const craft = <T extends { craftableAffix: string }>(
  affix: T,
  percentage: number,
): string => {
  let result = affix.craftableAffix

  // Pattern to match range values like (17-24) or (-6--4)
  const rangePattern = /\((-?\d+)-(-?\d+)\)/g

  result = result.replace(rangePattern, (match, minStr, maxStr) => {
    const min = parseInt(minStr, 10)
    const max = parseInt(maxStr, 10)
    const value = interpolateValue({ min, max }, percentage)
    return value.toString()
  })

  return result
}
