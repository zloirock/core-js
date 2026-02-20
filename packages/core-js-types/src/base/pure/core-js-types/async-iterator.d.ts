/// <reference types="./promise" />
/// <reference types="./promise-like" />

declare namespace CoreJS {
  export interface CoreJSAsyncIterator<T, TReturn = undefined, TNext = undefined> {
    next(...[value]: [] | [TNext]): CoreJS.CoreJSPromise<IteratorResult<T, TReturn>>;

    return?(value?: TReturn | CoreJS.CoreJSPromiseLike<TReturn>): CoreJS.CoreJSPromise<IteratorResult<T, TReturn>>;

    throw?(e?: any): CoreJS.CoreJSPromise<IteratorResult<T, TReturn>>;
  }
}
