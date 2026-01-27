// https://github.com/tc39/proposal-math-clamp

interface Number { // @type-options: export-base-constructor
  /**
   * Clamps the number within the inclusive lower and upper bounds.
   * @param lower - The lower bound.
   * @param upper - The upper bound.
   * @returns The clamped number.
   */
  clamp(lower: number, upper: number): number;
}
