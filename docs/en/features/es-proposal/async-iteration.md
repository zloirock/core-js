---
category: feature
tag:
  - es-proposal
  - missing-example
---

# [`Symbol.asyncIterator` for asynchronous iteration](https://github.com/tc39/proposal-async-iteration)

## Types

```ts
interface SymbolConstructor {
  readonly asyncIterator: unique symbol;
}
```

## Entry points

```
core-js/proposals/async-iteration
```
