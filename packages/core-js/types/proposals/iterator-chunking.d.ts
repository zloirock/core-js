// proposal stage: 2.7
// https://github.com/tc39/proposal-iterator-chunking
interface Iterator<T> {
  chunks(chunkSize: number): IteratorObject<T[]>;
  windows(windowSize: number, undersized?: 'only-full' | 'allow-partial' | undefined): IteratorObject<T[]>;
}
