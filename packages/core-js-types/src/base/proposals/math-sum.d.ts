// https://github.com/tc39/proposal-math-sum

// For ensuring compatibility with TypeScript standard types, this code is aligned with:
// https://github.com/microsoft/TypeScript/blob/3e9236361fa97a9e6c685f4833ac457ae2d8c50a/tsc/internal/bundled/libs/lib.es2026.math.d.ts
// License: https://github.com/microsoft/TypeScript/blob/v7.1-beta/LICENSE.txt

interface Math { // @type-options: no-constructor
  /**
   * Sums the values in an iterable while minimizing loss of precision.
   * @param items - An iterable of numbers to sum.
   * @throws TypeError If `items` is not iterable or contains a value that is not a number.
   * @throws RangeError If `items` contains 2^53 or more values.
   */
  sumPrecise(items: Iterable<number>): number;
}
