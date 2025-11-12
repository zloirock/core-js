// proposal stage: 3
// https://github.com/tc39/proposal-math-sum
interface Math {
  /**
   * Returns the sum of all given values.
   * @param values
   * @returns The sum of all given values.
   */
  sumPrecise(...values: number[]): number;
}
