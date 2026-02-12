/// <reference types="../proposals/iterator" />

declare namespace CoreJS {
  export interface CoreJSIteratorObject<T, TReturn = any, TNext = any> extends CoreJSIterator<T, TReturn, TNext> {}
}
