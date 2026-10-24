// https://github.com/tc39/proposal-iterator-includes

// For ensuring compatibility with TypeScript standard types, this code is aligned with:
// https://github.com/microsoft/TypeScript/blob/3e9236361fa97a9e6c685f4833ac457ae2d8c50a/tsc/internal/bundled/libs/lib.esnext.iterator.d.ts
// License: https://github.com/microsoft/TypeScript/blob/v7.1-beta/LICENSE.txt

interface Iterator<T> {
  /**
   * Determines whether this iterator yields the specified value using SameValueZero comparison.
   * @param searchElement - The value to locate.
   * @param skippedElements - The number of values to skip before searching.
   */
  includes(searchElement: T, skippedElements?: number): boolean;
}
