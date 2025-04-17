// proposal stage: 2
// https://github.com/tc39/proposal-async-iterator-helpers
interface AsyncIteratorConstructor {
  from<T>(iterable: AsyncIterable<T> | Iterable<T> | AsyncIterator<T>): AsyncIterator<T>;
}

declare const AsyncIterator: AsyncIteratorConstructor;

interface AsyncIterator<T> {
  drop(limit: number): AsyncIterator<T>;

  every(predicate: (value: T, index: number) => boolean): Promise<boolean>;

  filter(predicate: (value: T, index: number) => boolean): AsyncIterator<T>;

  find(predicate: (value: T, index: number) => boolean): Promise<T>;

  flatMap(mapper: (value: T, index: number) => any): AsyncIterator<any>;

  forEach(callbackFn: (value: T, index: number) => void): Promise<void>;

  map(mapper: (value: T, index: number) => any): AsyncIterator<T>;

  reduce(reducer: (accumulator: any, value: T, index: number) => any, initialValue?: any): Promise<any>;

  some(predicate: (value: T, index: number) => boolean): Promise<boolean>;

  take(limit: number): AsyncIterator<T>;

  toArray(): Promise<T[]>;
}

interface Iterator<T> {
  toAsync(): AsyncIterator<T>;
}
