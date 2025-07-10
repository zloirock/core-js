// proposal stage: 2
// https://github.com/tc39/proposal-iterator-chunking
interface Iterator<T> {
  chunks(size: number): IteratorObject<T[]>;
  sliding(size: number): IteratorObject<T[]>;
  windows(size: number): IteratorObject<T[]>;
}
