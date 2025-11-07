// proposal stage: 2
// https://github.com/tc39/proposal-async-iterator-helpers

declare global {
  interface AsyncIteratorConstructor {
    from<T>(iterable: AsyncIterable<T> | AsyncGenerator<T> | Iterable<T> | AsyncIteratorObject<T>): AsyncIteratorObject<T>;
  }

  var AsyncIterator: AsyncIteratorConstructor;

  interface AsyncIterator<T> {
    drop(limit: number): AsyncIteratorObject<T>;

    every(predicate: (value: T, index: number) => boolean): Promise<boolean>;

    filter(predicate: (value: T, index: number) => boolean): AsyncIteratorObject<T>;

    find(predicate: (value: T, index: number) => boolean): Promise<T>;

    flatMap(mapper: (value: T, index: number) => any): AsyncIteratorObject<any>;

    forEach(callbackFn: (value: T, index: number) => void): Promise<void>;

    map(mapper: (value: T, index: number) => any): AsyncIteratorObject<T>;

    reduce(reducer: (accumulator: any, value: T, index: number) => any, initialValue?: any): Promise<any>;

    some(predicate: (value: T, index: number) => boolean): Promise<boolean>;

    take(limit: number): AsyncIteratorObject<T>;

    toArray(): Promise<T[]>;
  }

  interface Iterator<T> {
    toAsync(): AsyncIteratorObject<T>;
  }
}

export {};
