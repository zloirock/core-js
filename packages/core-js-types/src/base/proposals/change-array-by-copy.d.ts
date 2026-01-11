// https://github.com/tc39/proposal-change-array-by-copy

// For ensuring compatibility with TypeScript standard types, this code is aligned with:
// https://github.com/microsoft/TypeScript/blob/6afd0fb73fa18a48021ed54f44a0c51794519bf6/src/lib/es2023.array.d.ts
// License: https://github.com/microsoft/TypeScript/blob/v5.9.3/LICENSE.txt

interface Array<T> { // @type-options no-redefine
  /**
   * @returns A copy of an array with its elements reversed.
   */
  toReversed(): T[];

  /**
   * Returns a copy of an array with its elements sorted.
   * @param compareFn Function used to determine the order of the elements. It is expected to return
   * a negative value if the first argument is less than the second argument, zero if they're equal, and a positive
   * value otherwise. If omitted, the elements are sorted in ascending, UTF-16 code unit order.
   * ```ts
   * [11, 2, 22, 1].toSorted((a, b) => a - b) // [1, 2, 11, 22]
   * ```
   */
  toSorted(compareFn?: (a: T, b: T) => number): T[];

  /**
   * Copies an array and removes elements and, if necessary, inserts new elements in their place. Returns the copied array.
   * @param start The zero-based location in the array from which to start removing elements.
   * @param deleteCount The number of elements to remove.
   * @param items Elements to insert into the copied array in place of the deleted elements.
   * @returns The copied array.
   */
  toSpliced(start: number, deleteCount: number, ...items: T[]): T[];
  /**
   * Copies an array and removes elements while returning the remaining elements.
   * @param start The zero-based location in the array from which to start removing elements.
   * @param deleteCount The number of elements to remove.
   * @returns A copy of the original array with the remaining elements.
   */
  toSpliced(start: number, deleteCount?: number): T[];

  /**
   * Copies an array, then overwrites the value at the provided index with the
   * given value. If the index is negative, then it replaces from the end
   * of the array.
   * @param index The index of the value to overwrite. If the index is
   * negative, then it replaces from the end of the array.
   * @param value The value to write into the copied array.
   * @returns The copied array with the updated value.
   */
  with(index: number, value: T): T[];
}

interface ReadonlyArray<T> { // @type-options no-export
  /**
   * @returns A copy of an array with its elements reversed.
   */
  toReversed(): T[];

  /**
   * Returns a copy of an array with its elements sorted.
   * @param compareFn Function used to determine the order of the elements. It is expected to return
   * a negative value if the first argument is less than the second argument, zero if they're equal, and a positive
   * value otherwise. If omitted, the elements are sorted in ascending, UTF-16 code unit order.
   * ```ts
   * [11, 2, 22, 1].toSorted((a, b) => a - b) // [1, 2, 11, 22]
   * ```
   */
  toSorted(compareFn?: (a: T, b: T) => number): T[];

  /**
   * Copies an array and removes elements and, if necessary, inserts new elements in their place. Returns the copied array.
   * @param start The zero-based location in the array from which to start removing elements.
   * @param deleteCount The number of elements to remove.
   * @param items Elements to insert into the copied array in place of the deleted elements.
   * @returns The copied array.
   */
  toSpliced(start: number, deleteCount: number, ...items: T[]): T[];
  /**
   * Copies an array and removes elements while returning the remaining elements.
   * @param start The zero-based location in the array from which to start removing elements.
   * @param deleteCount The number of elements to remove.
   * @returns A copy of the original array with the remaining elements.
   */
  toSpliced(start: number, deleteCount?: number): T[];

  /**
   * Copies an array, then overwrites the value at the provided index with the
   * given value. If the index is negative, then it replaces from the end
   * of the array.
   * @param index The index of the value to overwrite. If the index is
   * negative, then it replaces from the end of the array.
   * @param value The value to write into the copied array.
   * @returns The copied array with the updated value.
   */
  with(index: number, value: T): T[];
}

interface Int8Array { // @type-options no-export
  /**
   * @returns A copy of an array with its elements reversed.
   */
  toReversed(): Int8Array;

  /**
   * Copies and sorts the array.
   * @param compareFn Function used to determine the order of the elements. It is expected to return
   * a negative value if the first argument is less than the second argument, zero if they're equal, and a positive
   * value otherwise. If omitted, the elements are sorted in ascending order.
   * ```ts
   * const myNums = Int8Array.from([11, 2, 22, 1]);
   * myNums.toSorted((a, b) => a - b) // Int8Array(4) [1, 2, 11, 22]
   * ```
   */
  toSorted(compareFn?: (a: number, b: number) => number): Int8Array;

  /**
   * Copies the array and inserts the given number at the provided index.
   * @param index The index of the value to overwrite. If the index is
   * negative, then it replaces from the end of the array.
   * @param value The value to insert into the copied array.
   * @returns A copy of the original array with the inserted value.
   */
  with(index: number, value: number): Int8Array;
}

interface Uint8Array { // @type-options no-export
  /**
   * @returns A copy of an array with its elements reversed.
   */
  toReversed(): Uint8Array;

  /**
   * Copies and sorts the array.
   * @param compareFn Function used to determine the order of the elements. It is expected to return
   * a negative value if the first argument is less than the second argument, zero if they're equal, and a positive
   * value otherwise. If omitted, the elements are sorted in ascending order.
   * ```ts
   * const myNums = Uint8Array.from([11, 2, 22, 1]);
   * myNums.toSorted((a, b) => a - b) // Uint8Array(4) [1, 2, 11, 22]
   * ```
   */
  toSorted(compareFn?: (a: number, b: number) => number): Uint8Array;

  /**
   * Copies the array and inserts the given number at the provided index.
   * @param index The index of the value to overwrite. If the index is
   * negative, then it replaces from the end of the array.
   * @param value The value to insert into the copied array.
   * @returns A copy of the original array with the inserted value.
   */
  with(index: number, value: number): Uint8Array;
}

interface Uint8ClampedArray { // @type-options no-export
  /**
   * @returns A copy of an array with its elements reversed.
   */
  toReversed(): Uint8ClampedArray;

  /**
   * Copies and sorts the array.
   * @param compareFn Function used to determine the order of the elements. It is expected to return
   * a negative value if the first argument is less than the second argument, zero if they're equal, and a positive
   * value otherwise. If omitted, the elements are sorted in ascending order.
   * ```ts
   * const myNums = Uint8ClampedArray.from([11, 2, 22, 1]);
   * myNums.toSorted((a, b) => a - b) // Uint8ClampedArray(4) [1, 2, 11, 22]
   * ```
   */
  toSorted(compareFn?: (a: number, b: number) => number): Uint8ClampedArray;

  /**
   * Copies the array and inserts the given number at the provided index.
   * @param index The index of the value to overwrite. If the index is
   * negative, then it replaces from the end of the array.
   * @param value The value to insert into the copied array.
   * @returns A copy of the original array with the inserted value.
   */
  with(index: number, value: number): Uint8ClampedArray;
}

interface Int16Array { // @type-options no-export
  /**
   * @returns A copy of an array with its elements reversed.
   */
  toReversed(): Int16Array;

  /**
   * Copies and sorts the array.
   * @param compareFn Function used to determine the order of the elements. It is expected to return
   * a negative value if the first argument is less than the second argument, zero if they're equal, and a positive
   * value otherwise. If omitted, the elements are sorted in ascending order.
   * ```ts
   * const myNums = Int16Array.from([11, 2, -22, 1]);
   * myNums.toSorted((a, b) => a - b) // Int16Array(4) [-22, 1, 2, 11]
   * ```
   */
  toSorted(compareFn?: (a: number, b: number) => number): Int16Array;

  /**
   * Copies the array and inserts the given number at the provided index.
   * @param index The index of the value to overwrite. If the index is
   * negative, then it replaces from the end of the array.
   * @param value The value to insert into the copied array.
   * @returns A copy of the original array with the inserted value.
   */
  with(index: number, value: number): Int16Array;
}

interface Uint16Array { // @type-options no-export
  /**
   * @returns A copy of an array with its elements reversed.
   */
  toReversed(): Uint16Array;

  /**
   * Copies and sorts the array.
   * @param compareFn Function used to determine the order of the elements. It is expected to return
   * a negative value if the first argument is less than the second argument, zero if they're equal, and a positive
   * value otherwise. If omitted, the elements are sorted in ascending order.
   * ```ts
   * const myNums = Uint16Array.from([11, 2, 22, 1]);
   * myNums.toSorted((a, b) => a - b) // Uint16Array(4) [1, 2, 11, 22]
   * ```
   */
  toSorted(compareFn?: (a: number, b: number) => number): Uint16Array;

  /**
   * Copies the array and inserts the given number at the provided index.
   * @param index The index of the value to overwrite. If the index is
   * negative, then it replaces from the end of the array.
   * @param value The value to insert into the copied array.
   * @returns A copy of the original array with the inserted value.
   */
  with(index: number, value: number): Uint16Array;
}

interface Int32Array { // @type-options no-export
  /**
   * @returns A copy of an array with its elements reversed.
   */
  toReversed(): Int32Array;

  /**
   * Copies and sorts the array.
   * @param compareFn Function used to determine the order of the elements. It is expected to return
   * a negative value if the first argument is less than the second argument, zero if they're equal, and a positive
   * value otherwise. If omitted, the elements are sorted in ascending order.
   * ```ts
   * const myNums = Int32Array.from([11, 2, -22, 1]);
   * myNums.toSorted((a, b) => a - b) // Int32Array(4) [-22, 1, 2, 11]
   * ```
   */
  toSorted(compareFn?: (a: number, b: number) => number): Int32Array;

  /**
   * Copies the array and inserts the given number at the provided index.
   * @param index The index of the value to overwrite. If the index is
   * negative, then it replaces from the end of the array.
   * @param value The value to insert into the copied array.
   * @returns A copy of the original array with the inserted value.
   */
  with(index: number, value: number): Int32Array;
}

interface Uint32Array { // @type-options no-export
  /**
   * @returns A copy of an array with its elements reversed.
   */
  toReversed(): Uint32Array;

  /**
   * Copies and sorts the array.
   * @param compareFn Function used to determine the order of the elements. It is expected to return
   * a negative value if the first argument is less than the second argument, zero if they're equal, and a positive
   * value otherwise. If omitted, the elements are sorted in ascending order.
   * ```ts
   * const myNums = Int32Array.from([11, 2, -22, 1]);
   * myNums.toSorted((a, b) => a - b) // Int32Array(4) [-22, 1, 2, 11]
   * ```
   */
  toSorted(compareFn?: (a: number, b: number) => number): Uint32Array;

  /**
   * Copies the array and inserts the given number at the provided index.
   * @param index The index of the value to overwrite. If the index is
   * negative, then it replaces from the end of the array.
   * @param value The value to insert into the copied array.
   * @returns A copy of the original array with the inserted value.
   */
  with(index: number, value: number): Uint32Array;
}

interface Float32Array { // @type-options no-export
  /**
   * @returns A copy of an array with its elements reversed.
   */
  toReversed(): Float32Array;

  /**
   * Copies and sorts the array.
   * @param compareFn Function used to determine the order of the elements. It is expected to return
   * a negative value if the first argument is less than the second argument, zero if they're equal, and a positive
   * value otherwise. If omitted, the elements are sorted in ascending order.
   * ```ts
   * const myNums = Float32Array.from([11.25, 2, -22.5, 1]);
   * myNums.toSorted((a, b) => a - b) // Float32Array(4) [-22.5, 1, 2, 11.5]
   * ```
   */
  toSorted(compareFn?: (a: number, b: number) => number): Float32Array;

  /**
   * Copies the array and inserts the given number at the provided index.
   * @param index The index of the value to overwrite. If the index is
   * negative, then it replaces from the end of the array.
   * @param value The value to insert into the copied array.
   * @returns A copy of the original array with the inserted value.
   */
  with(index: number, value: number): Float32Array;
}

interface Float64Array { // @type-options no-export
  /**
   * @returns A copy of an array with its elements reversed.
   */
  toReversed(): Float64Array;

  /**
   * Copies and sorts the array.
   * @param compareFn Function used to determine the order of the elements. It is expected to return
   * a negative value if the first argument is less than the second argument, zero if they're equal, and a positive
   * value otherwise. If omitted, the elements are sorted in ascending order.
   * ```ts
   * const myNums = Float64Array.from([11.25, 2, -22.5, 1]);
   * myNums.toSorted((a, b) => a - b) // Float64Array(4) [-22.5, 1, 2, 11.5]
   * ```
   */
  toSorted(compareFn?: (a: number, b: number) => number): Float64Array;

  /**
   * Copies the array and inserts the given number at the provided index.
   * @param index The index of the value to overwrite. If the index is
   * negative, then it replaces from the end of the array.
   * @param value The value to insert into the copied array.
   * @returns A copy of the original array with the inserted value.
   */
  with(index: number, value: number): Float64Array;
}

interface BigInt64Array { // @type-options no-export
  /**
   * @returns A copy of an array with its elements reversed.
   */
  toReversed(): BigInt64Array;

  /**
   * Copies and sorts the array.
   * @param compareFn Function used to determine the order of the elements. It is expected to return
   * a negative value if the first argument is less than the second argument, zero if they're equal, and a positive
   * value otherwise. If omitted, the elements are sorted in ascending order.
   * ```ts
   * const myNums = BigInt64Array.from([11n, 2n, -22n, 1n]);
   * myNums.toSorted((a, b) => Number(a - b)) // BigInt64Array(4) [-22n, 1n, 2n, 11n]
   * ```
   */
  toSorted(compareFn?: (a: bigint, b: bigint) => number): BigInt64Array;

  /**
   * Copies the array and inserts the given bigint at the provided index.
   * @param index The index of the value to overwrite. If the index is
   * negative, then it replaces from the end of the array.
   * @param value The value to insert into the copied array.
   * @returns A copy of the original array with the inserted value.
   */
  with(index: number, value: bigint): BigInt64Array;
}

interface BigUint64Array { // @type-options no-export
  /**
   * @returns A copy of an array with its elements reversed.
   */
  toReversed(): BigUint64Array;

  /**
   * Copies and sorts the array.
   * @param compareFn Function used to determine the order of the elements. It is expected to return
   * a negative value if the first argument is less than the second argument, zero if they're equal, and a positive
   * value otherwise. If omitted, the elements are sorted in ascending order.
   * ```ts
   * const myNums = BigUint64Array.from([11n, 2n, 22n, 1n]);
   * myNums.toSorted((a, b) => Number(a - b)) // BigUint64Array(4) [1n, 2n, 11n, 22n]
   * ```
   */
  toSorted(compareFn?: (a: bigint, b: bigint) => number): BigUint64Array;

  /**
   * Copies the array and inserts the given bigint at the provided index.
   * @param index The index of the value to overwrite. If the index is
   * negative, then it replaces from the end of the array.
   * @param value The value to insert into the copied array.
   * @returns A copy of the original array with the inserted value.
   */
  with(index: number, value: bigint): BigUint64Array;
}
