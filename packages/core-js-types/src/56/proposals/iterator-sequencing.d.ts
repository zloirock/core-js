// proposal stage: 2.7
// https://github.com/tc39/proposal-iterator-sequencing

import { CoreJSIteratorObject } from '../core-js-types/core-js-types';

declare global {
  interface IteratorConstructor { // @type-options no-extends
    /**
     * Creates an iterator that sequentially yields values from the provided iterables.
     * @param iterators The iterables to concatenate.
     * @returns An iterator yielding values from each input iterable in sequence.
     */
    concat<T, U>(...iterators: Iterable<U>[]): CoreJSIteratorObject<T | U>;
  }

  var Iterator: IteratorConstructor;
}

export {};
