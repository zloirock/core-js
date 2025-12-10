// For ensuring compatibility with TypeScript standard types, this code is aligned with:
// https://github.com/microsoft/TypeScript/blob/2a90a739c1c1e87e3c3d0c93e16f7e5baadf8035/src/lib/es2019.array.d.ts
// https://github.com/microsoft/TypeScript/blob/6f4fb0145845db22791188c4d38e3a1a0edfd449/src/lib/es2018.asyncgenerator.d.ts
// License: https://github.com/microsoft/TypeScript/blob/v5.9.3/LICENSE.txt

declare global {
  interface IteratorObject<T, TReturn = any, TNext = any> extends Iterator<T, TReturn, TNext> {}

  interface AsyncIteratorObject<T, TReturn = any, TNext = any> extends AsyncIterator<T> {
    [Symbol.asyncIterator](): AsyncIteratorObject<T, TReturn, TNext>;
  }

  interface AsyncGenerator<T = unknown, TReturn = any, TNext = unknown> extends AsyncIteratorObject<T, TReturn, TNext> {
    next(...[value]: [] | [undefined]): Promise<IteratorResult<T, TReturn>>;
    return(value: TReturn | PromiseLike<TReturn>): Promise<IteratorResult<T, TReturn>>;
    throw(e: any): Promise<IteratorResult<T, TReturn>>;
    [Symbol.asyncIterator](): AsyncGenerator<T, TReturn, TNext>;
  }

  interface PromiseFulfilledResult<T> { status: "fulfilled"; value: T; }

  interface PromiseRejectedResult { status: "rejected"; reason: any; }

  interface AsyncIterable<T, TReturn = any, TNext = any> {
    [Symbol.asyncIterator](): AsyncIterator<T>;
  }
}

export type CoreJSDecoratorMetadataObject = typeof globalThis extends { DecoratorMetadataObject: infer O } // from ts 5.2
  ? O
  : Record<PropertyKey, unknown> & object;

export type CoreJSIteratorObject<T, TReturn = any, TNext = undefined> = IteratorObject<T, TReturn, TNext>;

export type CoreJSFlatArray<Arr, Depth extends number> = typeof globalThis extends { FlatArray: infer O } // from ts 4.4
  ? O
  : {
    done: Arr;
    recur: Arr extends ReadonlyArray<infer InnerArr> ? CoreJSFlatArray<InnerArr, [-1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20][Depth]>
      : Arr;
  }[Depth extends -1 ? "done" : "recur"];

export type CoreJSPromiseSettledResult<T> = typeof globalThis extends { PromiseSettledResult: infer O }  // from ts 3.8 and es2020
  ? O
  : PromiseFulfilledResult<T> | PromiseRejectedResult;

export type CoreJSBuiltinIteratorReturn = ReturnType<any[][typeof Symbol.iterator]> extends Iterator<any, infer TReturn>
  ? TReturn
  : any;
