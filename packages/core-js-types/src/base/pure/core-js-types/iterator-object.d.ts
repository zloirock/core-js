/// <reference types="../proposals/iterator" />

declare namespace CoreJS {
  export interface CoreJSIteratorObject<T, TReturn = undefined, TNext = undefined> extends CoreJSIterator<T, TReturn, TNext> {
    [Symbol.iterator](): CoreJSIteratorObject<T, TReturn, TNext>;
  }
}
