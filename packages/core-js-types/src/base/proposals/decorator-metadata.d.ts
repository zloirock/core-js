/// <reference types="../core-js-types/decorator-metadata-object" />

// https://github.com/tc39/proposal-decorator-metadata

interface SymbolConstructor {
  readonly metadata: unique symbol;
}

interface Function {
  [Symbol.metadata]: CoreJS.CoreJSDecoratorMetadataObject | null;
}
