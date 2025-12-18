// https://github.com/tc39/proposal-relative-indexing-method

// For ensuring compatibility with TypeScript standard types, this code is aligned with:
// https://github.com/microsoft/TypeScript/blob/f450c1b80ce6dc7b04e81899db00534018932234/src/lib/es2022.array.d.ts
// https://github.com/microsoft/TypeScript/blob/f450c1b80ce6dc7b04e81899db00534018932234/src/lib/es2022.string.d.ts
// License: https://github.com/microsoft/TypeScript/blob/v5.9.3/LICENSE.txt

interface String { // @type-options no-export
  /**
   * Returns a new String consisting of the single UTF-16 code unit located at the specified index.
   * @param index The zero-based index of the desired code unit. A negative index will count back from the last item.
   */
  at(index: number): string | undefined;
}

interface Array<T> { // @type-options no-export
  /**
   * Returns the item located at the specified index.
   * @param index The zero-based index of the desired code unit. A negative index will count back from the last item.
   */
  at(index: number): T | undefined;
}

interface ReadonlyArray<T> { // @type-options no-export
  /**
   * Returns the item located at the specified index.
   * @param index The zero-based index of the desired code unit. A negative index will count back from the last item.
   */
  at(index: number): T | undefined;
}

interface Int8Array { // @type-options no-export
  /**
   * Returns the item located at the specified index.
   * @param index The zero-based index of the desired code unit. A negative index will count back from the last item.
   */
  at(index: number): number | undefined;
}

interface Uint8Array { // @type-options no-export
  /**
   * Returns the item located at the specified index.
   * @param index The zero-based index of the desired code unit. A negative index will count back from the last item.
   */
  at(index: number): number | undefined;
}

interface Uint8ClampedArray { // @type-options no-export
  /**
   * Returns the item located at the specified index.
   * @param index The zero-based index of the desired code unit. A negative index will count back from the last item.
   */
  at(index: number): number | undefined;
}

interface Int16Array { // @type-options no-export
  /**
   * Returns the item located at the specified index.
   * @param index The zero-based index of the desired code unit. A negative index will count back from the last item.
   */
  at(index: number): number | undefined;
}

interface Uint16Array { // @type-options no-export
  /**
   * Returns the item located at the specified index.
   * @param index The zero-based index of the desired code unit. A negative index will count back from the last item.
   */
  at(index: number): number | undefined;
}

interface Int32Array { // @type-options no-export
  /**
   * Returns the item located at the specified index.
   * @param index The zero-based index of the desired code unit. A negative index will count back from the last item.
   */
  at(index: number): number | undefined;
}

interface Uint32Array { // @type-options no-export
  /**
   * Returns the item located at the specified index.
   * @param index The zero-based index of the desired code unit. A negative index will count back from the last item.
   */
  at(index: number): number | undefined;
}

interface Float32Array { // @type-options no-export
  /**
   * Returns the item located at the specified index.
   * @param index The zero-based index of the desired code unit. A negative index will count back from the last item.
   */
  at(index: number): number | undefined;
}

interface Float64Array { // @type-options no-export
  /**
   * Returns the item located at the specified index.
   * @param index The zero-based index of the desired code unit. A negative index will count back from the last item.
   */
  at(index: number): number | undefined;
}

interface BigInt64Array { // @type-options no-export
  /**
   * Returns the item located at the specified index.
   * @param index The zero-based index of the desired code unit. A negative index will count back from the last item.
   */
  at(index: number): bigint | undefined;
}

interface BigUint64Array { // @type-options no-export
  /**
   * Returns the item located at the specified index.
   * @param index The zero-based index of the desired code unit. A negative index will count back from the last item.
   */
  at(index: number): bigint | undefined;
}
