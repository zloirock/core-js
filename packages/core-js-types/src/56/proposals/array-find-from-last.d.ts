// proposal stage: 4
// https://github.com/tc39/proposal-array-find-from-last

// For ensuring compatibility with TypeScript standard types, this code is based on:
// https://github.com/microsoft/TypeScript/blob/069de743dbd17b47cc2fc58e1d16da5410911284/src/lib/es2023.array.d.ts
// License: https://github.com/microsoft/TypeScript/blob/v5.9.3/LICENSE.txt

interface Array<T> { // @type-options no-redefine
  /**
   * Returns the value of the last element in the array where predicate is true, and undefined
   * otherwise.
   * @param predicate findLast calls predicate once for each element of the array, in descending
   * order, until it finds one where predicate returns true. If such an element is found, findLast
   * immediately returns that element value. Otherwise, findLast returns undefined.
   * @param thisArg If provided, it will be used as this value for each invocation of
   * predicate. If it is not provided, undefined is used instead.
   */
  findLast<S extends T>(predicate: (value: T, index: number, array: T[]) => value is S, thisArg?: any): S | undefined;
  findLast(predicate: (value: T, index: number, array: T[]) => unknown, thisArg?: any): T | undefined;

  /**
   * Returns the index of the last element in the array where predicate is true, and -1
   * otherwise.
   * @param predicate findLastIndex calls predicate once for each element of the array, in descending
   * order, until it finds one where predicate returns true. If such an element is found,
   * findLastIndex immediately returns that element index. Otherwise, findLastIndex returns -1.
   * @param thisArg If provided, it will be used as this value for each invocation of
   * predicate. If it is not provided, undefined is used instead.
   */
  findLastIndex(predicate: (value: T, index: number, array: T[]) => unknown, thisArg?: any): number;
}

interface Int8Array { // @type-options no-redefine
  /**
   * Returns the value of the last element in the array where predicate is true, and undefined
   * otherwise.
   * @param predicate findLast calls predicate once for each element of the array, in descending
   * order, until it finds one where predicate returns true. If such an element is found, findLast
   * immediately returns that element value. Otherwise, findLast returns undefined.
   * @param thisArg If provided, it will be used as this value for each invocation of
   * predicate. If it is not provided, undefined is used instead.
   */
  findLast<S extends number>(predicate: (value: number, index: number, array: this) => value is S, thisArg?: any): S | undefined;
  findLast(predicate: (value: number, index: number, array: this) => unknown, thisArg?: any): number | undefined;

  /**
   * Returns the index of the last element in the array where predicate is true, and -1
   * otherwise.
   * @param predicate findLastIndex calls predicate once for each element of the array, in descending
   * order, until it finds one where predicate returns true. If such an element is found,
   * findLastIndex immediately returns that element index. Otherwise, findLastIndex returns -1.
   * @param thisArg If provided, it will be used as this value for each invocation of
   * predicate. If it is not provided, undefined is used instead.
   */
  findLastIndex(predicate: (value: number, index: number, array: this) => unknown, thisArg?: any): number;
}

interface Uint8Array { // @type-options no-redefine
  /**
   * Returns the value of the last element in the array where predicate is true, and undefined
   * otherwise.
   * @param predicate findLast calls predicate once for each element of the array, in descending
   * order, until it finds one where predicate returns true. If such an element is found, findLast
   * immediately returns that element value. Otherwise, findLast returns undefined.
   * @param thisArg If provided, it will be used as this value for each invocation of
   * predicate. If it is not provided, undefined is used instead.
   */
  findLast<S extends number>(predicate: (value: number, index: number, array: this) => value is S, thisArg?: any): S | undefined;
  findLast(predicate: (value: number, index: number, array: this) => unknown, thisArg?: any): number | undefined;

  /**
   * Returns the index of the last element in the array where predicate is true, and -1
   * otherwise.
   * @param predicate findLastIndex calls predicate once for each element of the array, in descending
   * order, until it finds one where predicate returns true. If such an element is found,
   * findLastIndex immediately returns that element index. Otherwise, findLastIndex returns -1.
   * @param thisArg If provided, it will be used as this value for each invocation of
   * predicate. If it is not provided, undefined is used instead.
   */
  findLastIndex(predicate: (value: number, index: number, array: this) => unknown, thisArg?: any): number;
}

interface Uint8ClampedArray { // @type-options no-redefine
  /**
   * Returns the value of the last element in the array where predicate is true, and undefined
   * otherwise.
   * @param predicate findLast calls predicate once for each element of the array, in descending
   * order, until it finds one where predicate returns true. If such an element is found, findLast
   * immediately returns that element value. Otherwise, findLast returns undefined.
   * @param thisArg If provided, it will be used as this value for each invocation of
   * predicate. If it is not provided, undefined is used instead.
   */
  findLast<S extends number>(predicate: (value: number, index: number, array: this) => value is S, thisArg?: any): S | undefined;
  findLast(predicate: (value: number, index: number, array: this) => unknown, thisArg?: any): number | undefined;

  /**
   * Returns the index of the last element in the array where predicate is true, and -1
   * otherwise.
   * @param predicate findLastIndex calls predicate once for each element of the array, in descending
   * order, until it finds one where predicate returns true. If such an element is found,
   * findLastIndex immediately returns that element index. Otherwise, findLastIndex returns -1.
   * @param thisArg If provided, it will be used as this value for each invocation of
   * predicate. If it is not provided, undefined is used instead.
   */
  findLastIndex(predicate: (value: number, index: number, array: this) => unknown, thisArg?: any): number;
}

interface Int16Array { // @type-options no-redefine
  /**
   * Returns the value of the last element in the array where predicate is true, and undefined
   * otherwise.
   * @param predicate findLast calls predicate once for each element of the array, in descending
   * order, until it finds one where predicate returns true. If such an element is found, findLast
   * immediately returns that element value. Otherwise, findLast returns undefined.
   * @param thisArg If provided, it will be used as this value for each invocation of
   * predicate. If it is not provided, undefined is used instead.
   */
  findLast<S extends number>(predicate: (value: number, index: number, array: this) => value is S, thisArg?: any): S | undefined;
  findLast(predicate: (value: number, index: number, array: this) => unknown, thisArg?: any): number | undefined;

  /**
   * Returns the index of the last element in the array where predicate is true, and -1
   * otherwise.
   * @param predicate findLastIndex calls predicate once for each element of the array, in descending
   * order, until it finds one where predicate returns true. If such an element is found,
   * findLastIndex immediately returns that element index. Otherwise, findLastIndex returns -1.
   * @param thisArg If provided, it will be used as this value for each invocation of
   * predicate. If it is not provided, undefined is used instead.
   */
  findLastIndex(predicate: (value: number, index: number, array: this) => unknown, thisArg?: any): number;
}

interface Uint16Array { // @type-options no-redefine
  /**
   * Returns the value of the last element in the array where predicate is true, and undefined
   * otherwise.
   * @param predicate findLast calls predicate once for each element of the array, in descending
   * order, until it finds one where predicate returns true. If such an element is found, findLast
   * immediately returns that element value. Otherwise, findLast returns undefined.
   * @param thisArg If provided, it will be used as this value for each invocation of
   * predicate. If it is not provided, undefined is used instead.
   */
  findLast<S extends number>(predicate: (value: number, index: number, array: this) => value is S, thisArg?: any): S | undefined;
  findLast(predicate: (value: number, index: number, array: this) => unknown, thisArg?: any): number | undefined;

  /**
   * Returns the index of the last element in the array where predicate is true, and -1
   * otherwise.
   * @param predicate findLastIndex calls predicate once for each element of the array, in descending
   * order, until it finds one where predicate returns true. If such an element is found,
   * findLastIndex immediately returns that element index. Otherwise, findLastIndex returns -1.
   * @param thisArg If provided, it will be used as this value for each invocation of
   * predicate. If it is not provided, undefined is used instead.
   */
  findLastIndex(predicate: (value: number, index: number, array: this) => unknown, thisArg?: any): number;
}

interface Int32Array { // @type-options no-redefine
  /**
   * Returns the value of the last element in the array where predicate is true, and undefined
   * otherwise.
   * @param predicate findLast calls predicate once for each element of the array, in descending
   * order, until it finds one where predicate returns true. If such an element is found, findLast
   * immediately returns that element value. Otherwise, findLast returns undefined.
   * @param thisArg If provided, it will be used as this value for each invocation of
   * predicate. If it is not provided, undefined is used instead.
   */
  findLast<S extends number>(predicate: (value: number, index: number, array: this) => value is S, thisArg?: any): S | undefined;
  findLast(predicate: (value: number, index: number, array: this) => unknown, thisArg?: any): number | undefined;

  /**
   * Returns the index of the last element in the array where predicate is true, and -1
   * otherwise.
   * @param predicate findLastIndex calls predicate once for each element of the array, in descending
   * order, until it finds one where predicate returns true. If such an element is found,
   * findLastIndex immediately returns that element index. Otherwise, findLastIndex returns -1.
   * @param thisArg If provided, it will be used as this value for each invocation of
   * predicate. If it is not provided, undefined is used instead.
   */
  findLastIndex(predicate: (value: number, index: number, array: this) => unknown, thisArg?: any): number;
}

interface Uint32Array { // @type-options no-redefine
  /**
   * Returns the value of the last element in the array where predicate is true, and undefined
   * otherwise.
   * @param predicate findLast calls predicate once for each element of the array, in descending
   * order, until it finds one where predicate returns true. If such an element is found, findLast
   * immediately returns that element value. Otherwise, findLast returns undefined.
   * @param thisArg If provided, it will be used as this value for each invocation of
   * predicate. If it is not provided, undefined is used instead.
   */
  findLast<S extends number>(predicate: (value: number, index: number, array: this) => value is S, thisArg?: any): S | undefined;
  findLast(predicate: (value: number, index: number, array: this) => unknown, thisArg?: any): number | undefined;

  /**
   * Returns the index of the last element in the array where predicate is true, and -1
   * otherwise.
   * @param predicate findLastIndex calls predicate once for each element of the array, in descending
   * order, until it finds one where predicate returns true. If such an element is found,
   * findLastIndex immediately returns that element index. Otherwise, findLastIndex returns -1.
   * @param thisArg If provided, it will be used as this value for each invocation of
   * predicate. If it is not provided, undefined is used instead.
   */
  findLastIndex(predicate: (value: number, index: number, array: this) => unknown, thisArg?: any): number;
}

interface Float32Array { // @type-options no-redefine
  /**
   * Returns the value of the last element in the array where predicate is true, and undefined
   * otherwise.
   * @param predicate findLast calls predicate once for each element of the array, in descending
   * order, until it finds one where predicate returns true. If such an element is found, findLast
   * immediately returns that element value. Otherwise, findLast returns undefined.
   * @param thisArg If provided, it will be used as this value for each invocation of
   * predicate. If it is not provided, undefined is used instead.
   */
  findLast<S extends number>(predicate: (value: number, index: number, array: this) => value is S, thisArg?: any): S | undefined;
  findLast(predicate: (value: number, index: number, array: this) => unknown, thisArg?: any): number | undefined;

  /**
   * Returns the index of the last element in the array where predicate is true, and -1
   * otherwise.
   * @param predicate findLastIndex calls predicate once for each element of the array, in descending
   * order, until it finds one where predicate returns true. If such an element is found,
   * findLastIndex immediately returns that element index. Otherwise, findLastIndex returns -1.
   * @param thisArg If provided, it will be used as this value for each invocation of
   * predicate. If it is not provided, undefined is used instead.
   */
  findLastIndex(predicate: (value: number, index: number, array: this) => unknown, thisArg?: any): number;
}

interface Float64Array { // @type-options no-redefine
  /**
   * Returns the value of the last element in the array where predicate is true, and undefined
   * otherwise.
   * @param predicate findLast calls predicate once for each element of the array, in descending
   * order, until it finds one where predicate returns true. If such an element is found, findLast
   * immediately returns that element value. Otherwise, findLast returns undefined.
   * @param thisArg If provided, it will be used as this value for each invocation of
   * predicate. If it is not provided, undefined is used instead.
   */
  findLast<S extends number>(predicate: (value: number, index: number, array: this) => value is S, thisArg?: any): S | undefined;
  findLast(predicate: (value: number, index: number, array: this) => unknown, thisArg?: any): number | undefined;

  findLastIndex(predicate: (value: number, index: number, array: this) => unknown, thisArg?: any): number;
}

interface BigInt64Array { // @type-options no-redefine
  /**
   * Returns the value of the last element in the array where predicate is true, and undefined
   * otherwise.
   * @param predicate findLast calls predicate once for each element of the array, in descending
   * order, until it finds one where predicate returns true. If such an element is found, findLast
   * immediately returns that element value. Otherwise, findLast returns undefined.
   * @param thisArg If provided, it will be used as this value for each invocation of
   * predicate. If it is not provided, undefined is used instead.
   */
  findLast<S extends bigint>(predicate: (value: bigint, index: number, array: this) => value is S, thisArg?: any): S | undefined;
  findLast(predicate: (value: bigint, index: number, array: this) => unknown, thisArg?: any): bigint | undefined;

  /**
   * Returns the index of the last element in the array where predicate is true, and -1
   * otherwise.
   * @param predicate findLastIndex calls predicate once for each element of the array, in descending
   * order, until it finds one where predicate returns true. If such an element is found,
   * findLastIndex immediately returns that element index. Otherwise, findLastIndex returns -1.
   * @param thisArg If provided, it will be used as this value for each invocation of
   * predicate. If it is not provided, undefined is used instead.
   */
  findLastIndex(predicate: (value: bigint, index: number, array: this) => unknown, thisArg?: any): number;
}

interface BigUint64Array { // @type-options no-redefine
  /**
   * Returns the value of the last element in the array where predicate is true, and undefined
   * otherwise.
   * @param predicate findLast calls predicate once for each element of the array, in descending
   * order, until it finds one where predicate returns true. If such an element is found, findLast
   * immediately returns that element value. Otherwise, findLast returns undefined.
   * @param thisArg If provided, it will be used as this value for each invocation of
   * predicate. If it is not provided, undefined is used instead.
   */
  findLast<S extends bigint>(predicate: (value: bigint, index: number, array: this) => value is S, thisArg?: any): S | undefined;
  findLast(predicate: (value: bigint, index: number, array: this) => unknown, thisArg?: any): bigint | undefined;

  /**
   * Returns the index of the last element in the array where predicate is true, and -1
   * otherwise.
   * @param predicate findLastIndex calls predicate once for each element of the array, in descending
   * order, until it finds one where predicate returns true. If such an element is found,
   * findLastIndex immediately returns that element index. Otherwise, findLastIndex returns -1.
   * @param thisArg If provided, it will be used as this value for each invocation of
   * predicate. If it is not provided, undefined is used instead.
   */
  findLastIndex(predicate: (value: bigint, index: number, array: this) => unknown, thisArg?: any): number;
}
