/// <reference types="./promise" />

declare namespace CoreJS {
  export interface CoreJSAsyncIterator<T, TReturn = any, TNext = any> {
    next(...[value]: [] | [TNext]): CoreJS.CoreJSPromise<IteratorResult<T, TReturn>>;

    return?(value?: TReturn | PromiseLike<TReturn>): CoreJS.CoreJSPromise<IteratorResult<T, TReturn>>;

    throw?(e?: any): CoreJS.CoreJSPromise<IteratorResult<T, TReturn>>;
  }
}
