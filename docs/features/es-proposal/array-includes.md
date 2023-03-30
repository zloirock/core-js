---
category: feature
tag:
  - es-proposal
  - missing-example
---

# [`Array.prototype.includes`](https://github.com/tc39/proposal-Array.prototype.includes)

## Types

```ts
interface Array<T> {
  includes(searchElement: T, from?: number): boolean;
}

interface TypedArray {
  includes(searchElement: number, from?: number): boolean;
}
```

## Entry points

```
core-js/proposals/array-includes
```
