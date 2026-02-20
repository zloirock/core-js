// https://github.com/tc39/proposal-array-unique

interface Array<T> { // @type-options: no-redefine
  /**
   * Returns a new array with unique items, determined by the resolver function or property key
   * @param resolver - A function that resolves the value to check uniqueness against,
   * or a property key to compare the value from each item
   * @returns A new `Array` with unique items
   */
  uniqueBy(resolver?: keyof T | ((value: T) => unknown)): Array<T>;
}

interface ReadonlyArray<T> { // @type-options: no-export
  /**
   * Returns a new array with unique items, determined by the resolver function or property key
   * @param resolver - A function that resolves the value to check uniqueness against,
   * or a property key to compare the value from each item
   * @returns A new `Array` with unique items
   */
  uniqueBy(resolver?: keyof T | ((value: T) => unknown)): Array<T>;
}

interface Int8Array { // @type-options: no-export
  /**
   * Returns a new array with unique items, determined by the resolver function or property key
   * @param resolver - A function that resolves the value to check uniqueness against,
   * or a property key to compare the value from each item
   * @returns A new `Array` with unique items
   */
  uniqueBy(resolver?: PropertyKey | ((value: number) => unknown)): Int8Array;
}

interface Uint8Array { // @type-options: no-export
  /**
   * Returns a new array with unique items, determined by the resolver function or property key
   * @param resolver - A function that resolves the value to check uniqueness against,
   * or a property key to compare the value from each item
   * @returns A new `Array` with unique items
   */
  uniqueBy(resolver?: PropertyKey | ((value: number) => unknown)): Uint8Array;
}

interface Uint8ClampedArray { // @type-options: no-export
  /**
   * Returns a new array with unique items, determined by the resolver function or property key
   * @param resolver - A function that resolves the value to check uniqueness against,
   * or a property key to compare the value from each item
   * @returns A new `Array` with unique items
   */
  uniqueBy(resolver?: PropertyKey | ((value: number) => unknown)): Uint8ClampedArray;
}

interface Int16Array { // @type-options: no-export
  /**
   * Returns a new array with unique items, determined by the resolver function or property key
   * @param resolver - A function that resolves the value to check uniqueness against,
   * or a property key to compare the value from each item
   * @returns A new `Array` with unique items
   */
  uniqueBy(resolver?: PropertyKey | ((value: number) => unknown)): Int16Array;
}

interface Uint16Array { // @type-options: no-export
  /**
   * Returns a new array with unique items, determined by the resolver function or property key
   * @param resolver - A function that resolves the value to check uniqueness against,
   * or a property key to compare the value from each item
   * @returns A new `Array` with unique items
   */
  uniqueBy(resolver?: PropertyKey | ((value: number) => unknown)): Uint16Array;
}

interface Int32Array { // @type-options: no-export
  /**
   * Returns a new array with unique items, determined by the resolver function or property key
   * @param resolver - A function that resolves the value to check uniqueness against,
   * or a property key to compare the value from each item
   * @returns A new `Array` with unique items
   */
  uniqueBy(resolver?: PropertyKey | ((value: number) => unknown)): Int32Array;
}

interface Uint32Array { // @type-options: no-export
  /**
   * Returns a new array with unique items, determined by the resolver function or property key
   * @param resolver - A function that resolves the value to check uniqueness against,
   * or a property key to compare the value from each item
   * @returns A new `Array` with unique items
   */
  uniqueBy(resolver?: PropertyKey | ((value: number) => unknown)): Uint32Array;
}

interface Float32Array { // @type-options: no-export
  /**
   * Returns a new array with unique items, determined by the resolver function or property key
   * @param resolver - A function that resolves the value to check uniqueness against,
   * or a property key to compare the value from each item
   * @returns A new `Array` with unique items
   */
  uniqueBy(resolver?: PropertyKey | ((value: number) => unknown)): Float32Array;
}

interface Float64Array { // @type-options: no-export
  /**
   * Returns a new array with unique items, determined by the resolver function or property key
   * @param resolver - A function that resolves the value to check uniqueness against,
   * or a property key to compare the value from each item
   * @returns A new `Array` with unique items
   */
  uniqueBy(resolver?: PropertyKey | ((value: number) => unknown)): Float64Array;
}

interface BigInt64Array { // @type-options: no-export
  /**
   * Returns a new array with unique items, determined by the resolver function or property key
   * @param resolver - A function that resolves the value to check uniqueness against,
   * or a property key to compare the value from each item
   * @returns A new `Array` with unique items
   */
  uniqueBy(resolver?: PropertyKey | ((value: bigint) => unknown)): BigInt64Array;
}

interface BigUint64Array { // @type-options: no-export
  /**
   * Returns a new array with unique items, determined by the resolver function or property key
   * @param resolver - A function that resolves the value to check uniqueness against,
   * or a property key to compare the value from each item
   * @returns A new `Array` with unique items
   */
  uniqueBy(resolver?: PropertyKey | ((value: bigint) => unknown)): BigUint64Array;
}
