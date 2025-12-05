/// <reference types="./symbol.d.ts" />

// Motivation: Symbol is replaced with our own

// proposal stage: 3
// https://github.com/tc39/proposal-decorator-metadata

declare namespace CoreJS {
  // Symbol.metadata is moved to ./symbol.d.ts

  var CoreJSFunction: CoreJSFunction;

  export interface CoreJSFunction extends Function {
    [CoreJS.CoreJSSymbol.metadata]: Record<PropertyKey, unknown> & object | null;
  }
}
