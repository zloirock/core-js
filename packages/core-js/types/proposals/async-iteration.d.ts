// proposal stage: 4
// https://github.com/tc39/proposal-async-iteration
// https://github.com/microsoft/TypeScript/blob/069de743dbd17b47cc2fc58e1d16da5410911284/src/lib/es2018.asynciterable.d.ts#L4
interface SymbolConstructor {
  readonly asyncIterator: unique symbol;
}
