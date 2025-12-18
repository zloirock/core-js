// https://github.com/tc39/proposal-math-clamp

interface Number { // @type-options export-base-constructor
  /**
   * Clamps the number within the inclusive lower and upper bounds.
   * @param lower
   * @param upper
   * @returns The clamped number.
   */
  clamp(lower: number, upper: number): number;
}
