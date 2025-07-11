// proposal stage: 3
// https://github.com/tc39/proposal-decorator-metadata
interface SymbolConstructor {
  readonly metadata: unique symbol;
}

type DecoratorMetadataCoreJS = typeof globalThis extends { DecoratorMetadataObject: infer T }
  ? T
  : Record<PropertyKey, unknown> & object;

interface Function {
  [Symbol.metadata]: DecoratorMetadataCoreJS | null;
}
