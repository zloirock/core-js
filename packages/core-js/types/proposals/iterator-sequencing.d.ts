// proposal stage: 2.7
// https://github.com/tc39/proposal-iterator-sequencing
interface IteratorConstructor {
  concat<T, U>(...iterators: Iterable<U>[]): CoreJsIteratorObject<T | U>;
}

declare var Iterator: IteratorConstructor;
