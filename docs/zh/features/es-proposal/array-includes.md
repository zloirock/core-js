---
category: feature
tag:
  - es-proposal
  - missing-example
---

# [`Array.prototype.includes`](https://github.com/tc39/proposal-Array.prototype.includes)

## 类型

```ts
interface Array<T> {
  includes(searchElement: T, from?: number): boolean;
}

interface TypedArray {
  includes(searchElement: number, from?: number): boolean;
}
```

## 入口点

```
core-js/proposals/array-includes
```
