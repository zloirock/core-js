# `Symbol.metadata` for the decorator metadata proposal
[Specification](https://tc39.es/proposal-decorator-metadata/)\
[Proposal repo](https://github.com/tc39/proposal-decorator-metadata)

## Modules
[`esnext.symbol.metadata`](https://github.com/zloirock/core-js/blob/v4/packages/core-js/modules/esnext.symbol.metadata.js) and [`esnext.function.metadata`](https://github.com/zloirock/core-js/blob/v4/packages/core-js/modules/esnext.function.metadata.js).

## Built-ins signatures
```ts
class Symbol {
  static metadata: @@metadata;
}

class Function {
  @@metadata: null;
}
```

## [Entry points]({docs-version}/docs/usage#h-entry-points)
```plaintext
core-js/proposals/decorator-metadata
core-js(-pure)/full/symbol/metadata
```

## [TypeScript type definitions]({docs-version}/docs/typescript-type-definitions)
[`@core-js/types/proposals/decorator-metadata`](https://github.com/zloirock/core-js/blob/v4/packages/core-js-types/src/base/proposals/decorator-metadata.d.ts)
