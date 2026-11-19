/// <reference types="./async-iterator" />
/// <reference types="../proposals/symbol" />

declare namespace CoreJS {
  export interface CoreJSAsyncIteratorObject<T, TReturn = undefined, TNext = undefined> extends CoreJS.CoreJSAsyncIterator<T, TReturn, TNext> {
    [CoreJS.CoreJSSymbol.asyncIterator](): CoreJSAsyncIteratorObject<T, TReturn, TNext>;
  }
}
