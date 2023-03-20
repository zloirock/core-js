---
category: feature
tag:
  - es-proposal
  - missing-example
---

# [`Array.prototype.includes`](https://github.com/tc39/proposal-Array.prototype.includes)

## 类型

```ts
class Array {
  includes(searchElement: any, from?: number): boolean;
}

class %TypedArray% {
  includes(searchElement: any, from?: number): boolean;
}
```

## 入口点

```
core-js/proposals/array-includes
```
