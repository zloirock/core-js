---
category: feature
tag:
  - es-proposal
  - missing-example
---

# [装饰器元数据的 `Symbol.metadataKey` 提案](https://github.com/tc39/proposal-decorator-metadata)

## 模块

[`esnext.symbol.metadata`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.symbol.metadata.js)

## 类型

```ts
interface SymbolConstructor {
  readonly metadata: unique symbol;
}
```

## 入口点

```
core-js/proposals/decorator-metadata-v2
core-js(-pure)/full/symbol/metadata
```
