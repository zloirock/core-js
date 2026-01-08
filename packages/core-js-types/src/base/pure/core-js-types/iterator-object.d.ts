/// <reference types="../proposals/iterator.ts" />

declare namespace CoreJS {
  export interface CoreJSIteratorObject<T, TReturn = any, TNext = any> extends CoreJSIterator<T, TReturn, TNext> {}
}
