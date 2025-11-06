// proposal stage: 4
// https://github.com/tc39/proposal-async-iteration

// For ensuring compatibility with TypeScript standard types, this code is based on:
// https://github.com/microsoft/TypeScript/blob/069de743dbd17b47cc2fc58e1d16da5410911284/src/lib/es2018.asynciterable.d.ts#L4
// License: https://github.com/microsoft/TypeScript/blob/v5.9.3/LICENSE.txt

interface SymbolConstructor {
  readonly asyncIterator: unique symbol;
}
