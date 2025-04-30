// proposal stage: 3
// https://github.com/tc39/proposal-decorator-metadata
interface SymbolConstructor {
  readonly metadata: unique symbol;
}

interface Function {
  [Symbol.metadata]?: object;
}
