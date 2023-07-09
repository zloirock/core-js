---
category: feature
tag:
  - es-proposal
  - missing-example
---

# [`Symbol.metadata` for decorators metadata proposal](https://github.com/tc39/proposal-decorator-metadata)

## Module

- [`esnext.symbol.metadata`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.symbol.metadata.js)
- [`esnext.function.metadata`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.function.metadata.js)

## Types

```ts
interface SymbolConstructor {
  readonly metadata: unique symbol;
}

interface Function {
  [Symbol.metadata]: null;
}
```

## Entry points

```
core-js/proposals/decorator-metadata-v2
core-js(-pure)/actual|full/symbol/metadata
core-js(-pure)/actual|full/function/metadata
```
