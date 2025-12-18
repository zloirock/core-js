// https://github.com/bakkot/proposal-iterator-join

interface Iterator<T> {
  /**
   * Creates a string by concatenating all elements provided by the iterator, separated by the specified separator.
   * @param separator
   */
  join(separator?: unknown): string;
}
