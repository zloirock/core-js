interface IteratorObject<T, TReturn, TNext> extends Iterator<T, TReturn, TNext> {
  [Symbol.iterator](): IteratorObject<T, TReturn, TNext>;
}
