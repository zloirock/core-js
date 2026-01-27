/// <reference types="../proposals/iterator.ts" />

// Motivation: Iterator until TS 5.6 used undefined as TNext defaults

declare namespace CoreJS {
  export interface CoreJSIteratorObject<T, TReturn = any, TNext = undefined> extends CoreJSIterator<T, TReturn, TNext> {}
}
