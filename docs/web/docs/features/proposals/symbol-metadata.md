# `Symbol.metadata` for decorators metadata proposal
[Proposal repo](https://github.com/tc39/proposal-decorator-metadata)

## Modules 
[`esnext.symbol.metadata`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.symbol.metadata.js) and [`esnext.function.metadata`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.function.metadata.js).

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
```ts
core-js/proposals/decorator-metadata-v2
core-js(-pure)/actual|full/symbol/metadata
core-js(-pure)/actual|full/function/metadata
```
