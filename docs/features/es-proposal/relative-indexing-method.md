---
category: feature
tag:
  - es-proposal
  - missing-example
---

# [ES Relative indexing method](https://github.com/tc39/proposal-relative-indexing-method)

## Types

```ts
class Array {
  at(index: number): any;
}

class String {
  at(index: number): string;
}

class %TypedArray% {
  at(index: number): number;
}
```

## Entry points

```
core-js/proposals/relative-indexing-method
```
