// https://github.com/tc39/proposal-math-sum
interface Math { // @type-options: no-constructor
  /**
   * Returns the sum of all given values.
   * @param items - An iterable of numbers to sum.
   * @returns The sum of all given values.
   */
  sumPrecise(items: Iterable<number>): number;
}
