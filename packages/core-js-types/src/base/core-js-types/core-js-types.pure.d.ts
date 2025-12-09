/// <reference types="../proposals/pure/symbol.d.ts" />
/// <reference types="../proposals/pure/iterator.d.ts" />

// For ensuring compatibility with TypeScript standard types, this code is based on:
// https://github.com/microsoft/TypeScript/blob/2a90a739c1c1e87e3c3d0c93e16f7e5baadf8035/src/lib/es2019.array.d.ts
// License: https://github.com/microsoft/TypeScript/blob/v5.9.3/LICENSE.txt

declare namespace CoreJS {
  export type CoreJSDecoratorMetadataObject = typeof globalThis extends { DecoratorMetadataObject: infer O } // from ts 5.2
    ? O
    : Record<PropertyKey, unknown> & object;
}
