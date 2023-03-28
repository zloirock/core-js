---
category: feature
tag:
  - es-proposal
  - missing-example
---

# [ES 相关的索引方法](https://github.com/tc39/proposal-relative-indexing-method)

## 类型

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

## 入口点

```
core-js/proposals/relative-indexing-method
```
