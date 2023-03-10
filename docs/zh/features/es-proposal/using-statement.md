---
category: feature
tag:
  - es-proposal
  - missing-example
  - untranslated
---

# [`Symbol.{ asyncDispose, dispose }` for `using` statement](https://github.com/tc39/proposal-using-statement)

## Modules

- [`esnext.symbol.dispose`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.symbol.dispose.js)
- [`esnext.symbol.async-dispose`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.symbol.async-dispose.js)

## Types

```ts
class Symbol {
  static asyncDispose: @@asyncDispose;
  static dispose: @@dispose;
}
```

## Entry points

```
core-js/proposals/using-statement
core-js(-pure)/full/symbol/async-dispose
core-js(-pure)/full/symbol/dispose
```
