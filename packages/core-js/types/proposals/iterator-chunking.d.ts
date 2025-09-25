// proposal stage: 2.7
// https://github.com/tc39/proposal-iterator-chunking
interface Iterator<T> {
  chunks(size: number): IteratorObject<T[]>;
  sliding(size: number): IteratorObject<T[]>;  // todo remove after rebase
  windows(windowSize: number, undersized?: 'only-full' | 'allow-partial' | undefined): IteratorObject<T[]>;
}
