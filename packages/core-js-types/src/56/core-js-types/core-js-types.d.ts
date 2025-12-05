// For ensuring compatibility with TypeScript standard types, this code is based on:
// https://github.com/microsoft/TypeScript/blob/2a90a739c1c1e87e3c3d0c93e16f7e5baadf8035/src/lib/es2019.array.d.ts
// License: https://github.com/microsoft/TypeScript/blob/v5.9.3/LICENSE.txt

declare global {
  interface IteratorObject<T, TReturn, TNext> extends Iterator<T, TReturn, TNext> {}

  interface AsyncIteratorObject<T, TReturn, TNext> extends AsyncIterator<T, TReturn, TNext> {
    [Symbol.asyncIterator](): AsyncIteratorObject<T, TReturn, TNext>;
  }

  interface AsyncIterableIterator<T, TReturn, TNext> extends AsyncIterator<T, TReturn, TNext> {
    [Symbol.asyncIterator](): AsyncIterableIterator<T, TReturn, TNext>;
  }

  interface PromiseFulfilledResult<T> { status: "fulfilled"; value: T; }

  interface PromiseRejectedResult { status: "rejected"; reason: any; }

  interface AsyncIterator<T, TReturn = any, TNext = any> {
    // NOTE: 'next' is defined using a tuple to ensure we report the correct assignability errors in all places.
    next(...[value]: [] | [TNext]): Promise<IteratorResult<T, TReturn>>;
    return?(value?: TReturn | PromiseLike<TReturn>): Promise<IteratorResult<T, TReturn>>;
    throw?(e?: any): Promise<IteratorResult<T, TReturn>>;
  }

  interface AsyncIteratorConstructor {}

  var AsyncIterator: AsyncIteratorConstructor;

  interface AsyncIterable<T, TReturn = any, TNext = any> {
    [Symbol.asyncIterator](): AsyncIterator<T, TReturn, TNext>;
  }
}

export type CoreJSDecoratorMetadataObject = typeof globalThis extends { DecoratorMetadataObject: infer O } // from ts 5.2
  ? O
  : Record<PropertyKey, unknown> & object;

export type CoreJSIteratorObject<T, TReturn = any, TNext = undefined> = IteratorObject<T, TReturn, TNext>;
