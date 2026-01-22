// https://github.com/tc39/proposal-iterator.range

interface IteratorRangeOptions<T> {
  step?: T;

  inclusive?: boolean;
}

interface IteratorConstructor { // @type-options no-extends
  /**
   * Returns an iterator that generates a sequence of numbers or bigints within a range.
   * @param start - The starting value of the sequence.
   * @param end - The end value of the sequence (exclusive by default).
   * @param options - Optional object:
   *   - step: The difference between consecutive values (default is 1).
   *   - inclusive: If true, the end value is included in the range (default is false).
   * @returns An iterator of numbers or bigints.
   */
  range<T>(start: T, end: T | typeof Infinity | typeof Number.NEGATIVE_INFINITY, options?: T | IteratorRangeOptions<T>): IteratorObject<T>; // @type-options prefix-return-type
}

declare var Iterator: IteratorConstructor;
