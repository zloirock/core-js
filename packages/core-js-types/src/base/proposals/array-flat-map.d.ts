/// <reference types="../core-js-types/flat-array.d.ts" />

// proposal stage: 4
// https://github.com/tc39/proposal-flatMap

// For ensuring compatibility with TypeScript standard types, this code is based on:
// https://github.com/microsoft/TypeScript/blob/069de743dbd17b47cc2fc58e1d16da5410911284/src/lib/es2019.array.d.ts#L46
// License: https://github.com/microsoft/TypeScript/blob/v5.9.3/LICENSE.txt

interface Array<T> { // @type-options no-redefine
  /**
   * Calls a defined callback function on each element of an array. Then, flattens the result into
   * a new array.
   * This is identical to a map followed by flat with depth 1.
   *
   * @param callback A function that accepts up to three arguments. The flatMap method calls the
   * callback function one time for each element in the array.
   * @param thisArg An object to which this keyword can refer in the callback function. If
   * thisArg is omitted, undefined is used as this value.
   */
  flatMap<U, This = undefined>(callback: (this: This, value: T, index: number, array: T[]) => U | ReadonlyArray<U>, thisArg?: This): U[];

  /**
   * Returns a new array with all sub-array elements concatenated into it recursively up to the
   * specified depth.
   *
   * @param depth The maximum recursion depth
   */
  flat<A, D extends number = 1>(this: A, depth?: D): CoreJS.CoreJSFlatArray<A, D>[];
}
