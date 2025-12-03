// proposal stage: 1
// https://github.com/tc39/proposal-array-unique

interface Array<T> { // @type-options no-redefine
  /**
   * Returns a new array with unique items, determined by the resolver function or property key
   * @param resolver A function that resolves the value to check uniqueness against,
   * or a property key to compare the value from each item
   * @returns A new `Array` with unique items
   */
  uniqueBy(resolver?: keyof T | ((value: T) => any)): Array<T>;
}

interface Int8Array { // @type-options no-redefine
  /**
   * Returns a new array with unique items, determined by the resolver function or property key
   * @param resolver A function that resolves the value to check uniqueness against,
   * or a property key to compare the value from each item
   * @returns A new `Array` with unique items
   */
  uniqueBy(resolver?: PropertyKey | ((value: number) => any)): Int8Array;
}

interface Uint8Array { // @type-options no-redefine
  /**
   * Returns a new array with unique items, determined by the resolver function or property key
   * @param resolver A function that resolves the value to check uniqueness against,
   * or a property key to compare the value from each item
   * @returns A new `Array` with unique items
   */
  uniqueBy(resolver?: PropertyKey | ((value: number) => any)): Uint8Array;
}

interface Uint8ClampedArray { // @type-options no-redefine
  /**
   * Returns a new array with unique items, determined by the resolver function or property key
   * @param resolver A function that resolves the value to check uniqueness against,
   * or a property key to compare the value from each item
   * @returns A new `Array` with unique items
   */
  uniqueBy(resolver?: PropertyKey | ((value: number) => any)): Uint8ClampedArray;
}

interface Int16Array { // @type-options no-redefine
  /**
   * Returns a new array with unique items, determined by the resolver function or property key
   * @param resolver A function that resolves the value to check uniqueness against,
   * or a property key to compare the value from each item
   * @returns A new `Array` with unique items
   */
  uniqueBy(resolver?: PropertyKey | ((value: number) => any)): Int16Array;
}

interface Uint16Array { // @type-options no-redefine
  /**
   * Returns a new array with unique items, determined by the resolver function or property key
   * @param resolver A function that resolves the value to check uniqueness against,
   * or a property key to compare the value from each item
   * @returns A new `Array` with unique items
   */
  uniqueBy(resolver?: PropertyKey | ((value: number) => any)): Uint16Array;
}

interface Int32Array { // @type-options no-redefine
  /**
   * Returns a new array with unique items, determined by the resolver function or property key
   * @param resolver A function that resolves the value to check uniqueness against,
   * or a property key to compare the value from each item
   * @returns A new `Array` with unique items
   */
  uniqueBy(resolver?: PropertyKey | ((value: number) => any)): Int32Array;
}

interface Uint32Array { // @type-options no-redefine
  /**
   * Returns a new array with unique items, determined by the resolver function or property key
   * @param resolver A function that resolves the value to check uniqueness against,
   * or a property key to compare the value from each item
   * @returns A new `Array` with unique items
   */
  uniqueBy(resolver?: PropertyKey | ((value: number) => any)): Uint32Array;
}

interface Float32Array { // @type-options no-redefine
  /**
   * Returns a new array with unique items, determined by the resolver function or property key
   * @param resolver A function that resolves the value to check uniqueness against,
   * or a property key to compare the value from each item
   * @returns A new `Array` with unique items
   */
  uniqueBy(resolver?: PropertyKey | ((value: number) => any)): Float32Array;
}

interface Float64Array { // @type-options no-redefine
  /**
   * Returns a new array with unique items, determined by the resolver function or property key
   * @param resolver A function that resolves the value to check uniqueness against,
   * or a property key to compare the value from each item
   * @returns A new `Array` with unique items
   */
  uniqueBy(resolver?: PropertyKey | ((value: number) => any)): Float64Array;
}

interface BigInt64Array { // @type-options no-redefine
  /**
   * Returns a new array with unique items, determined by the resolver function or property key
   * @param resolver A function that resolves the value to check uniqueness against,
   * or a property key to compare the value from each item
   * @returns A new `Array` with unique items
   */
  uniqueBy(resolver?: PropertyKey | ((value: bigint) => any)): BigInt64Array;
}

interface BigUint64Array { // @type-options no-redefine
  /**
   * Returns a new array with unique items, determined by the resolver function or property key
   * @param resolver A function that resolves the value to check uniqueness against,
   * or a property key to compare the value from each item
   * @returns A new `Array` with unique items
   */
  uniqueBy(resolver?: PropertyKey | ((value: bigint) => any)): BigUint64Array;
}
