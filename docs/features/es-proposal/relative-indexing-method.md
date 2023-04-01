---
category: feature
tag:
  - es-proposal
  - missing-example
---

# [ES Relative indexing method](https://github.com/tc39/proposal-relative-indexing-method)

## Types

```ts
interface Array<T> {
  at(index: number): T | undefined;
}

interface String {
  at(index: number): string | undefined;
}

interface TypedArray {
  at(index: number): number | undefined;
}
```

## Entry points

```
core-js/proposals/relative-indexing-method
```
