// proposal stage: 2.7
// https://github.com/tc39/proposal-iterator-sequencing
interface Iterator<T> {
  concat<U>(...iterators: Iterable<U>[]): IteratorObject<T | U>;
}
