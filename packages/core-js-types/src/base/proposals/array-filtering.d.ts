// https://github.com/tc39/proposal-array-filtering

interface Array<T> { // @type-options: no-redefine
  /**
   * Removes the items that return true
   * @param callbackFn - A function that accepts up to three arguments. The filterReject method calls the
   * callbackFn function one time for each element in the array.
   * @param thisArg - If provided, it will be used as this value for each invocation of
   * callbackFn function. If it is not provided, undefined is used instead.
   */
  filterReject(callbackFn: (value: T, index: number, target: T[]) => unknown, thisArg?: any): T[];
}

interface ReadonlyArray<T> { // @type-options: no-export
  /**
   * Removes the items that return true
   * @param callbackFn - A function that accepts up to three arguments. The filterReject method calls the
   * callbackFn function one time for each element in the array.
   * @param thisArg - If provided, it will be used as this value for each invocation of
   * callbackFn function. If it is not provided, undefined is used instead.
   */
  filterReject(callbackFn: (value: T, index: number, target: readonly T[]) => unknown, thisArg?: any): T[];
}

interface Int8Array { // @type-options: no-export
  /**
   * Removes the items that return true
   * @param callbackFn - A function that accepts up to three arguments. The filterReject method calls the
   * callbackFn function one time for each element in the array.
   * @param thisArg - If provided, it will be used as this value for each invocation of
   * callbackFn function. If it is not provided, undefined is used instead.
   */
  filterReject(callbackFn: (value: number, index: number, target: Int8Array) => unknown, thisArg?: any): Int8Array;
}

interface Uint8Array { // @type-options: no-export
  /**
   * Removes the items that return true
   * @param callbackFn - A function that accepts up to three arguments. The filterReject method calls the
   * callbackFn function one time for each element in the array.
   * @param thisArg - If provided, it will be used as this value for each invocation of
   * callbackFn function. If it is not provided, undefined is used instead.
   */
  filterReject(callbackFn: (value: number, index: number, target: Uint8Array) => unknown, thisArg?: any): Uint8Array;
}

interface Uint8ClampedArray { // @type-options: no-export
  /**
   * Removes the items that return true
   * @param callbackFn - A function that accepts up to three arguments. The filterReject method calls the
   * callbackFn function one time for each element in the array.
   * @param thisArg - If provided, it will be used as this value for each invocation of
   * callbackFn function. If it is not provided, undefined is used instead.
   */
  filterReject(callbackFn: (value: number, index: number, target: Uint8ClampedArray) => unknown, thisArg?: any): Uint8ClampedArray;
}

interface Int16Array { // @type-options: no-export
  /**
   * Removes the items that return true
   * @param callbackFn - A function that accepts up to three arguments. The filterReject method calls the
   * callbackFn function one time for each element in the array.
   * @param thisArg - If provided, it will be used as this value for each invocation of
   * callbackFn function. If it is not provided, undefined is used instead.
   */
  filterReject(callbackFn: (value: number, index: number, target: Int16Array) => unknown, thisArg?: any): Int16Array;
}

interface Uint16Array { // @type-options: no-export
  /**
   * Removes the items that return true
   * @param callbackFn - A function that accepts up to three arguments. The filterReject method calls the
   * callbackFn function one time for each element in the array.
   * @param thisArg - If provided, it will be used as this value for each invocation of
   * callbackFn function. If it is not provided, undefined is used instead.
   */
  filterReject(callbackFn: (value: number, index: number, target: Uint16Array) => unknown, thisArg?: any): Uint16Array;
}

interface Int32Array { // @type-options: no-export
  /**
   * Removes the items that return true
   * @param callbackFn - A function that accepts up to three arguments. The filterReject method calls the
   * callbackFn function one time for each element in the array.
   * @param thisArg - If provided, it will be used as this value for each invocation of
   * callbackFn function. If it is not provided, undefined is used instead.
   */
  filterReject(callbackFn: (value: number, index: number, target: Int32Array) => unknown, thisArg?: any): Int32Array;
}

interface Uint32Array { // @type-options: no-export
  /**
   * Removes the items that return true
   * @param callbackFn - A function that accepts up to three arguments. The filterReject method calls the
   * callbackFn function one time for each element in the array.
   * @param thisArg - If provided, it will be used as this value for each invocation of
   * callbackFn function. If it is not provided, undefined is used instead.
   */
  filterReject(callbackFn: (value: number, index: number, target: Uint32Array) => unknown, thisArg?: any): Uint32Array;
}

interface Float32Array { // @type-options: no-export
  /**
   * Removes the items that return true
   * @param callbackFn - A function that accepts up to three arguments. The filterReject method calls the
   * callbackFn function one time for each element in the array.
   * @param thisArg - If provided, it will be used as this value for each invocation of
   * callbackFn function. If it is not provided, undefined is used instead.
   */
  filterReject(callbackFn: (value: number, index: number, target: Float32Array) => unknown, thisArg?: any): Float32Array;
}

interface Float64Array { // @type-options: no-export
  /**
   * Removes the items that return true
   * @param callbackFn - A function that accepts up to three arguments. The filterReject method calls the
   * callbackFn function one time for each element in the array.
   * @param thisArg - If provided, it will be used as this value for each invocation of
   * callbackFn function. If it is not provided, undefined is used instead.
   */
  filterReject(callbackFn: (value: number, index: number, target: Float64Array) => unknown, thisArg?: any): Float64Array;
}

interface BigInt64Array { // @type-options: no-export
  /**
   * Removes the items that return true
   * @param callbackFn - A function that accepts up to three arguments. The filterReject method calls the
   * callbackFn function one time for each element in the array.
   * @param thisArg - If provided, it will be used as this value for each invocation of
   * callbackFn function. If it is not provided, undefined is used instead.
   */
  filterReject(callbackFn: (value: bigint, index: number, target: BigInt64Array) => unknown, thisArg?: any): BigInt64Array;
}

interface BigUint64Array { // @type-options: no-export
  /**
   * Removes the items that return true
   * @param callbackFn - A function that accepts up to three arguments. The filterReject method calls the
   * callbackFn function one time for each element in the array.
   * @param thisArg - If provided, it will be used as this value for each invocation of
   * callbackFn function. If it is not provided, undefined is used instead.
   */
  filterReject(callbackFn: (value: bigint, index: number, target: BigUint64Array) => unknown, thisArg?: any): BigUint64Array;
}
