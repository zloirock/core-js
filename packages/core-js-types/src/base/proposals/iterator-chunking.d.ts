/// <reference types="../core-js-types/iterator-object.ts" />

// https://github.com/tc39/proposal-iterator-chunking

interface Iterator<T> {
  /**
   * Yields arrays containing up to the specified number of elements
   * chunked from the source iterator.
   * @param chunkSize The maximum number of elements per chunk. Must be a positive integer.
   * @returns An iterator yielding arrays of at most `chunkSize` elements from the source iterator.
   */
  chunks(chunkSize: number): CoreJS.CoreJSIteratorObject<T[]>;

  /**
   * Yields overlapping arrays (windows) of the given size from the iterator.
   * @param windowSize The size of each window. Must be a positive integer.
   * @param undersized 'only-full' (default) to yield only full windows | 'allow-partial' to yield all windows.
   * @returns An iterator yielding arrays of the specified window size.
   */
  windows(windowSize: number, undersized?: 'only-full' | 'allow-partial' | undefined): CoreJS.CoreJSIteratorObject<T[]>;
}
