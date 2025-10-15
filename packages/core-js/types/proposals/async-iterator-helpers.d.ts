// proposal stage: 2
// https://github.com/tc39/proposal-async-iterator-helpers
type CoreJsAsyncIteratorObject<T> = typeof globalThis extends { AsyncIteratorObject: infer O }
  ? O
  : AsyncIterator<T>;

interface AsyncIteratorConstructor {
  from<T>(iterable: AsyncIterable<T> | Iterable<T> | CoreJsAsyncIteratorObject<T>): CoreJsAsyncIteratorObject<T>;
}

declare var AsyncIterator: AsyncIteratorConstructor;

interface AsyncIterator<T> {
  drop(limit: number): CoreJsAsyncIteratorObject<T>;

  every(predicate: (value: T, index: number) => boolean): Promise<boolean>;

  filter(predicate: (value: T, index: number) => boolean): CoreJsAsyncIteratorObject<T>;

  find(predicate: (value: T, index: number) => boolean): Promise<T>;

  flatMap(mapper: (value: T, index: number) => any): CoreJsAsyncIteratorObject<any>;

  forEach(callbackFn: (value: T, index: number) => void): Promise<void>;

  map(mapper: (value: T, index: number) => any): CoreJsAsyncIteratorObject<T>;

  reduce(reducer: (accumulator: any, value: T, index: number) => any, initialValue?: any): Promise<any>;

  some(predicate: (value: T, index: number) => boolean): Promise<boolean>;

  take(limit: number): CoreJsAsyncIteratorObject<T>;

  toArray(): Promise<T[]>;
}

interface Iterator<T> {
  toAsync(): CoreJsAsyncIteratorObject<T>;
}
