// Motivation: Iterator until TS 5.6 used undefined as TNext defaults

declare namespace CoreJS {
  export interface CoreJSIteratorObject<T, TReturn = any, TNext = undefined> extends Iterator<T, TReturn, TNext> {}
}
