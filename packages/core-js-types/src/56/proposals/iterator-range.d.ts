// proposal stage: 2
// https://github.com/tc39/proposal-Number.range

declare global {
  type IteratorRangeOptions<T> = {
    step?: T;

    inclusive?: boolean;
  };

  interface IteratorConstructor {
    range<T>(start: T, end: T | typeof Infinity | typeof Number.NEGATIVE_INFINITY, options?: T | IteratorRangeOptions<T>): IteratorObject<T>
  }

  var Iterator: IteratorConstructor;
}

export {};
