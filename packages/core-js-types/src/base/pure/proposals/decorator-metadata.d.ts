/// <reference types="./symbol" />
/// <reference types="../core-js-types/decorator-metadata-object" />

// Motivation: Symbol is replaced with our own

// https://github.com/tc39/proposal-decorator-metadata

declare namespace CoreJS {
  // Symbol.metadata is moved to ./symbol.d.ts

  var CoreJSFunction: CoreJSFunction;

  export interface CoreJSFunction extends Function {
    [CoreJS.CoreJSSymbol.metadata]: CoreJS.CoreJSDecoratorMetadataObject | null;
  }
}
