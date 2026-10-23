// https://github.com/tc39/proposal-iterator-join

// For ensuring compatibility with TypeScript standard types, this code is aligned with:
// https://github.com/microsoft/TypeScript/blob/3e9236361fa97a9e6c685f4833ac457ae2d8c50a/tsc/internal/bundled/libs/lib.esnext.iterator.d.ts
// License: https://github.com/microsoft/TypeScript/blob/v7.1-beta/LICENSE.txt

interface Iterator<T> {
  /**
   * Creates a string by concatenating the values of this iterator, separated by the specified separator.
   * `null` and `undefined` values contribute an empty string.
   * @param separator - A string used to separate values. If omitted, a comma is used.
   */
  join(separator?: string): string;
}
