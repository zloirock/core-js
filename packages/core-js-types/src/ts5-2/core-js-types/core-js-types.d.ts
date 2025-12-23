// For ensuring compatibility with TypeScript standard types, this code is aligned with:
// https://github.com/microsoft/TypeScript/blob/2a90a739c1c1e87e3c3d0c93e16f7e5baadf8035/src/lib/es2019.array.d.ts
// https://github.com/microsoft/TypeScript/blob/6f4fb0145845db22791188c4d38e3a1a0edfd449/src/lib/es2018.asyncgenerator.d.ts
// License: https://github.com/microsoft/TypeScript/blob/v5.9.3/LICENSE.txt

declare global {
  interface IteratorObject<T, TReturn = any, TNext = any> extends Iterator<T, TReturn, TNext> {}

  interface AsyncIteratorObject<T, TReturn = any, TNext = undefined> extends AsyncIterator<T> {
    [Symbol.asyncIterator](): AsyncIteratorObject<T, TReturn, TNext>;
  }

  interface AsyncIterableIterator<T> extends AsyncIterator<T> {
    [Symbol.asyncIterator](): AsyncIterableIterator<T>;
  }

  interface AsyncGenerator<T = unknown, TReturn = any, TNext = unknown> extends AsyncIteratorObject<T, TReturn, TNext> {
    next(...[value]: [] | [undefined]): Promise<IteratorResult<T, TReturn>>;
    return(value: TReturn | PromiseLike<TReturn>): Promise<IteratorResult<T, TReturn>>;
    throw(e: any): Promise<IteratorResult<T, TReturn>>;
    [Symbol.asyncIterator](): AsyncGenerator<T, TReturn, TNext>;
  }

  interface AsyncIterator<T, TReturn = any, TNext = undefined> {
    // NOTE: 'next' is defined using a tuple to ensure we report the correct assignability errors in all places.
    next(...[value]: [] | [TNext]): Promise<IteratorResult<T, TReturn>>;
    return?(value?: TReturn | PromiseLike<TReturn>): Promise<IteratorResult<T, TReturn>>;
    throw?(e?: any): Promise<IteratorResult<T, TReturn>>;
  }

  interface AsyncIteratorConstructor {}

  var AsyncIterator: AsyncIteratorConstructor;

  interface AsyncIterable<T> {
    [Symbol.asyncIterator](): AsyncIterator<T>;
  }
}

export type CoreJSIteratorObject<T, TReturn = any, TNext = undefined> = IteratorObject<T, TReturn, TNext>;
