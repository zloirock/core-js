// proposal stage: 2.7
// https://github.com/tc39/proposal-iterator-sequencing

import { CoreJsIteratorObject } from './core-js-types/core-js-types';

declare global {
  interface IteratorConstructor {
    concat<T, U>(...iterators: Iterable<U>[]): CoreJsIteratorObject<T | U>;
  }

  var Iterator: IteratorConstructor;
}

export {};
