/// <reference types="./symbol.d.ts" />

// proposal stage: 3
// https://github.com/tc39/proposal-decorator-metadata

declare namespace CoreJS {
  var CoreJSFunction: CoreJSFunction;

  export interface CoreJSFunction extends Function {
    [CoreJS.CoreJSSymbol.metadata]: Record<PropertyKey, unknown> & object | null;
  }
}
