// https://github.com/tc39/proposal-relative-indexing-method

// For ensuring compatibility with TypeScript standard types, this code is aligned with:
// https://github.com/microsoft/TypeScript/blob/3e9236361fa97a9e6c685f4833ac457ae2d8c50a/tsc/internal/bundled/libs/lib.es2022.array.d.ts
// https://github.com/microsoft/TypeScript/blob/3e9236361fa97a9e6c685f4833ac457ae2d8c50a/tsc/internal/bundled/libs/lib.es2022.string.d.ts
// License: https://github.com/microsoft/TypeScript/blob/v7.1-beta/LICENSE.txt

interface String {
  /**
   * Returns a new String consisting of the single UTF-16 code unit located at the specified index.
   * @param index - The zero-based index of the desired code unit. A negative index will count back from the last item.
   */
  at(index: number): string | undefined;
}

interface Array<T> {
  /**
   * Returns the item located at the specified index.
   * @param index - The zero-based index of the desired item. A negative index will count back from the last item.
   */
  at(index: number): T | undefined;
}

interface ReadonlyArray<T> {
  /**
   * Returns the item located at the specified index.
   * @param index - The zero-based index of the desired item. A negative index will count back from the last item.
   */
  at(index: number): T | undefined;
}

interface Int8Array {
  /**
   * Returns the item located at the specified index.
   * @param index - The zero-based index of the desired item. A negative index will count back from the last item.
   */
  at(index: number): number | undefined;
}

interface Uint8Array {
  /**
   * Returns the item located at the specified index.
   * @param index - The zero-based index of the desired item. A negative index will count back from the last item.
   */
  at(index: number): number | undefined;
}

interface Uint8ClampedArray {
  /**
   * Returns the item located at the specified index.
   * @param index - The zero-based index of the desired item. A negative index will count back from the last item.
   */
  at(index: number): number | undefined;
}

interface Int16Array {
  /**
   * Returns the item located at the specified index.
   * @param index - The zero-based index of the desired item. A negative index will count back from the last item.
   */
  at(index: number): number | undefined;
}

interface Uint16Array {
  /**
   * Returns the item located at the specified index.
   * @param index - The zero-based index of the desired item. A negative index will count back from the last item.
   */
  at(index: number): number | undefined;
}

interface Int32Array {
  /**
   * Returns the item located at the specified index.
   * @param index - The zero-based index of the desired item. A negative index will count back from the last item.
   */
  at(index: number): number | undefined;
}

interface Uint32Array {
  /**
   * Returns the item located at the specified index.
   * @param index - The zero-based index of the desired item. A negative index will count back from the last item.
   */
  at(index: number): number | undefined;
}

interface Float32Array {
  /**
   * Returns the item located at the specified index.
   * @param index - The zero-based index of the desired item. A negative index will count back from the last item.
   */
  at(index: number): number | undefined;
}

interface Float64Array {
  /**
   * Returns the item located at the specified index.
   * @param index - The zero-based index of the desired item. A negative index will count back from the last item.
   */
  at(index: number): number | undefined;
}

interface BigInt64Array {
  /**
   * Returns the item located at the specified index.
   * @param index - The zero-based index of the desired item. A negative index will count back from the last item.
   */
  at(index: number): bigint | undefined;
}

interface BigUint64Array {
  /**
   * Returns the item located at the specified index.
   * @param index - The zero-based index of the desired item. A negative index will count back from the last item.
   */
  at(index: number): bigint | undefined;
}
