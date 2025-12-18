// https://github.com/tc39/proposal-array-filtering

interface Array<T> { // @type-options no-redefine
  /**
   * Removes the items that return true
   * @param callbackFn A function that accepts up to three arguments. The filterReject method calls the
   * callbackFn function one time for each element in the array.
   * @param thisArg If provided, it will be used as this value for each invocation of
   * predicate. If it is not provided, undefined is used instead.
   */
  filterReject(callbackFn: (value: T, index: number, target: T[]) => boolean, thisArg?: any): T[];
}

interface Int8Array { // @type-options no-export
  /**
   * Removes the items that return true
   * @param callbackFn A function that accepts up to three arguments. The filterReject method calls the
   * callbackFn function one time for each element in the array.
   * @param thisArg If provided, it will be used as this value for each invocation of
   * predicate. If it is not provided, undefined is used instead.
   */
  filterReject(callbackFn: (value: number, index: number, target: Int8Array) => boolean, thisArg?: any): Int8Array;
}

interface Uint8Array { // @type-options no-export
  /**
   * Removes the items that return true
   * @param callbackFn A function that accepts up to three arguments. The filterReject method calls the
   * callbackFn function one time for each element in the array.
   * @param thisArg If provided, it will be used as this value for each invocation of
   * predicate. If it is not provided, undefined is used instead.
   */
  filterReject(callbackFn: (value: number, index: number, target: Uint8Array) => boolean, thisArg?: any): Uint8Array;
}

interface Uint8ClampedArray { // @type-options no-export
  /**
   * Removes the items that return true
   * @param callbackFn A function that accepts up to three arguments. The filterReject method calls the
   * callbackFn function one time for each element in the array.
   * @param thisArg If provided, it will be used as this value for each invocation of
   * predicate. If it is not provided, undefined is used instead.
   */
  filterReject(callbackFn: (value: number, index: number, target: Uint8ClampedArray) => boolean, thisArg?: any): Uint8ClampedArray;
}

interface Int16Array { // @type-options no-export
  /**
   * Removes the items that return true
   * @param callbackFn A function that accepts up to three arguments. The filterReject method calls the
   * callbackFn function one time for each element in the array.
   * @param thisArg If provided, it will be used as this value for each invocation of
   * predicate. If it is not provided, undefined is used instead.
   */
  filterReject(callbackFn: (value: number, index: number, target: Int16Array) => boolean, thisArg?: any): Int16Array;
}

interface Uint16Array { // @type-options no-export
  /**
   * Removes the items that return true
   * @param callbackFn A function that accepts up to three arguments. The filterReject method calls the
   * callbackFn function one time for each element in the array.
   * @param thisArg If provided, it will be used as this value for each invocation of
   * predicate. If it is not provided, undefined is used instead.
   */
  filterReject(callbackFn: (value: number, index: number, target: Uint16Array) => boolean, thisArg?: any): Uint16Array;
}

interface Int32Array { // @type-options no-export
  /**
   * Removes the items that return true
   * @param callbackFn A function that accepts up to three arguments. The filterReject method calls the
   * callbackFn function one time for each element in the array.
   * @param thisArg If provided, it will be used as this value for each invocation of
   * predicate. If it is not provided, undefined is used instead.
   */
  filterReject(callbackFn: (value: number, index: number, target: Int32Array) => boolean, thisArg?: any): Int32Array;
}

interface Uint32Array { // @type-options no-export
  /**
   * Removes the items that return true
   * @param callbackFn A function that accepts up to three arguments. The filterReject method calls the
   * callbackFn function one time for each element in the array.
   * @param thisArg If provided, it will be used as this value for each invocation of
   * predicate. If it is not provided, undefined is used instead.
   */
  filterReject(callbackFn: (value: number, index: number, target: Uint32Array) => boolean, thisArg?: any): Uint32Array;
}

interface Float32Array { // @type-options no-export
  /**
   * Removes the items that return true
   * @param callbackFn A function that accepts up to three arguments. The filterReject method calls the
   * callbackFn function one time for each element in the array.
   * @param thisArg If provided, it will be used as this value for each invocation of
   * predicate. If it is not provided, undefined is used instead.
   */
  filterReject(callbackFn: (value: number, index: number, target: Float32Array) => boolean, thisArg?: any): Float32Array;
}

interface Float64Array { // @type-options no-export
  /**
   * Removes the items that return true
   * @param callbackFn A function that accepts up to three arguments. The filterReject method calls the
   * callbackFn function one time for each element in the array.
   * @param thisArg If provided, it will be used as this value for each invocation of
   * predicate. If it is not provided, undefined is used instead.
   */
  filterReject(callbackFn: (value: number, index: number, target: Float64Array) => boolean, thisArg?: any): Float64Array;
}

interface BigInt64Array { // @type-options no-export
  /**
   * Removes the items that return true
   * @param callbackFn A function that accepts up to three arguments. The filterReject method calls the
   * callbackFn function one time for each element in the array.
   * @param thisArg If provided, it will be used as this value for each invocation of
   * predicate. If it is not provided, undefined is used instead.
   */
  filterReject(callbackFn: (value: bigint, index: number, target: BigInt64Array) => boolean, thisArg?: any): BigInt64Array;
}

interface BigUint64Array { // @type-options no-export
  /**
   * Removes the items that return true
   * @param callbackFn A function that accepts up to three arguments. The filterReject method calls the
   * callbackFn function one time for each element in the array.
   * @param thisArg If provided, it will be used as this value for each invocation of
   * predicate. If it is not provided, undefined is used instead.
   */
  filterReject(callbackFn: (value: bigint, index: number, target: BigUint64Array) => boolean, thisArg?: any): BigUint64Array;
}
