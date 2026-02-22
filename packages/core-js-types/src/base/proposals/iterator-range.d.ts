// https://github.com/tc39/proposal-iterator.range

interface IteratorRangeOptions<T> {
  step?: T;

  inclusive?: boolean;
}

interface IteratorConstructor { // @type-options: no-extends
  /**
   * Returns an iterator that generates a sequence of numbers within a range.
   * @param start - The starting value of the sequence.
   * @param end - The end value of the sequence (exclusive by default).
   * @param options - Optional object:
   *   - step: The difference between consecutive values (default is 1).
   *   - inclusive: If true, the end value is included in the range (default is false).
   * @returns An iterator of numbers.
   */
  range(start: number, end: number | typeof Infinity | typeof Number.NEGATIVE_INFINITY, options?: number | IteratorRangeOptions<number>): IteratorObject<number>; // @type-options: prefix-return-type

  /**
   * Returns an iterator that generates a sequence of bigints within a range.
   * @param start - The starting value of the sequence.
   * @param end - The end value of the sequence (exclusive by default).
   * @param options - Optional object:
   *   - step: The difference between consecutive values (default is 1n).
   *   - inclusive: If true, the end value is included in the range (default is false).
   * @returns An iterator of bigints.
   */
  range(start: bigint, end: bigint, options?: bigint | IteratorRangeOptions<bigint>): IteratorObject<bigint>; // @type-options: prefix-return-type
}

declare var Iterator: IteratorConstructor;
