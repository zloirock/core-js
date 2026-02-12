interface AsyncIteratorObject<T, TReturn, TNext> extends AsyncIterator<T, TReturn, TNext> {
  [Symbol.asyncIterator](): AsyncIteratorObject<T, TReturn, TNext>;
}

interface AsyncIterableIterator<T, TReturn, TNext> extends AsyncIterator<T, TReturn, TNext> {
  [Symbol.asyncIterator](): AsyncIterableIterator<T, TReturn, TNext>;
}

interface AsyncIterator<T, TReturn = any, TNext = any> {
  // NOTE: 'next' is defined using a tuple to ensure we report the correct assignability errors in all places.
  next(...[value]: [] | [TNext]): Promise<IteratorResult<T, TReturn>>;
  return?(value?: TReturn | PromiseLike<TReturn>): Promise<IteratorResult<T, TReturn>>;
  throw?(e?: any): Promise<IteratorResult<T, TReturn>>;
}

interface AsyncIteratorConstructor {}

declare var AsyncIterator: AsyncIteratorConstructor;

interface AsyncIterable<T, TReturn = any, TNext = any> {
  [Symbol.asyncIterator](): AsyncIterator<T, TReturn, TNext>;
}
