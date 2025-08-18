# `Symbol.metadata` for decorators metadata proposal
[Proposal repo](https://github.com/tc39/proposal-decorator-metadata)

## Modules 
[`esnext.symbol.metadata`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.symbol.metadata.js) and [`esnext.function.metadata`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.function.metadata.js).

## Signature
```ts
class Symbol {
  static metadata: @@metadata;
}

class Function {
  @@metadata: null;
}
```

## [CommonJS entry points]({docs-version}/docs/usage#commonjs-api)
```ts
core-js/proposals/decorator-metadata-v2
core-js(-pure)/actual|full/symbol/metadata
core-js(-pure)/actual|full/function/metadata
```
