/// <reference types="../core-js-types/iterator-object" />

// https://github.com/tc39/proposal-iterator-chunking

// For ensuring compatibility with TypeScript standard types, this code is aligned with:
// https://github.com/microsoft/TypeScript/blob/3e9236361fa97a9e6c685f4833ac457ae2d8c50a/tsc/internal/bundled/libs/lib.esnext.iterator.d.ts
// License: https://github.com/microsoft/TypeScript/blob/v7.1-beta/LICENSE.txt

interface Iterator<T> {
  /**
   * Creates an iterator whose values are arrays containing successive values from this iterator.
   * @param chunkSize - The maximum number of values in each array.
   */
  chunks(chunkSize: number): IteratorObject<T[], undefined, unknown>;

  /**
   * Yields overlapping arrays (windows) of the given size from the iterator.
   * @param windowSize - The size of each window. Must be a positive integer.
   * @param undersized - 'only-full' (default) to yield only full windows | 'allow-partial' to yield all windows.
   * @returns An iterator yielding arrays of the specified window size.
   */
  windows(windowSize: number, undersized?: 'only-full' | 'allow-partial' | undefined): IteratorObject<T[], undefined, unknown>;
}
