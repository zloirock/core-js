// proposal stage: 3
// https://github.com/tc39/proposal-decorator-metadata

import { CoreJSDecoratorMetadataObject } from '../core-js-types/core-js-types.js';

declare global {
  interface SymbolConstructor {
    readonly metadata: unique symbol;
  }

  interface Function {
    [Symbol.metadata]: CoreJSDecoratorMetadataObject | null;
  }
}

export {};
