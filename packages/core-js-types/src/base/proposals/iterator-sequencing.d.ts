/// <reference types="../core-js-types/iterator-object" />

// https://github.com/tc39/proposal-iterator-sequencing

interface IteratorConstructor { // @type-options: no-extends
  /**
   * Creates an iterator that sequentially yields values from the provided iterables.
   * @param iterators - The iterables to concatenate.
   * @returns An iterator yielding values from each input iterable in sequence.
   */
  concat<T extends readonly Iterable<unknown>[]>(...iterators: T): IteratorObject<T[number] extends Iterable<infer V> ? V : never, undefined, unknown>;
}

declare var Iterator: IteratorConstructor;
