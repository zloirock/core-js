// proposal stage: 3
// https://github.com/tc39/proposal-decorator-metadata

import { CoreJsDecoratorMetadataObject } from './core-js-types/core-js-types.js';

declare global {
  interface SymbolConstructor {
    readonly metadata: unique symbol;
  }

  interface Function {
    [Symbol.metadata]: CoreJsDecoratorMetadataObject | null;
  }
}

export {};
