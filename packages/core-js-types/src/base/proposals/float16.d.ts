// https://github.com/tc39/proposal-float16array

// For ensuring compatibility with TypeScript standard types, this code is aligned with:
// https://github.com/microsoft/TypeScript/blob/3e9236361fa97a9e6c685f4833ac457ae2d8c50a/tsc/internal/bundled/libs/lib.es2025.float16.d.ts
// License: https://github.com/microsoft/TypeScript/blob/v7.1-beta/LICENSE.txt

interface Math { // @type-options: no-constructor
  /**
   * Returns the nearest half precision float representation of a number.
   * @param x - A numeric expression.
   */
  f16round(x: number): number;
}

interface DataView { // @type-options: no-constructor
  /**
   * Gets the Float16 value at the specified byte offset from the start of the view. There is
   * no alignment constraint; multibyte values may be fetched from any offset.
   * @param byteOffset - The place in the buffer at which the value should be retrieved.
   * @param littleEndian - If false or undefined, a big-endian value should be read.
   */
  getFloat16(byteOffset: number, littleEndian?: boolean): number;

  /**
   * Stores a Float16 value at the specified byte offset from the start of the view.
   * @param byteOffset - The place in the buffer at which the value should be set.
   * @param value - The value to set.
   * @param littleEndian - If false or undefined, a big-endian value should be written.
   */
  setFloat16(byteOffset: number, value: number, littleEndian?: boolean): void;
}
