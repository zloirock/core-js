// proposal stage: 1
// https://github.com/tc39/proposal-array-unique

interface Array<T> {
  /**
   * Returns a new array with unique items, determined by the resolver function or property key
   * @param resolver A function that resolves the value to check uniqueness against,
   * or a property key to compare the value from each item
   * @returns A new `Array` with unique items
   */
  uniqueBy(resolver?: keyof T | ((value: T) => any)): Array<T>;
}

interface Int8Array {
  /**
   * Returns a new array with unique items, determined by the resolver function or property key
   * @param resolver A function that resolves the value to check uniqueness against,
   * or a property key to compare the value from each item
   * @returns A new `Array` with unique items
   */
  uniqueBy(resolver?: PropertyKey | ((value: number) => any)): Int8Array;
}

interface Uint8Array {
  /**
   * Returns a new array with unique items, determined by the resolver function or property key
   * @param resolver A function that resolves the value to check uniqueness against,
   * or a property key to compare the value from each item
   * @returns A new `Array` with unique items
   */
  uniqueBy(resolver?: PropertyKey | ((value: number) => any)): Uint8Array;
}

interface Uint8ClampedArray {
  /**
   * Returns a new array with unique items, determined by the resolver function or property key
   * @param resolver A function that resolves the value to check uniqueness against,
   * or a property key to compare the value from each item
   * @returns A new `Array` with unique items
   */
  uniqueBy(resolver?: PropertyKey | ((value: number) => any)): Uint8ClampedArray;
}

interface Int16Array {
  /**
   * Returns a new array with unique items, determined by the resolver function or property key
   * @param resolver A function that resolves the value to check uniqueness against,
   * or a property key to compare the value from each item
   * @returns A new `Array` with unique items
   */
  uniqueBy(resolver?: PropertyKey | ((value: number) => any)): Int16Array;
}

interface Uint16Array {
  /**
   * Returns a new array with unique items, determined by the resolver function or property key
   * @param resolver A function that resolves the value to check uniqueness against,
   * or a property key to compare the value from each item
   * @returns A new `Array` with unique items
   */
  uniqueBy(resolver?: PropertyKey | ((value: number) => any)): Uint16Array;
}

interface Int32Array {
  /**
   * Returns a new array with unique items, determined by the resolver function or property key
   * @param resolver A function that resolves the value to check uniqueness against,
   * or a property key to compare the value from each item
   * @returns A new `Array` with unique items
   */
  uniqueBy(resolver?: PropertyKey | ((value: number) => any)): Int32Array;
}

interface Uint32Array {
  /**
   * Returns a new array with unique items, determined by the resolver function or property key
   * @param resolver A function that resolves the value to check uniqueness against,
   * or a property key to compare the value from each item
   * @returns A new `Array` with unique items
   */
  uniqueBy(resolver?: PropertyKey | ((value: number) => any)): Uint32Array;
}

interface Float32Array {
  /**
   * Returns a new array with unique items, determined by the resolver function or property key
   * @param resolver A function that resolves the value to check uniqueness against,
   * or a property key to compare the value from each item
   * @returns A new `Array` with unique items
   */
  uniqueBy(resolver?: PropertyKey | ((value: number) => any)): Float32Array;
}

interface Float64Array {
  /**
   * Returns a new array with unique items, determined by the resolver function or property key
   * @param resolver A function that resolves the value to check uniqueness against,
   * or a property key to compare the value from each item
   * @returns A new `Array` with unique items
   */
  uniqueBy(resolver?: PropertyKey | ((value: number) => any)): Float64Array;
}

interface BigInt64Array {
  /**
   * Returns a new array with unique items, determined by the resolver function or property key
   * @param resolver A function that resolves the value to check uniqueness against,
   * or a property key to compare the value from each item
   * @returns A new `Array` with unique items
   */
  uniqueBy(resolver?: PropertyKey | ((value: bigint) => any)): BigInt64Array;
}

interface BigUint64Array {
  /**
   * Returns a new array with unique items, determined by the resolver function or property key
   * @param resolver A function that resolves the value to check uniqueness against,
   * or a property key to compare the value from each item
   * @returns A new `Array` with unique items
   */
  uniqueBy(resolver?: PropertyKey | ((value: bigint) => any)): BigUint64Array;
}
