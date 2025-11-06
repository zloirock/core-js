// proposal stage: 2.7
// https://github.com/tc39/proposal-joint-iteration

import { CoreJSIteratorObject } from '../core-js-types/core-js-types';

declare global {
  type ZipOptions = {
    mode?: "shortest" | "longest" | "strict";

    padding?: object;
  };

  interface IteratorConstructor {
    zip<T, U>(iterables: Iterable<U>, options?: ZipOptions): CoreJSIteratorObject<[T, U]>;

    zipKeyed<T, U>(iterables: Iterable<U>, options?: ZipOptions): CoreJSIteratorObject<[number, T, U]>;

    zipKeyed<T, U>(record: Record<PropertyKey, Iterable<U>>, options?: ZipOptions): CoreJSIteratorObject<[PropertyKey, T, U]>;
  }

  var Iterator: IteratorConstructor;
}

export {};
